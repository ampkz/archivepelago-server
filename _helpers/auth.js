const jwt = require("jsonwebtoken");
const { EscalationError } = require("./errors");

class Auth {
    static ADMIN = "admin";
    static CONTRIBUTOR = "contributor";
    static SAME_ID = "same id";
    static ROLES = [ Auth.ADMIN, Auth.CONTRIBUTOR ];

    static isARole = function(role){
        return (Auth.ROLES.indexOf(role) === -1 ? false : true);
    }
}

const signToken = function(id, auth, expiresIn){
    return jwt.sign({id, auth}, process.env.TOKEN_SECRET, {expiresIn});
}

const checkRoleEscalation = function (token, requestedRole){
    const escalationError = new EscalationError();
    
    try{
        jwt.verify(token, process.env.TOKEN_SECRET, function(err, decoded){
            if(decoded) {
                if(requestedRole !== decoded.auth && decoded.auth !== Auth.ADMIN) escalationError.addError(EscalationError.MUST_BE_ADMIN);
            }
        });
    }catch(e){
        escalationError.addError(e);
    }

    return escalationError;
}

module.exports = {
    Auth,
    signToken,
    checkRoleEscalation
}