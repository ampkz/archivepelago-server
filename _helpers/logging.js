/* eslint-disable no-undef */
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

function logError(error, req = null){
    const uuid = uuidv4();
    const date = (new Date()).toISOString().substr(0,10);
    const path = __basedir + process.env.ERROR_LOG_DIR + date + '.log';
    fs.appendFileSync( path, `${error.code}\t${uuid}\n${(new Date()).toString()}\n${req !== null ? `${req.ip} ${req.method} ${req.originalUrl}\n` : ``}ERROR: ${error.toString()}\n\n`);
    return {uuid, date};
}

module.exports = {
    logError
}