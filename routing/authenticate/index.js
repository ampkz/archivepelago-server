const express = require('express');
const router = express.Router();

const { sendStatus405 } = require('../../middleware/errors');
const archiveNeo4jUsers = require('../routes/users');

/**
 * @swagger
 * /authenticate:
 *   post:
 *     summary: Authenticate user.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 required: true
 *                 type: string
 *                 example: user@email.com
 *                 description: User's email address.
 *               password:
 *                 required: true
 *                 type: string
 *                 example: p4ssw0rd
 *                 description: User's password.
 *     responses:
 *       200:
 *         description: Authenticated token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Authenticated JSON Web Token.
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluIiwiYXV0aCI6ImFkbWluIiwiaWF0IjoxNjE2MzQ5MjMwLCJleHAiOjE2MTYzNDkyOTB9.EEL2OPAIWMgkeE8qh_0fMfSpYJhUkuafEebx7ffltZc
 *       400:
 *         description: Missing/malformed fields.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FieldErrorMessage'
 *       401:
 *         description: Invalid log-in credentials.
 *         headers:
 *           WWW-Authenticate:
 *             schema:
 *               type: string
 *               example: Archivepelago Authentication
 *             description: The authentication realm.
 *             
 */
 router.post('/authenticate', archiveNeo4jUsers.authenticate)


 /**
  * @swagger
  * /authenticate:
  *   get:
  *     summary: Method not allowed.
  *     tags:
  *       - Authentication
  *     responses:
  *       405:
  *         description: Method not allowed.
  *         headers:
  *           Allow:
  *             schema:
  *               type: string
  *               example: 'POST'
  *             description: The methods allowed at this endpoint.
  */
 router.get('/authenticate', sendStatus405('POST'));
 
  /**
  * @swagger
  * /authenticate:
  *   put:
  *     summary: Method not allowed.
  *     tags:
  *       - Authentication
  *     responses:
  *       405:
  *         description: Method not allowed.
  *         headers:
  *           Allow:
  *             schema:
  *               type: string
  *               example: 'POST'
  *             description: The methods allowed at this endpoint.
  */
 router.put('/authenticate', sendStatus405('POST'));
 
 /**
  * @swagger
  * /authenticate:
  *   delete:
  *     summary: Method not allowed.
  *     tags:
  *       - Authentication
  *     responses:
  *       405:
  *         description: Method not allowed.
  *         headers:
  *           Allow:
  *             schema:
  *               type: string
  *               example: 'POST'
  *             description: The methods allowed at this endpoint.
  */
 router.delete('/authenticate', sendStatus405('POST'));

 module.exports = router;