/* eslint-disable no-undef */
/**
 * Auth middleware
 * 
 * @group middleware
 * @group integration
 */

require('dotenv').config();
const { permitRoles } = require('../../middleware/auth');
const httpMocks = require('node-mocks-http');
const { Auth, signToken } = require('../../_helpers/auth');

describe(`permit roles middleware test`, () => {
  it(`should send http status of 401 without an authorization cookie`, () => {
    const request = httpMocks.createRequest({
      method: "GET",
      url: "/people",
      headers: {
          authorization: ""
      }
    });
    const response = httpMocks.createResponse();
    permitRoles(Auth.ADMIN, Auth.CONTRIBUTOR)(request, response);
    expect(response.statusCode).toBe(401);
  })

  it("should return http status of 403 if there is an invalid authorization cookie", ()=>{
    const request = httpMocks.createRequest({
        method: "GET",
        url: "/people",
        cookies: {
          jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluIiwiYXV0aCI6ImFkbWluIiwiaWF0IjoxNjE2MjQ3MzcyLCJleHAiOjE2MTYyNDc0MzJ9.gWI40ko0ZaRo70cyqIVXAJmUrXugYv2UqqRsV9TkVJk'
        }
      });
    const response = httpMocks.createResponse();
    permitRoles(Auth.ADMIN, Auth.CONTRIBUTOR)(request, response);
    expect(response.statusCode).toBe(403);
  })

  it(`should return http status of 200 with valid authorization cookie as admin with permitted admin and contributor`, done => {
    const token = signToken('admin', Auth.ADMIN, '60s');
        const request = httpMocks.createRequest({
            method: "GET",
            url: "/people",
            cookies: {
              jwt: token
            }
          });
        const response = httpMocks.createResponse();
        permitRoles(Auth.ADMIN, Auth.CONTRIBUTOR)(request, response, () => { done() });
        expect(response.statusCode).toBe(200);
  })

  it(`should return http status of 200 with valid authorization cookie as contributor with permitted admin and contributor`, done => {
    const token = signToken('admin', Auth.CONTRIBUTOR, '60s');
        const request = httpMocks.createRequest({
            method: "GET",
            url: "/people",
            cookies: {
              jwt: token
            }
          });
        const response = httpMocks.createResponse();
        permitRoles(Auth.ADMIN, Auth.CONTRIBUTOR)(request, response, () => { done() });
        expect(response.statusCode).toBe(200);
  })

  it(`should return http status of 403 with valid authorization cookie as contributor with no permitted contributor`, () => {
    const token = signToken('admin', Auth.CONTRIBUTOR, '60s');
        const request = httpMocks.createRequest({
            method: "GET",
            url: "/people",
            cookies: {
              jwt: token
            }
          });
        const response = httpMocks.createResponse();
        permitRoles(Auth.ADMIN)(request, response);
        expect(response.statusCode).toBe(403);
  })

  it(`should return http status of 403 with valid authorization cookie as admin with no permitted admin`, () => {
    const token = signToken('admin', Auth.ADMIN, '60s');
        const request = httpMocks.createRequest({
            method: "GET",
            url: "/people",
            cookies: {
              jwt: token
            }
          });
        const response = httpMocks.createResponse();
        permitRoles(Auth.CONTRIBUTOR)(request, response);
        expect(response.statusCode).toBe(403);
  })

  it(`should return http status of 200 with valid authorization cookie as contributor with same id permission`, done => {
    const token = signToken('contributor', Auth.CONTRIBUTOR, '60s');
        const request = httpMocks.createRequest({
            method: "GET",
            url: "/people",
            cookies: {
              jwt: token
            },
            params: {
              userId: 'contributor'
            }
          });
        const response = httpMocks.createResponse();
        permitRoles(Auth.ADMIN, Auth.SAME_ID)(request, response, () => { done() });
        expect(response.statusCode).toBe(200);
  })

  it(`should return http status of 403 with valid authorization cookie with different ids with same id permission`, done => {
    const token = signToken('contributor', Auth.CONTRIBUTOR, '60s');
        const request = httpMocks.createRequest({
            method: "GET",
            url: "/people",
            cookies: {
              jwt: token
            },
            params: {
              id: 'notcontributor'
            }
          });
        const response = httpMocks.createResponse();
        permitRoles(Auth.ADMIN, Auth.SAME_ID)(request, response, () => { done() });
        expect(response.statusCode).toBe(403);
        done();
  })
  

})