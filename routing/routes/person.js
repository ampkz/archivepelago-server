const { FieldError, RoutingError } = require('../../_helpers/errors');
const archiveNeo4jPerson = require('../../archive-neo4j/person');
const { handleResourceError } = require('./utils');

exports.createPerson = function(req, res, next){
  const { lastName, firstName, secondName } = req.body;

  const required = new FieldError(RoutingError.INVALID_REQUEST, 3000);

  if(!lastName) required.addFieldError('lastName', FieldError.REQUIRED);

  if(required.hasErrors()){
    return next(required);
  }

  archiveNeo4jPerson.createPerson(lastName, firstName, secondName)
    .then((person) => {
      return res.set('Location', `/${person.record.properties.id}`).status(201).json(person.record.properties);
    })
    .catch((error) => {
      return handleResourceError(error, next, req);
    })

}

exports.getPeople = function(req, res, next){
  archiveNeo4jPerson.getPeople()
  .then((people) => {
    if(!people.map) people = [people];
    return res.status(200).json(people.map((person) => { return person.properties }));
  })
  .catch((error) => {
    return handleResourceError(error, next, req);
  })
}

exports.getPerson = function(req, res, next){
  const { personId } = req.params;

  archiveNeo4jPerson.getPerson(personId)
    .then((person) => {
      return res.status(200).json(person.properties);
    })
    .catch((error) => {
      return handleResourceError(error, next, req);
    })
}

exports.deletePerson = function(req, res, next){
  const { personId } = req.params;

  archiveNeo4jPerson.deletePerson(personId)
    .then(() => {
      return res.status(204).end();
    })
    .catch((error) => {
      return handleResourceError(error, next, req);
    })
}

exports.updatePerson = function(req, res, next){
  const { lastName, firstName, secondName } = req.body;
  const { personId } = req.params;

  const required = new FieldError(RoutingError.INVALID_REQUEST, 3000);

  if(!lastName) required.addFieldError('lastName', FieldError.REQUIRED);

  if(required.hasErrors()){
    return next(required);
  }

  archiveNeo4jPerson.updatePerson(personId, lastName, firstName, secondName)
    .then((person) => {
      return res.status(200).json(person.record.properties);
    })
    .catch((error) => {
      return handleResourceError(error, next, req);
    })
}