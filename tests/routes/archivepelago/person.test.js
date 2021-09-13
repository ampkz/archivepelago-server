/* eslint-disable no-undef */
/**
 * Archive dates routes
 * 
 * @group routes/person
 * @group integration
 */

const server = require('../../../server/server');
const { serverInit, destroyTestingDBs } = require('../../../server/utils');
const supertest = require("supertest");
const uriConfig = require('../../../routing/uriConfig');
// const { RoutingError, FieldError, EscalationError } = require("../../../_helpers/errors");
// const { Auth } = require("../../../_helpers/auth");
const faker = require('faker');
const archiveNeo4jPerson = require('../../../archive-neo4j/person');

beforeAll(async () => {
  await serverInit(false, true);
});

afterAll(async () => {
  await destroyTestingDBs();
});

describe (`${uriConfig.api + uriConfig.person} Routes`, () => {

  it(`should return http status of 405 with Allow header 'GET' on DELETE`, (done) => {
    supertest(server).delete(uriConfig.api + uriConfig.person)
      .expect(405)
      .then((response) => {
        expect(response.headers.allow).toBe('GET, POST');
        done();
      })
      .catch((error) => {
        done(error);
      })
  })

  it(`should return http status of 405 with Allow header 'GET' on PUT`, (done) => {
    supertest(server).put(uriConfig.api + uriConfig.person)
      .expect(405)
      .then((response) => {
        expect(response.headers.allow).toBe('GET, POST');
        done();
      })
      .catch((error) => {
        done(error);
      })
  })

  // it(`should return http status of 200 with list of people on GET`, async (done) => {
  //   let person;
  //   try{
  //     person = await archiveNeo4jPerson.createPerson(faker.name.lastName(), faker.name.firstName(), faker.name.middleName());
  //   }catch(e){
  //     console.log(e);
  //   }

  //   supertest(server).get(uriCOnfig.api + uriConfig.person)
  //     .expect(200)
  //     .then((response) => {
  //       expect(Array.isArray(response.body)).toBeTruthy();
  //       expect(response.body).toContainEqual(person);
  //       done();
  //     })
  //     .catch((error) => {
  //       done(error);
  //     })
  // })

  it(`should return http status of 401 on POST without authorization cookie`, (done) => {
    supertest(server).post(uriConfig.api + uriConfig.person)
      .expect(401)
      .then(() => {
        done();
      })
      .catch((error) => {
        done(error);
      })
  })

})