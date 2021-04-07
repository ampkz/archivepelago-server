const jwt = require("jsonwebtoken");

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

module.exports = {
    Auth,
    signToken
}