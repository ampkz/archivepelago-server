const bcrypt = require('bcrypt');
const { UserError, DBError, InternalError, ArchiveError } = require('../_helpers/errors');
const { connect, close, prepRecord, findResource, getResource, deleteResource, updateResource } = require('./utils');
const { getSessionOptions } = require('../_helpers/db');

//REM: FIX PROMISE ANTI-PATTERN

//nameObj should be an object with 'firstName', 'lastName', and (optionally) 'secondName' properties.
//auth should be a role defined within the Auth class
exports.createUser = function(email, nameObj, auth, pwd, saltRounds = 10){
    
    const promise = new Promise((resolve, reject) => {
        (async () => {
            let driver, sess;

            try{
                driver = connect();
                // eslint-disable-next-line no-undef
                sess = driver.session(getSessionOptions(process.env.USERS_DB));
            }catch(e){
                reject(new DBError(DBError.COULD_NOT_CONNECT_TO_DB, 1001, e));
                return;
            }
            
            let user = null;
    
            try{
                const match = await sess.run(`MATCH(u:USER { email: $email }) RETURN u`, { email });
            
                if(match.records.length >= 1){
                    user = match.records[0].get(0).properties;
                }
            }catch(e){
                await close(driver, sess);
                reject(new InternalError(UserError.USER_SEARCH_ERROR, 1002, e));
                return;
            }
    
            if(user === null){
                try{
                    const pwdHash = await bcrypt.hash(pwd, saltRounds);
                    const txc = sess.beginTransaction();
                    
                    const match = await txc.run(`CREATE(u:USER { id:apoc.create.uuid(), email: $email, firstName: $firstName, secondName: $secondName, lastName: $lastName, auth: $auth, pwd: $pwdHash}) RETURN u`, { firstName: nameObj.firstName, secondName: nameObj.secondName || '', lastName: nameObj.lastName, email, pwdHash, auth });
                    
                    if(match.records.length === 1){
                        await txc.commit();
                        user = prepRecord(match.records[0]);
                        delete user.properties.pwd;
                        resolve(user);
                        return;
                    }else{
                        await txc.rollback();
                        reject(new UserError(UserError.COULD_NOT_CREATE_NEW_USER, 2002));
                        return;
                    }
                }catch(e){
                    reject(new InternalError(UserError.COULD_NOT_CREATE_NEW_USER, 1003, e));
                    return;
                }finally{
                    await close(driver, sess);
                }
            }else{
                await close(driver, sess);
                reject(new UserError(UserError.USER_ALREADY_EXISTS, 2001));
                return;
            }
        })()
    });

    return promise;
}

exports.checkPassword = function(email, password){
    
    const promise = new Promise((resolve, reject) => {
        (async () => {
            let driver, sess;

            try{
                driver = connect();
                // eslint-disable-next-line no-undef
                sess = driver.session(getSessionOptions(process.env.USERS_DB));
            }catch(e){
                reject(new DBError(DBError.COULD_NOT_CONNECT_TO_DB, 1001, e));
                return;
            }
            
            try{
                const match = await sess.run(`MATCH(u:USER { email: $email }) RETURN u`, { email });
                
                if(match.records.length >= 1){
                    const user = match.records[0].get(0).properties;
                    const pwdMatch = await bcrypt.compare(password, user.pwd);
    
                    if(pwdMatch === true){
                        delete user.pwd;
                        resolve(user);
                        return;
                    }else{
                        reject(401);
                        return;
                    }
                }else{
                    reject(401);
                    return;
                }
            }catch(e){
                reject(new InternalError(UserError.USER_SEARCH_ERROR, 1002, e));
                return;
            }finally{
                await close(driver, sess);
            }
        })();
        
    });

    return promise;

}

exports.getUsers = function(){
    // eslint-disable-next-line no-undef
    return getResource(findResource, [`MATCH (u:USER) RETURN u`, {}, null, process.env.USERS_DB], [0], process.env.USERS_DB);
}

exports.getUser = function(id){
    // eslint-disable-next-line no-undef
    return getResource(findResource, ['MATCH (u:USER {id: $id}) RETURN u', {id}, null, process.env.USERS_DB]);
}

exports.deleteUser = function(id){
    // eslint-disable-next-line no-undef
    return deleteResource(findResource, ['MATCH (u:USER {id: $id}) RETURN u', {id}, null, process.env.USERS_DB], 'MATCH (u:USER {id: $id}) DELETE u RETURN u', {id}, 1, null, process.env.USERS_DB);
}

exports.updateUser = function(id, email, nameObj, auth){
    // eslint-disable-next-line no-undef
    return updateResource('MATCH (u:USER {id: $id}) RETURN u', {id}, null, 'MATCH (u:USER {id: $id}) SET u.email = $email, u.firstName = $firstName, u.secondName = $secondName, u.lastName = $lastName, u.auth = $auth RETURN u', {id, email, auth, firstName: nameObj.firstName, secondName: nameObj.secondName || '', lastName: nameObj.lastName}, [0], process.env.USERS_DB)
}

exports.updatePassword = function(id, password, saltRounds = 10){
    const promise = new Promise((resolve, reject) => {
        (async () => {
            let driver, sess;

            try{
                driver = connect();
                // eslint-disable-next-line no-undef
                sess = driver.session(getSessionOptions(process.env.USERS_DB));
            }catch(e){
                reject(new DBError(DBError.COULD_NOT_CONNECT_TO_DB, 1001, e));
                return;
            }
            
            try{
                const pwdHash = await bcrypt.hash(password, saltRounds);
                const match = await sess.run(`MATCH(u:USER { id: $id }) SET u.pwd = $pwdHash RETURN u`, { id, pwdHash });
                
                if(match.records.length >=1)
                {
                    resolve("updated");
                    return;
                }else{
                    reject(new ArchiveError(ArchiveError.COULD_NOT_FIND_RESOURCE, 2003));
                    return;
                }
            }catch(e){
                reject(new InternalError(UserError.USER_SEARCH_ERROR, 1002, e));
                return;
            }finally{
                await close(driver, sess);
            }
        })();
        
    });

    return promise;
}