/* eslint-disable no-undef */
/**
 * Archive dates routes
 * 
 * @group routes/admin/users
 * @group integration
 */

const server = require('../../../server/server');
const { serverInit, destroyTestingDBs } = require('../../../server/utils');
const supertest = require("supertest");
const uriConfig = require('../../../routing/uriConfig');
const { RoutingError, ArchiveError, FieldError } = require("../../../_helpers/errors");
const { signToken, Auth } = require("../../../_helpers/auth");
const { sampleOne, gen } = require('testcheck');
// const archiveNeo4jUsers = require('../../../archive-neo4j/users');

beforeAll(async () => {
    await serverInit(false);
});

afterAll(async () => {
    await destroyTestingDBs();
});

describe(`${uriConfig.admin}/authenticate Routes`, () => {
    it(`should return http status of 405 with Allow header 'POST' on GET`, done => {
        supertest(server).get(`${uriConfig.admin}/authenticate`)
            .expect(405)
            .then(response => {
                expect(response.headers.allow).toBe('POST');
                done();
            })
            .catch(error => {
                done(error);
            })
    })

    it(`should return http status of 405 with Allow header 'POST' on PUT`, done => {
        supertest(server).put(`${uriConfig.admin}/authenticate`)
            .expect(405)
            .then(response => {
                expect(response.headers.allow).toBe('POST');
                done();
            })
            .catch(error => {
                done(error);
            })
    })

    it(`should return http status of 405 with Allow header 'POST' on DELETE`, done => {
        supertest(server).delete(`${uriConfig.admin}/authenticate`)
            .expect(405)
            .then(response => {
                expect(response.headers.allow).toBe('POST');
                done();
            })
            .catch(error => {
                done(error);
            })
    })
})