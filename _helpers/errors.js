class DataError extends Error {
  constructor(message, code, data = null) {
    super(message);
    this.name = 'UserError';
    this.data = data;
    this.code = code;
  }
}

class UserError extends DataError {
  static USER_ALREADY_EXISTS = "User Already Exists";
  static COULD_NOT_FIND_USER = "Could Not Find User";  
  static COULD_NOT_CREATE_NEW_USER = "Could Not Create New User";
  static COULD_NOT_DELETE_USER = "Could Not Delete User";
  static USER_SEARCH_ERROR = "User Search Error";
  static COULD_NOT_UPDATE_USER = "Could Not Update User";
}

class ArchiveError extends DataError {
  static COULD_NOT_CREATE_RESOURCE = "Could Not Create Resource";
  static COULD_NOT_FIND_RESOURCE = "Could Not Find Resource";
  static COULD_NOT_DELETE_RESOURCE = "Could Not Delete Resource";
  static COULD_NOT_UPDATE_RESOURCE = "Could Not Update Resource";
  static GEO_LOCATION_WITHIN_THRESHOLD = "Geo Location Is Within Threshold";
  static RESOURCE_ALREADY_EXISTS = "Resource Already Exits";
  static RESOURCE_SEARCH_ERROR = "Resource Search Error";
  static RESOURCE_HAS_RELATIONSHIPS = "Resource Has Existing Relationships";
  static COULD_NOT_PREP_RECORD = "Could Not Prep Record";
  static NODES_DELETED_UNEXPECTED_NUMBER = "Nodes Tried To Delete Unexpected Number";
  static COULD_NOT_ATTACH_CHILD_TO_PARENT_RESOURCE = "Could Not Attach Child to Parent Resource";
  static RECOVER_ACCOUNT = "Recover Account";
  static COULD_NOT_CREATE_RELATIONSHIP = "Could Not Create Relationship";
}

class RoutingError extends DataError {
  static INVALID_REQUEST = "Invalid Request";
  static UPDATE_DATE_DENIED = "Use existing date or create new one instead of updating.";
}

class InternalError {
  constructor(message, code, error){
    this.message = message;
    this.error = error;
    this.status = 500;
    this.code = code;
    this.name = "ServerError";
  }

  toString(){
    return this.message + ": " + this.error.toString();
  }
}

class DBError extends InternalError {
  static COULD_NOT_CONNECT_TO_DB = "Could Not Connect to Database";
  static STILL_HAS_RELATIONSHIPS_ERROR_STR = "Resouce Still Has Relationships";
}

class FieldError extends DataError {
  static REQUIRED = "Required";
  static REQUIRED_KEEP_SAME = "Required (Keep Same If Not Changing)";
  static REQUIRED_WITH = "Required With:";
  static CANNOT_BE_EMPTY = "Cannot Be Empty";
  static CANNOT_CONTAIN_NULL_BYTE = "Cannot Contain Null Bytes";
  static INVALID_TYPE = "Invalid Type";
  static INVALID = "Invalid - See Docs For Allowable Characters";

  constructor(message, code){
    super(message, code, []);
    this.status = 400;
  };
  
  addFieldError(field, message){
    this.data.push({field, message});
  }

  hasErrors(){
    return this.data.length > 0;
  }

}

module.exports = {
  UserError,
  ArchiveError,
  RoutingError,
  DBError,
  InternalError,
  FieldError
}