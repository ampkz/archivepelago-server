const { findResource, getResource, createResource } = require('./utils');

exports.createPerson = function(lastName, firstName, secondName) {
  return createResource(null, {lastName, firstName, secondName}, `CREATE (p:PERSON {id:apoc.create.uuid(), firstName: $firstName, lastName: $lastName, secondName: $secondName}) RETURN p`);
}

exports.getPeople = function(){
  return getResource(findResource, [`MATCH (p:PERSON) RETURN p`]);
}