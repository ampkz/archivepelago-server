const { ArchiveError } = require('../../_helpers/errors');
const { createError } = require("../../middleware/errors");
const { logError } = require('../../_helpers/logging');

exports.handleResourceError = function(error, next, req){
    let status,
        message = error.message,
        data = error.data,
        code = error.code;

    switch(error.message){
        case ArchiveError.COULD_NOT_FIND_RESOURCE:
            status = 404;
            break;
        case ArchiveError.GEO_LOCATION_WITHIN_THRESHOLD:
        case ArchiveError.RESOURCE_HAS_RELATIONSHIPS:
        case ArchiveError.RESOURCE_ALREADY_EXISTS:
            status = 409;
            break;
        default:
            status = 500;
            break;
    }
    
    if(status === 500){
        return exports.processError(error, next, req);
    }else{
        return next(createError(status, message, code, data));
    }
}

exports.processError = function(error, next, req){
    // console.log(error);
    let uuidDate = null;
    if(process.env.LOG_ERRORS === "true") uuidDate = logError(error, req);
    return next(createError(500, error.message, error.code, `${uuidDate !== null ? `REF: ${uuidDate.uuid} DATE: ${uuidDate.date}` : ``}`));
}

//returnProps:  null to copy all properties
//              array of properties to copy those specific properties
//              false (or any other value) to copy no properties
exports.prepReturnObj = function(obj, returnProps=null, returnLabels=true){
    let returnObj = {properties: {}};
    
    if(returnProps === null){
        returnObj.properties = obj.properties;
    }else if(Array.isArray(returnProps)){
        returnProps.forEach(prop => {
            returnObj.properties[prop] = obj.properties[prop];
        })
    }
    
    if(returnLabels) returnObj.labels = obj.labels;
    return returnObj;
}