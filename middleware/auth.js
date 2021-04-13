const jwt = require('jsonwebtoken');
const { sendError401 } = require('./errors');
const { Auth } = require('../_helpers/auth');

function permitRoles(...rolesPermitted) {
    return (req, res, next) => {
        try{
            if(req.cookies.jwt){
                const token = req.cookies.jwt;
                
                // eslint-disable-next-line no-undef
                jwt.verify(token, process.env.TOKEN_SECRET, function(err, decoded){
                    if(decoded && (rolesPermitted.includes(decoded.auth) || (rolesPermitted.includes(Auth.SAME_ID) && decoded.id === req.params.id))){
                        next();
                    }else{
                        return res.status(403).end();
                    }
                });
            }else{
                return sendError401(res);
            }
        }catch(e){
            return sendError401(res);
        }
    }
}

module.exports = {
    permitRoles
}