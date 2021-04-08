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
const faker = require('faker');
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

    it(`should return http status of 401 with Authentication realm header on POST with invalid credentials`, done => {
        supertest(server).post(`${uriConfig.admin}/authenticate`)
            .send({email: faker.internet.email(), password: faker.internet.password()})
            .expect(401)
            .then(response => {
                console.log(response.headers);
                expect(response.headers['www-authenticate']).toBe(`Basic realm="${process.env.AUTH_REALM}"`)
                done();
            })
            .catch(error => {
                done(error);
            });
    })

    it(`should return http status of 400 with required fields on POST without required fields`, done => {
        supertest(server).post(`${uriConfig.admin}/authenticate`)
            .expect(400)
            .then(response => {
                expect(response.body.message).toBe(RoutingError.INVALID_REQUEST);
                expect(response.body.errors).toContainEqual({field: 'email', message: FieldError.REQUIRED});
                expect(response.body.errors).toContainEqual({field: 'password', message: FieldError.REQUIRED});    
                done();
            })
            .catch(error => {
                done(error);
            })
    })

    it(`should return http status of 200 with token on POST with valid credentials`, done => {
        supertest(server).post(`${uriConfig.admin}/authenticate`)
            .send({email: 'admin', password: 'admin'})
            .expect(200)
            .then(response => {
                expect(response.body.token).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/);
                done();
            })
            .catch(error => {
                done(error);
            })

    })
})