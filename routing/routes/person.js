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

  archiveNeo4jPerson.createPerson(lastName, firstName || '', secondName || '')
    .then((person) => {
      res.set('Location', `/${person.record.properties.id}`).status(201).json(person.record.properties);
    })
    .catch((error) => {
      return handleResourceError(error, next, req);
    })

}