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
const { RoutingError, FieldError, EscalationError } = require("../../../_helpers/errors");
const { Auth } = require("../../../_helpers/auth");
const faker = require('faker');
const archiveNeo4jUsers = require('../../../archive-neo4j/users');

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

    it(`should return http status of 400 with required fields on POST without required fields`, async done => {
        const agent = supertest.agent(server);
        await agent.post(`${uriConfig.api}/authenticate`).send({email: 'admin', password: 'admin'});
        agent.post(`${uriConfig.api + uriConfig.admin}/users`)
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

    it(`should return http status of 400 with invalid type on POST with invalid role`, async done => {
        const email = faker.internet.email();
        const password = faker.internet.password();
        const firstName = faker.name.firstName();
        const lastName = faker.name.lastName();
        const secondName = faker.name.middleName();
        const agent = supertest.agent(server);
        await agent.post(`${uriConfig.api}/authenticate`).send({email: 'admin', password: 'admin'});
        agent.post(`${uriConfig.api + uriConfig.admin}/users`)
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

    it(`should return http status of 201 with Location header on POST with authorization cookie`, async done => {
        const email = faker.internet.email();
        const password = faker.internet.password();
        const firstName = faker.name.firstName();
        const lastName = faker.name.lastName();
        const secondName = faker.name.middleName();
        const auth = Auth.ADMIN;
        const agent = supertest.agent(server);
        await agent.post(`${uriConfig.api}/authenticate`).send({email: 'admin', password: 'admin'});
        agent.post(`${uriConfig.api + uriConfig.admin}/users`)
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

    it(`should return http status of 401 with Authorization realm header on POST without authorization cookie`, done => {
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

    it(`should return http status of 403 on POST as contributor`, async done => {
        const email = faker.internet.email();
        const password = faker.internet.password();
        await archiveNeo4jUsers.createUser(email, {firstName: faker.name.firstName(), lastName: faker.name.lastName()}, Auth.CONTRIBUTOR, password)
        const agent = supertest.agent(server);
        await agent.post(`${uriConfig.api}/authenticate`).send({email, password});
        agent.post(`${uriConfig.api + uriConfig.admin}/users`)
            .expect(403)
            .then(() => {
                done();
            })
            .catch(error => {
                done(error);
            })
    })

    it(`should return http status of 401 with Authorization realm header on GET without authorization cookie`, done => {
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

    it(`should return http status of 403 on GET as contributor`, async done => {
        const email = faker.internet.email();
        const password = faker.internet.password();
        await archiveNeo4jUsers.createUser(email, {firstName: faker.name.firstName(), lastName: faker.name.lastName()}, Auth.CONTRIBUTOR, password)
        const agent = supertest.agent(server);
        await agent.post(`${uriConfig.api}/authenticate`).send({email, password});
        agent.get(`${uriConfig.api + uriConfig.admin}/users`)
            .expect(403)
            .then(() => {
                done();
            })
            .catch(error => {
                done(error);
            })
    })

    it(`should return http status of 200 with list of users on GET with authorization cookie`, async done => {
        
        let user;
        try{
            user = await archiveNeo4jUsers.createUser(faker.internet.email(), {firstName: faker.name.firstName(), lastName: faker.name.lastName()}, Auth.ADMIN, faker.internet.password())
        }catch(e){
            console.log(e);
        }
        const agent = supertest.agent(server);
        await agent.post(`${uriConfig.api}/authenticate`).send({email: 'admin', password: 'admin'});
        agent.get(`${uriConfig.api + uriConfig.admin}/users`)
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
it(`should return http status of 404 on GET with unknown userid and authorization cookie`, async done => {
    const agent = supertest.agent(server);
    await agent.post(`${uriConfig.api}/authenticate`).send({email: 'admin', password: 'admin'});
    agent.get(`${uriConfig.api + uriConfig.admin}/users/userid`)
        .expect(404)
        .then(() => {
            done();
        })
        .catch(error => {
            done(error);
        })
})

describe(`${uriConfig.api + uriConfig.admin}/users/:userId GET Routes`, () => {
    it(`should return http status of 401 with Authorization realm header on GET without authorization cookie`, done => {
        supertest(server).get(`${uriConfig.api + uriConfig.admin}/users/userId`)
            .expect(401)
            .then(response => {
                expect(response.headers['www-authenticate']).toBe(`Basic realm="${process.env.AUTH_REALM}"`);
                done();
            })
            .catch(error => {
                done(error);
            })
    })

    it(`should return http status of 403 on GET as contributor`, async done => {
        const email = faker.internet.email();
        const password = faker.internet.password();
        await archiveNeo4jUsers.createUser(email, {firstName: faker.name.firstName(), lastName: faker.name.lastName()}, Auth.CONTRIBUTOR, password)
        const agent = supertest.agent(server);
        await agent.post(`${uriConfig.api}/authenticate`).send({email, password});
        agent.get(`${uriConfig.api + uriConfig.admin}/users/userId`)
            .expect(403)
            .then(() => {
                done();
            })
            .catch(error => {
                done(error);
            })
    })

    it(`should return http status of 200 with user on GET with authorization cookie`, async done => {
        let user;
        try{
            user = await archiveNeo4jUsers.createUser(faker.internet.email(), {firstName: faker.name.firstName(), lastName: faker.name.lastName()}, Auth.ADMIN, faker.internet.password())
        }catch(e){
            console.log(e);
        }
        const agent = supertest.agent(server);
        await agent.post(`${uriConfig.api}/authenticate`).send({email: 'admin', password: 'admin'});
        agent.get(`${uriConfig.api + uriConfig.admin}/users/${user.properties.id}`)
            .expect(200)
            .then(response => {
                expect(response.body).toEqual(user.properties)
                done();
            })
            .catch(error => {
                done(error);
            })
    })

    it(`should return http status of 200 with user on GET with authorization cookie and Contributor as self`, async done => {
        let user;
        const email = faker.internet.email();
        const password = faker.internet.password();
        try{
            user = await archiveNeo4jUsers.createUser(email, {firstName: faker.name.firstName(), lastName: faker.name.lastName()}, Auth.CONTRIBUTOR, password)
        }catch(e){
            console.log(e);
        }
        const agent = supertest.agent(server);
        await agent.post(`${uriConfig.api}/authenticate`).send({email, password});
        agent.get(`${uriConfig.api + uriConfig.admin}/users/${user.properties.id}`)
            .expect(200)
            .then(response => {
                expect(response.body).toEqual(user.properties)
                done();
            })
            .catch(error => {
                done(error);
            })
    })

    it(`should return http status of 404 on GET with unknown userid and authorization cookie`, async done => {
        const agent = supertest.agent(server);
        await agent.post(`${uriConfig.api}/authenticate`).send({email: 'admin', password: 'admin'});
        agent.get(`${uriConfig.api + uriConfig.admin}/users/userid`)
            .expect(404)
            .then(() => {
                done();
            })
            .catch(error => {
                done(error);
            })
    })
});

describe(`${uriConfig.api + uriConfig.admin}/users/:userId DELETE Routes`, () => {
    it(`should return http status of 401 with Authorization realm header on DELETE without authorization cookie`, done => {
        supertest(server).delete(`${uriConfig.api + uriConfig.admin}/users/userId`)
            .expect(401)
            .then(response => {
                expect(response.headers['www-authenticate']).toBe(`Basic realm="${process.env.AUTH_REALM}"`);
                done();
            })
            .catch(error => {
                done(error);
            })
    })

    it(`should return http status of 403 on DELETE as contributor`, async done => {
        const email = faker.internet.email();
        const password = faker.internet.password();
        await archiveNeo4jUsers.createUser(email, {firstName: faker.name.firstName(), lastName: faker.name.lastName()}, Auth.CONTRIBUTOR, password)
        const agent = supertest.agent(server);
        await agent.post(`${uriConfig.api}/authenticate`).send({email, password});
        agent.delete(`${uriConfig.api + uriConfig.admin}/users/userId`)
            .expect(403)
            .then(() => {
                done();
            })
            .catch(error => {
                done(error);
            })
    })

    it(`should return http status of 204 on DELETE with authorization cookie`, async done => {
        let user;
        try{
            user = await archiveNeo4jUsers.createUser(faker.internet.email(), {firstName: faker.name.firstName(), lastName: faker.name.lastName()}, Auth.ADMIN, faker.internet.password())
        }catch(e){
            console.log(e);
        }
        
        const agent = supertest.agent(server);
        await agent.post(`${uriConfig.api}/authenticate`).send({email: 'admin', password: 'admin'});
        agent.delete(`${uriConfig.api + uriConfig.admin}/users/${user.properties.id}`)
            .expect(204)
            .then(() => {
                done();
            })
            .catch(error => {
                done(error);
            })
    })

    it(`should return http status of 204 on DELETE with authorization cookie and Contributor as self`, async done => {
        let user;
        const email = faker.internet.email();
        const password = faker.internet.password();
        
        try{
            user = await archiveNeo4jUsers.createUser(email, {firstName: faker.name.firstName(), lastName: faker.name.lastName()}, Auth.CONTRIBUTOR, password)
        }catch(e){
            console.log(e);
        }
        
        const agent = supertest.agent(server);
        await agent.post(`${uriConfig.api}/authenticate`).send({email, password});
        agent.delete(`${uriConfig.api + uriConfig.admin}/users/${user.properties.id}`)
            .expect(204)
            .then(() => {
                done();
            })
            .catch(error => {
                done(error);
            })
    })

    it(`should return http status of 404 on DELETE with unknown userid and authorization cookie`, async done => {
        const agent = supertest.agent(server);
        await agent.post(`${uriConfig.api}/authenticate`).send({email: 'admin', password: 'admin'});
        agent.delete(`${uriConfig.api + uriConfig.admin}/users/userid`)
            .expect(404)
            .then(() => {
                done();
            })
            .catch(error => {
                done(error);
            })
    })
});

describe(`${uriConfig.api + uriConfig.admin}/users/:userId PUT Routes`, () => {
    it(`should return http status of 401 with Authorization realm header on PUT without authorization cookie`, done => {
        supertest(server).put(`${uriConfig.api + uriConfig.admin}/users/userId`)
            .expect(401)
            .then(response => {
                expect(response.headers['www-authenticate']).toBe(`Basic realm="${process.env.AUTH_REALM}"`);
                done();
            })
            .catch(error => {
                done(error);
            })
    })

    it(`should return http status of 403 on PUT as contributor`, async done => {
        const email = faker.internet.email();
        const password = faker.internet.password();
        await archiveNeo4jUsers.createUser(email, {firstName: faker.name.firstName(), lastName: faker.name.lastName()}, Auth.CONTRIBUTOR, password)
        const agent = supertest.agent(server);
        await agent.post(`${uriConfig.api}/authenticate`).send({email, password});
        agent.put(`${uriConfig.api + uriConfig.admin}/users/userId`)
            .expect(403)
            .then(() => {
                done();
            })
            .catch(error => {
                done(error);
            })
    })

    it(`should return http status of 404 on PUT with unknown userid and authorization cookie`, async done => {
        const email = faker.internet.email();
        const firstName = faker.name.firstName();
        const lastName = faker.name.lastName();
        const secondName = faker.name.middleName();
        const auth = Auth.CONTRIBUTOR;
        const agent = supertest.agent(server);
        await agent.post(`${uriConfig.api}/authenticate`).send({email: 'admin', password: 'admin'});
        agent.put(`${uriConfig.api + uriConfig.admin}/users/userid`)
            .send({email, firstName, lastName, secondName, auth})
            .expect(404)
            .then(() => {
                done();
            })
            .catch(error => {
                done(error);
            })
    })

    it(`should return http status of 200 with updated user on PUT with authorization cookie and updated user`, async done => {
        let user;
        try{
            user = await archiveNeo4jUsers.createUser(faker.internet.email(), {firstName: faker.name.firstName(), lastName: faker.name.lastName()}, Auth.ADMIN, faker.internet.password())
        }catch(e){
            console.log(e);
        }
        const email = faker.internet.email();
        const firstName = faker.name.firstName();
        const lastName = faker.name.lastName();
        const secondName = faker.name.middleName();
        const auth = Auth.CONTRIBUTOR;
        const password = faker.internet.password();

        const agent = supertest.agent(server);
        await agent.post(`${uriConfig.api}/authenticate`).send({email: 'admin', password: 'admin'});
        agent.put(`${uriConfig.api + uriConfig.admin}/users/${user.properties.id}`)
            .send({email, firstName, lastName, secondName, auth, password})
            .expect(200)
            .then(response => {
                expect(response.body.auth).toBe(auth);
                expect(response.body.email).toBe(email);
                expect(response.body.firstName).toBe(firstName);
                expect(response.body.lastName).toBe(lastName);
                expect(response.body.secondName).toBe(secondName);
                expect(response.body.password).toBe("updated");
                done();
            })
            .catch(error => {
                done(error);
            })
    })

    it(`should return http status of 200 with updated user on PUT with authorization cookie and Contributor updating self`, async done => {
        let user;
        const origEmail = faker.internet.email();
        const origPassword = faker.internet.password();
        try{
            user = await archiveNeo4jUsers.createUser(origEmail, {firstName: faker.name.firstName(), lastName: faker.name.lastName()}, Auth.CONTRIBUTOR, origPassword);
        }catch(e){
            console.log(e);
        }
        const email = faker.internet.email();
        const firstName = faker.name.firstName();
        const lastName = faker.name.lastName();
        const secondName = faker.name.middleName();
        const auth = Auth.CONTRIBUTOR;

        const agent = supertest.agent(server);
        await agent.post(`${uriConfig.api}/authenticate`).send({email: origEmail, password: origPassword});
        agent.put(`${uriConfig.api + uriConfig.admin}/users/${user.properties.id}`)
            .send({email, firstName, lastName, secondName, auth})
            .expect(200)
            .then(response => {
                expect(response.body.auth).toBe(auth);
                expect(response.body.email).toBe(email);
                expect(response.body.firstName).toBe(firstName);
                expect(response.body.lastName).toBe(lastName);
                expect(response.body.secondName).toBe(secondName);
                done();
            })
            .catch(error => {
                done(error);
            })
    })

    it(`should return http status of 403 on PUT with authorization cookie and Contributor updating self to Admin`, async done => {
        let user;
        const origEmail = faker.internet.email();
        const origPassword = faker.internet.password();
        try{
            user = await archiveNeo4jUsers.createUser(origEmail, {firstName: faker.name.firstName(), lastName: faker.name.lastName()}, Auth.CONTRIBUTOR, origPassword);
        }catch(e){
            console.log(e);
        }
        const email = faker.internet.email();
        const firstName = faker.name.firstName();
        const lastName = faker.name.lastName();
        const secondName = faker.name.middleName();
        const auth = Auth.ADMIN;

        const agent = supertest.agent(server);
        await agent.post(`${uriConfig.api}/authenticate`).send({email: origEmail, password: origPassword});
        agent.put(`${uriConfig.api + uriConfig.admin}/users/${user.properties.id}`)
            .send({email, firstName, lastName, secondName, auth})
            .expect(403)
            .then((response) => {
                expect(response.body.message).toBe(EscalationError.CANNOT_ESCALATE);
                done();
            })
            .catch(error => {
                done(error);
            })
    })

    it(`should return http status of 400 with required fields on PUT with authorization cookie and without required fields`, async done => {
        let user;
        try{
            user = await archiveNeo4jUsers.createUser(faker.internet.email(), {firstName: faker.name.firstName(), lastName: faker.name.lastName()}, Auth.CONTRIBUTOR, faker.internet.password());
        }catch(e){
            console.log(e);
        }
        const agent = supertest.agent(server);
        await agent.post(`${uriConfig.api}/authenticate`).send({email: 'admin', password: 'admin'});
        agent.put(`${uriConfig.api + uriConfig.admin}/users/${user.properties.id}`)
            .expect(400)
            .then(response => {
                expect(response.body.message).toBe(RoutingError.INVALID_REQUEST);
                expect(response.body.errors).toContainEqual({field: 'email', message: FieldError.REQUIRED});
                expect(response.body.errors).toContainEqual({field: 'firstName', message: FieldError.REQUIRED});    
                expect(response.body.errors).toContainEqual({field: 'lastName', message: FieldError.REQUIRED});
                expect(response.body.errors).toContainEqual({field: 'auth', message: FieldError.REQUIRED});
                done();
            })
            .catch(error => {
                done(error);
            })
    })

    it(`should return http status of 400 with invalid type on PUT with authorization cookie and invalid role`, async done => {
        let user;
        const origEmail = faker.internet.email();
        const origPassword = faker.internet.password();
        try{
            user = await archiveNeo4jUsers.createUser(origEmail, {firstName: faker.name.firstName(), lastName: faker.name.lastName()}, Auth.CONTRIBUTOR, origPassword);
        }catch(e){
            console.log(e);
        }
        const email = faker.internet.email();
        const firstName = faker.name.firstName();
        const lastName = faker.name.lastName();
        const secondName = faker.name.middleName();
        
        const agent = supertest.agent(server);
        await agent.post(`${uriConfig.api}/authenticate`).send({email: 'admin', password: 'admin'});
        agent.put(`${uriConfig.api + uriConfig.admin}/users/${user.properties.id}`)
            .send({email, firstName, lastName, secondName, auth: 'invalid auth'})
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
});

describe(`${uriConfig.api + uriConfig.admin}/users/:userId Routes`, () => {
    it(`should return http status of 405 with Allow header 'GET, DELETE, PUT' on POST`, done => {
        supertest(server).post(`${uriConfig.api + uriConfig.admin}/users/userid`)
            .expect(405)
            .then(response => {
                expect(response.headers.allow).toBe('GET, DELETE, PUT');
                done();
            })
            .catch(error => {
                done(error);
            })
    })
});