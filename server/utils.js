/* eslint-disable no-undef */
require('dotenv').config();
const { connect, close } = require("../archive-neo4j/utils");
const { Auth } = require('../_helpers/auth');
const { Archive } = require('../_helpers/archive');
const { getSessionOptions } = require('../_helpers/db');
const readline = require('readline');
const Writable = require('stream').Writable;
const archiveNeo4jUsers = require('../archive-neo4j/users');

let mutableStdout = new Writable({
    write: function(chunk, encoding, callback) {
        if (!this.muted)
        process.stdout.write(chunk, encoding);
        callback();
    }
});

mutableStdout.muted = false;

const rl = readline.createInterface({
    input: process.stdin,
    output: mutableStdout,
    terminal: true
})

const fieldQ = (field) => {
    return new Promise((resolve) => {
            rl.question(`Please enter admin ${field}: `, (answer) => {
            resolve(answer);
        });
    });
}

const pwdQ = (verify=false) => {
    return new Promise((resolve) => {
            mutableStdout.muted = false;
            rl.question(`Please ${verify ? 'verify' : 'enter'} admin password: `, (answer) => {
            resolve(answer);
        });
        mutableStdout.muted = true;
    });
}


exports.serverInit = function (logging=true, defaultAdmin = false){
    
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
                    reject("Admin already exists.");
                    return;
                }else{
                    if(defaultAdmin){
                        try{
                            const user = await archiveNeo4jUsers.createUser('admin', {firstName: 'admin', lastName: 'admin'}, Auth.ADMIN, 'admin');
                            resolve(user);
                            return;
                        }catch(e){
                            reject(e);
                            return;
                        }finally{
                            await close(driver, session);
                        }
                    }else{
                        const email = await fieldQ('email');
                        const firstName = await fieldQ('first name');
                        const secondName = await fieldQ('second/middle name (leave blank if none)');
                        const lastName = await fieldQ('last name');
                        let password = '';
                        let confirmPassword = ' ';
                        do{
                            password = await pwdQ(false);
                            confirmPassword = await pwdQ(true);
                            if(password !== confirmPassword) console.log('\nPasswords do not match. Try Again.');
                        }while(password !== confirmPassword)

                        try{
                            await archiveNeo4jUsers.createUser(email, {firstName, lastName, secondName}, Auth.ADMIN, password);
                            resolve('\nSuccessfully created admin.');
                            return;
                        }catch(e){
                            reject(e);
                            return;
                        }finally{
                            await close(driver, session);
                        }
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