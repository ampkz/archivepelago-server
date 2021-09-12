// eslint-disable-next-line
function errorHandler(error, req, res, next){
    const err = { code: error.code };
    err.message = error.message || "Something's not right.";
    if(error.data) {
        err.errors = error.data;
    }
    
    return res.status(error.status || 500)
        .json(err);
}

function sendError401(res){
    // eslint-disable-next-line no-undef
    return res.set('WWW-Authenticate', `xBasic realm="${process.env.AUTH_REALM}"`).status(401).end();
}

function createError(status, message, code, data=null){
    const err = new Error(message);
    err.status = status;
    err.data = data;
    err.code = code;
    return err;
}

function sendStatus405(allow){
    return (req, res) => {
        res.set('Allow', allow).status(405).end();
    }
}

module.exports = {
    errorHandler,
    sendError401,
    createError,
    sendStatus405
}