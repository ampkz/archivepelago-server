const bcrypt = require('bcrypt');
const { UserError, DBError, InternalError, ArchiveError } = require('../_helpers/errors');
const { connect, close, prepRecord, findResource, getResource, deleteResource } = require('./utils');
const { getSessionOptions } = require('../_helpers/db');


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