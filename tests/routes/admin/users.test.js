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
const { RoutingError, FieldError } = require("../../../_helpers/errors");
const { signToken, Auth } = require("../../../_helpers/auth");
const faker = require('faker');
const archiveNeo4jUsers = require('../../../archive-neo4j/users');

beforeAll(async () => {
    await serverInit(false);
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
                expect(response.headers['www-authenticate']).toBe(`Basic realm="${process.env.AUTH_REALM}"`)
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

    it(`should return http status of 200 with token on POST with valid credentials`, done => {
        supertest(server).post(`${uriConfig.api}/authenticate`)
            .send({email: 'admin', password: 'admin'})
            .expect(200)
            .then(response => {
                expect(response.body).toBe({jwt: 'set'});
                done();
            })
            .catch(error => {
                done(error);
            })
    })
})

describe(`${uriConfig.api + uriConfig.admin}/users Routes`, () => {
    it(`should send http status of 405 with Allow header 'POST, GET' on PUT`, done => {
        supertest(server).put(`${uriConfig.api + uriConfig.admin}/users`)
            .expect(405)
                .then(response => {
                    expect(response.headers.allow).toBe('POST, GET');
                    done();
                })
                .catch(error => {
                    done(error);
                })
    })

    it(`should send http status of 405 with Allow header 'POST, GET' on DELETE`, done => {
        supertest(server).delete(`${uriConfig.api + uriConfig.admin}/users`)
            .expect(405)
                .then(response => {
                    expect(response.headers.allow).toBe('POST, GET');
                    done();
                })
                .catch(error => {
                    done(error);
                })
    })

    it(`should return http status of 400 with required fields on POST without required fields`, done => {
        const token = signToken('admin', Auth.ADMIN, '60s');
        supertest(server).post(`${uriConfig.api + uriConfig.admin}/users`)
            .set('Authorization', `Bearer ${token}`)
            .expect(400)
            .then(response => {
                expect(response.body.message).toBe(RoutingError.INVALID_REQUEST);
                expect(response.body.errors).toContainEqual({field: 'email', message: FieldError.REQUIRED});
                expect(response.body.errors).toContainEqual({field: 'password', message: FieldError.REQUIRED});
                expect(response.body.errors).toContainEqual({field: 'firstName', message: FieldError.REQUIRED});    
                expect(response.body.errors).toContainEqual({field: 'lastName', message: FieldError.REQUIRED});
                expect(response.body.errors).toContainEqual({field: 'auth', message: FieldError.REQUIRED});
                done();
            })
            .catch(error => {
                done(error);
            })
    })

    it(`should return http status of 400 with invalid type on POST with invalid role`, done => {
        const email = faker.internet.email();
        const password = faker.internet.password();
        const firstName = faker.name.firstName();
        const lastName = faker.name.lastName();
        const secondName = faker.name.middleName();
        const token = signToken('admin', Auth.ADMIN, '60s');
        supertest(server).post(`${uriConfig.api + uriConfig.admin}/users`)
            .set('Authorization', `Bearer ${token}`)
            .send({email, password, firstName, lastName, secondName, auth: 'invalid auth'})
            .expect(400)
            .then(response => {
                expect(response.body.message).toBe(RoutingError.INVALID_REQUEST);
                expect(response.body.errors).toContainEqual({field: 'auth', message: FieldError.INVALID_TYPE});
                done();
            })
            .catch(error => {
                done(error);
            })
    })

    it(`should return http status of 201 with Location header on POST`, done => {
        const email = faker.internet.email();
        const password = faker.internet.password();
        const firstName = faker.name.firstName();
        const lastName = faker.name.lastName();
        const secondName = faker.name.middleName();
        const auth = Auth.ADMIN;
        const token = signToken('admin', Auth.ADMIN, '60s');
        supertest(server).post(`${uriConfig.api + uriConfig.admin}/users`)
            .set('Authorization', `Bearer ${token}`)
            .send({email, password, firstName, lastName, secondName, auth})
            .expect(201)
            .then(response => {
                expect(response.headers.location).toBe(`/${response.body.id}`);
                expect(response.body.email).toBe(email);
                expect(response.body.firstName).toBe(firstName);
                expect(response.body.lastName).toBe(lastName);
                expect(response.body.secondName).toBe(secondName);
                expect(response.body.auth).toBe(auth);
                done();
            })
            .catch(error => {
                done(error);
            })
    })

    it(`should return http status of 403 on POST with invalid authorization token`, done => {
        supertest(server).post(`${uriConfig.api + uriConfig.admin}/users`)
            .set('Authorization', `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluIiwiYXV0aCI6ImFkbWluIiwiaWF0IjoxNjE2MzQ5MjMwLCJleHAiOjE2MTYzNDkyOTB9.EEL2OPAIWMgkeE8qh_0fMfSpYJhUkuafEebx7ffltZc`) 
            .expect(403)
            .then(() => {
                done();
            })
            .catch(error => {
                done(error);
            })
    })

    it(`should return http status of 401 with Authorization realm header on POST without authorization header`, done => {
        supertest(server).post(`${uriConfig.api + uriConfig.admin}/users`)
            .expect(401)
            .then(response => {
                expect(response.headers['www-authenticate']).toBe(`Basic realm="${process.env.AUTH_REALM}"`);
                done();
            })
            .catch(error => {
                done(error);
            })
    })

    it(`should return http status of 403 on POST as contributor`, done => {
        const token = signToken('admin', Auth.CONTRIBUTOR, '60s');
        supertest(server).post(`${uriConfig.api + uriConfig.admin}/users`)
            .set('Authorization', `Bearer ${token}`) 
            .expect(403)
            .then(() => {
                done();
            })
            .catch(error => {
                done(error);
            })
    })

    it(`should return http status of 401 with Authorization realm header on GET without authorization header`, done => {
        supertest(server).get(`${uriConfig.api + uriConfig.admin}/users`)
            .expect(401)
            .then(response => {
                expect(response.headers['www-authenticate']).toBe(`Basic realm="${process.env.AUTH_REALM}"`);
                done();
            })
            .catch(error => {
                done(error);
            })
    })

    it(`should return http status of 403 on GET with invalid authorization token`, done => {
        supertest(server).get(`${uriConfig.api + uriConfig.admin}/users`)
            .set('Authorization', `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluIiwiYXV0aCI6ImFkbWluIiwiaWF0IjoxNjE2MzQ5MjMwLCJleHAiOjE2MTYzNDkyOTB9.EEL2OPAIWMgkeE8qh_0fMfSpYJhUkuafEebx7ffltZc`) 
            .expect(403)
            .then(() => {
                done();
            })
            .catch(error => {
                done(error);
            })
    })

    it(`should return http status of 403 on GET as contributor`, done => {
        const token = signToken('admin', Auth.CONTRIBUTOR, '60s');
        supertest(server).get(`${uriConfig.api + uriConfig.admin}/users`)
            .set('Authorization', `Bearer ${token}`) 
            .expect(403)
            .then(() => {
                done();
            })
            .catch(error => {
                done(error);
            })
    })

    it(`should return http status of 200 with list of users on GET`, async done => {
        const token = signToken('admin', Auth.ADMIN, '60s');
        let user;
        try{
            user = await archiveNeo4jUsers.createUser(faker.internet.email(), {firstName: faker.name.firstName(), lastName: faker.name.lastName()}, Auth.ADMIN, faker.internet.password())
        }catch(e){
            console.log(e);
        }
        supertest(server).get(`${uriConfig.api + uriConfig.admin}/users`)
            .set('Authorization', `Bearer ${token}`) 
            .expect(200)
            .then(response => {
                expect(Array.isArray(response.body)).toBeTruthy();
                expect(response.body).toContainEqual(user.properties)
                done();
            })
            .catch(error => {
                done(error);
            })
    })
    
})