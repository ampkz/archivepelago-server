/**
 * Archive dates routes
 * 
 * @group routes/authenticate
 * @group integration
 */

 const server = require('../../../server/server');
 const { serverInit, destroyTestingDBs } = require('../../../server/utils');
 const supertest = require("supertest");
 const uriConfig = require('../../../routing/uriConfig');
 const { RoutingError, FieldError } = require("../../../_helpers/errors");
 const faker = require('faker');
 
 beforeAll(async () => {
     await serverInit(false, true);
 });
 
 afterAll(async () => {
     await destroyTestingDBs();
 });
 
 describe(`${uriConfig.api}/authenticate Routes`, () => {
     it(`should return http status of 405 with Allow header 'POST' on GET`, done => {
         supertest(server).get(`${uriConfig.api}/authenticate`)
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
         supertest(server).put(`${uriConfig.api}/authenticate`)
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
         supertest(server).delete(`${uriConfig.api}/authenticate`)
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
         supertest(server).post(`${uriConfig.api}/authenticate`)
             .send({email: faker.internet.email(), password: faker.internet.password()})
             .expect(401)
             .then(response => {
                 expect(response.headers['www-authenticate']).toBe(`xBasic realm="${process.env.AUTH_REALM}"`)
                 done();
             })
             .catch(error => {
                 done(error);
             });
     })
 
     it(`should return http status of 400 with required fields on POST without required fields`, done => {
         supertest(server).post(`${uriConfig.api}/authenticate`)
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
 
     it(`should return http status of 204 on POST with valid credentials`, done => {
         supertest(server).post(`${uriConfig.api}/authenticate`)
             .send({email: 'admin', password: 'admin'})
             .expect(204)
             .then(() => {
                 done();
             })
             .catch(error => {
                 done(error);
             })
     })
 })