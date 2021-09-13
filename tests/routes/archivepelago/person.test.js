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
// const faker = require('faker');
// const archiveNeo4jUsers = require('../../../archive-neo4j/user');

beforeAll(async () => {
  await serverInit(false, true);
});

afterAll(async () => {
  await destroyTestingDBs();
});

describe (`${uriConfig.api + uriConfig.person} Routes`, () => {
  it(`should return http status of 405 with Allow header 'GET' on POST`, (done) => {
    supertest(server).post(uriConfig.api + uriConfig.person)
      .expect(405)
      .then((response) => {
        expect(response.headers.allow).toBe('GET');
        done();
      })
      .catch((error) => {
        done(error);
      })
  })

  it(`should return http status of 405 with Allow header 'GET' on DELETE`, (done) => {
    supertest(server).delete(uriConfig.api + uriConfig.person)
      .expect(405)
      .then((response) => {
        expect(response.headers.allow).toBe('GET');
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
        expect(response.headers.allow).toBe('GET');
        done();
      })
      .catch((error) => {
        done(error);
      })
  })

})