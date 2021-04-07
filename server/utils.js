/* eslint-disable no-undef */
require('dotenv').config();
const { connect, close } = require("../archive-neo4j/utils");
const { Auth } = require('../_helpers/auth');
const { Archive } = require('../_helpers/archive');
const bcrypt = require('bcrypt');
const { getSessionOptions } = require('../_helpers/db');

exports.serverInit = function (logging=true){
    
    const promise = new Promise ((resolve, reject) => {
        (async () => {
            if(logging) console.log("Initializing Server...");

            const driver = connect();
            let session = driver.session(),
                match;
            
            try {
                match = await session.run(`CREATE DATABASE ${getSessionOptions(process.env.USERS_DB).database} IF NOT EXISTS WAIT`);
                match = await session.run(`CREATE DATABASE ${getSessionOptions(process.env.ARCHIVE_DB).database} IF NOT EXISTS WAIT`);
                await session.close();
                session = driver.session(getSessionOptions(process.env.ARCHIVE_DB));
                match = await session.run('CREATE CONSTRAINT person_id_constraint IF NOT EXISTS ON (p:PERSON) ASSERT p.id IS UNIQUE');
                if(logging && match.summary.counters._stats.constraintsAdded === 1) console.log('Person ID Constraint Created');
                match = await session.run(`CREATE CONSTRAINT collection_id_constraint IF NOT EXISTS ON (c:${Archive.COLLECTION}) ASSERT c.id IS UNIQUE`);
                if(logging && match.summary.counters._stats.constraintsAdded === 1) console.log('Collection ID Constraint Created');
                match = await session.run(`CREATE CONSTRAINT repository_id_constraint IF NOT EXISTS ON (r:${Archive.REPOSITORY}) ASSERT r.id IS UNIQUE`);
                if(logging && match.summary.counters._stats.constraintsAdded === 1) console.log('Repository ID Constraint Created');
                match = await session.run(`CREATE CONSTRAINT library_id_constraint IF NOT EXISTS ON (l:${Archive.LIBRARY}) ASSERT l.id IS UNIQUE`);
                if(logging && match.summary.counters._stats.constraintsAdded === 1) console.log('Library ID Constraint Created');
                match = await session.run(`CREATE CONSTRAINT institution_id_constraint IF NOT EXISTS ON (i:${Archive.INSTITUTION}) ASSERT i.id IS UNIQUE`);
                if(logging && match.summary.counters._stats.constraintsAdded === 1) console.log('Institution ID Constraint Created');
                await session.close();
                session = driver.session(getSessionOptions(process.env.USERS_DB));
                match = await session.run('CREATE CONSTRAINT user_email_constraint IF NOT EXISTS ON (u:USER) ASSERT u.email IS UNIQUE');
                if(logging && match.summary.counters._stats.constraintsAdded === 1) console.log('User E-mail Constraint Created');
                match = await session.run('CREATE CONSTRAINT user_id_constraint IF NOT EXISTS ON (u:USER) ASSERT u.id IS UNIQUE');
                if(logging && match.summary.counters._stats.constraintsAdded === 1) console.log('User ID Constraint Created');
                await session.close();
            }catch(e){
                await close(driver, session);
                reject({ error: e });
                return;
            }

            try{
                session = driver.session(getSessionOptions(process.env.USERS_DB));
                match = await session.run('MATCH(u:USER { auth: $auth }) RETURN u', {auth: Auth.ADMIN});

                if(match.records.length >= 1) {
                    await close(driver, session);
                    reject("Server has already been initialized.");
                    return;
                }else{
                    const pwdHash = await bcrypt.hash('admin', 10);
                    const txc = session.beginTransaction();

                    match = await txc.run(`CREATE(u:USER { id:apoc.create.uuid(), email: $email, auth: $auth, pwd: $pwdHash }) return u`, { email: 'admin', auth: Auth.ADMIN, pwdHash});
                    if(match.records.length === 1){
                        await txc.commit();
                        await close(driver, session);
                        resolve("Successfully Initialized Server");
                        return;
                    }else{
                        const records = match.records;
                        await txc.rollback();
                        await close(driver, session);
                        reject({ error: records });
                        return;
                    }
                }
            }catch(e){
                await close(driver, session);
                reject({ error: e });
            }
        })()
    });

    return promise;
    
}

exports.destroyTestingDBs = function(){
    const promise = new Promise( (resolve, reject) => {
        (async () => {
            const driver = connect();
            let session = driver.session({database: `${process.env.ARCHIVE_DB}test`});

            try{
                await session.run('CALL apoc.trigger.removeAll()');
                await session.run(`DROP DATABASE ${process.env.USERS_DB}test IF EXISTS DESTROY DATA WAIT`);
                await session.run(`DROP DATABASE ${process.env.ARCHIVE_DB}test IF EXISTS DESTROY DATA WAIT`);
                resolve();
                return;
            }catch(e){
                reject(e);
                return;
            }finally{
                await close(driver, session);
            }

        })();
    });

    return promise;
}