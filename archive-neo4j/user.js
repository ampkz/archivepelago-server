const bcrypt = require('bcrypt');
const { UserError, DBError, InternalError, ArchiveError, DataError } = require('../_helpers/errors');
const { connect, close, prepRecord, findResource, getResource, deleteResource, updateResource } = require('./utils');
const { getSessionOptions } = require('../_helpers/db');

//nameObj should be an object with 'firstName', 'lastName', and (optionally) 'secondName' properties.
//auth should be a role defined within the Auth class
exports.createUser = async function(email, nameObj, auth, pwd, saltRounds = 10){
    let driver, sess;

    try{
        driver = connect();
        sess = driver.session(getSessionOptions(process.env.USERS_DB));
    }catch(e){
        throw new DBError(DBError.COULD_NOT_CONNECT_TO_DB, 1001, e);
    }
    
    let user = null;

    try{
        const match = await sess.run(`MATCH(u:USER { email: $email }) RETURN u`, { email });
    
        if(match.records.length >= 1){
            user = match.records[0].get(0).properties;
        }
    }catch(e){
        await close(driver, sess);
        throw new InternalError(UserError.USER_SEARCH_ERROR, 1002, e);
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
                return user;
            }else{
                await txc.rollback();
                throw new UserError(UserError.COULD_NOT_CREATE_NEW_USER, 2002);
            }
        }catch(e){
            if(e instanceof DataError || e instanceof InternalError){
                throw e;
            }else{
                throw new InternalError(UserError.COULD_NOT_CREATE_NEW_USER, 1003, e);
            }
        }finally{
            await close(driver, sess);
        }
    }else{
        await close(driver, sess);
        throw new UserError(UserError.USER_ALREADY_EXISTS, 2001);
    }
}

exports.checkPassword = async function(email, password){
    let driver, sess;

    try{
        driver = connect();
        sess = driver.session(getSessionOptions(process.env.USERS_DB));
    }catch(e){
        throw new DBError(DBError.COULD_NOT_CONNECT_TO_DB, 1001, e);
    }
    
    try{
        const match = await sess.run(`MATCH(u:USER { email: $email }) RETURN u`, { email });
        
        if(match.records.length >= 1){
            const user = match.records[0].get(0).properties;
            const pwdMatch = await bcrypt.compare(password, user.pwd);

            if(pwdMatch === true){
                delete user.pwd;
                return user;
            }else{
                throw 401;
            }
        }else{
            throw 401
        }
    }catch(e){
        if(e === 401){
            throw 401;
        }else{
            throw new InternalError(UserError.USER_SEARCH_ERROR, 1002, e);
        }
    }finally{
        await close(driver, sess);
    }
}

exports.getUsers = function(){
    return getResource(findResource, [`MATCH (u:USER) RETURN u`, {}, null, process.env.USERS_DB], [0], process.env.USERS_DB);
}

exports.getUser = function(id){
    return getResource(findResource, ['MATCH (u:USER {id: $id}) RETURN u', {id}, null, process.env.USERS_DB]);
}

exports.deleteUser = function(id){
    return deleteResource(findResource, ['MATCH (u:USER {id: $id}) RETURN u', {id}, null, process.env.USERS_DB], 'MATCH (u:USER {id: $id}) DELETE u RETURN u', {id}, 1, null, process.env.USERS_DB);
}

exports.updateUser = function(id, email, nameObj, auth){
    return updateResource('MATCH (u:USER {id: $id}) RETURN u', {id}, null, 'MATCH (u:USER {id: $id}) SET u.email = $email, u.firstName = $firstName, u.secondName = $secondName, u.lastName = $lastName, u.auth = $auth RETURN u', {id, email, auth, firstName: nameObj.firstName, secondName: nameObj.secondName || '', lastName: nameObj.lastName}, [0], process.env.USERS_DB)
}

exports.updatePassword = async function(id, password, saltRounds = 10){
    let driver, sess;

    try{
        driver = connect();
        sess = driver.session(getSessionOptions(process.env.USERS_DB));
    }catch(e){
        throw new DBError(DBError.COULD_NOT_CONNECT_TO_DB, 1001, e);
    }
    
    try{
        const pwdHash = await bcrypt.hash(password, saltRounds);
        const match = await sess.run(`MATCH(u:USER { id: $id }) SET u.pwd = $pwdHash RETURN u`, { id, pwdHash });
        
        if(match.records.length >=1)
        {
            return "updated";
        }else{
            throw new ArchiveError(ArchiveError.COULD_NOT_FIND_RESOURCE, 2003);
        }
    }catch(e){
        if(e instanceof DataError || e instanceof InternalError){
            throw e;
        }else{
            throw new InternalError(UserError.USER_SEARCH_ERROR, 1002, e);
        }
    }finally{
        await close(driver, sess);
    }
}