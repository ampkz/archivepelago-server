const { Auth, signToken } = require('../../_helpers/auth');
const { UserError, RoutingError, FieldError, ArchiveError } = require('../../_helpers/errors');
const archiveNeo4jUsers = require('../../archive-neo4j/users');
const { sendError401, createError } = require("../../middleware/errors");
const { processError, handleResourceError } = require('./utils');

exports.createUser = function(req, res, next){
    const { email, firstName, lastName, secondName, auth, password } = req.body;
    
    const required = new FieldError(RoutingError.INVALID_REQUEST, 3000)

    if(!email) required.addFieldError('email', FieldError.REQUIRED);
    if(!firstName) required.addFieldError('firstName', FieldError.REQUIRED);
    if(!lastName) required.addFieldError('lastName', FieldError.REQUIRED);
    if(!password) required.addFieldError('password', FieldError.REQUIRED);
    if(!auth) required.addFieldError('auth', FieldError.REQUIRED);

    if(required.hasErrors()){
        return next(required);
    }

    const valid = new FieldError(RoutingError.INVALID_REQUEST, 3001);

    if ( !Auth.isARole(auth) ) valid.addFieldError('auth', FieldError.INVALID_TYPE);

    if(valid.hasErrors()){
        return next(valid);
    }
    
    const nameObj = { firstName, lastName, secondName };

    archiveNeo4jUsers.createUser(email, nameObj, auth, password)
        .then(user => {
            res.set('Location', `/${user.properties.id}`).status(201).json(user.properties);
        })
        .catch(error => {
            let status,
                message = error.message,
                data = error.data,
                code = error.code;

            switch(error.message){
                case UserError.USER_ALREADY_EXISTS:
                    status = 200;
                    message = ArchiveError.RECOVER_ACCOUNT;
                    data = { created: false };
                    code = 1011;
                    break;
                case UserError.COULD_NOT_CREATE_NEW_USER:
                default:
                    status = 500;
                    break;
            }
            
            if(status === 500){
                return processError(error, next, req);
            }else{
                return next(createError(status, message, code, data));
            }
        });
}


exports.authenticate = function(req, res, next){
    const { email, password } = req.body;

    const required = new FieldError(RoutingError.INVALID_REQUEST, 3000);

    if(!email) required.addFieldError('email', FieldError.REQUIRED);
    if(!password) required.addFieldError('password', FieldError.REQUIRED);
    
    if(required.hasErrors()){
        return next(required);
    }

    archiveNeo4jUsers.checkPassword(email, password)
        .then(user =>{
            // eslint-disable-next-line no-undef
            res.status(204).cookie('jwt', signToken(user.id, user.auth, process.env.TOKEN_EXPIRATION), {httpOnly: true, maxAge: Number(process.env.COOKIE_EXPIRATION)}).end();
            // res.status(200).json({token: signToken(user.id, user.auth, '1d')});
        })
        .catch(error => {
            if(error === 401)
            {
                return sendError401(res);
            }else{
                return processError(error, next, req);
            }
        })
}

const prepReturnUser = function(user){
    const preppedUser = user.properties;
    delete preppedUser.pwd;
    return preppedUser;
}

exports.getUsers = function(req, res, next){
    archiveNeo4jUsers.getUsers()
        .then(users => {
            if(!users.map) users = [users];
            res.status(200).json(users.map(user => { return prepReturnUser(user);}));
        })
        .catch(error => {
            return handleResourceError(error, next, req);
        })
}

exports.getUser = function(req, res, next){
    const { userId } = req.params;

    archiveNeo4jUsers.getUser(userId)
        .then(user => {
            res.status(200).json(prepReturnUser(user))
        })
        .catch(error => {
            return handleResourceError(error, next, req);
        })
}