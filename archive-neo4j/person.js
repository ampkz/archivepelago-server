const { findResource, getResource, createResource, deleteResource, updateResource } = require('./utils');

exports.createPerson = function(lastName, firstName, secondName) {
  return createResource(null, {lastName, firstName: firstName || '', secondName: secondName || ''}, `CREATE (p:PERSON {id:apoc.create.uuid(), firstName: $firstName, lastName: $lastName, secondName: $secondName}) RETURN p`);
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

exports.updatePerson = function(id, lastName, firstName, secondName){
  return updateResource('MATCH (p:PERSON {id: $id}) RETURN p', {id}, null, 'MATCH (p:PERSON {id: $id}) SET p.lastName = $lastName, p.firstName = $firstName, p.secondName = $secondName RETURN p', {id, lastName, firstName: firstName || '', secondName: secondName || ''});
}