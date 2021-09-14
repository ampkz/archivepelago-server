const { findResource, getResource, createResource, deleteResource } = require('./utils');

exports.createPerson = function(lastName, firstName, secondName) {
  return createResource(null, {lastName, firstName, secondName}, `CREATE (p:PERSON {id:apoc.create.uuid(), firstName: $firstName, lastName: $lastName, secondName: $secondName}) RETURN p`);
}

exports.getPeople = function(){
  return getResource(findResource, [`MATCH (p:PERSON) RETURN p`]);
}

exports.getPerson = function(id){
  return getResource(findResource, [`MATCH (p:PERSON {id: $id}) RETURN p`, {id}]);
}

exports.deletePerson = function(id){
  return deleteResource(findResource, ['MATCH (p:PERSON {id:$id}) return p', {id}], 'MATCH (p:PERSON {id:$id}) DELETE p RETURN p', {id});
}