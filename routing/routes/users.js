const { Auth, signToken } = require('../../_helpers/auth');
const { UserError, RoutingError, FieldError, ArchiveError } = require('../../_helpers/errors');
const archiveNeo4jUsers = require('../../archive-neo4j/users');
const { sendError401, createError } = require("../../middleware/errors");
const { processError, handleResourceError } = require('./utils');


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
            res.status(200).json({token: signToken(user.id, user.auth, '1d')});
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