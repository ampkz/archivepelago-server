const express = require('express');
const router = express.Router();

const { permitRoles } = require("../../middleware/auth");
const { sendStatus405 } = require('../../middleware/errors');
const { Auth } = require('../../_helpers/auth');
const archiveNeo4jUsers = require('../routes/users');

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: jwt
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           required: true
 *           description: User's ID.
 *           example: cf52bde2-d3ff-4e2b-95f0-8461e0d70edc
 *         email:
 *           type: string
 *           required: true
 *           description: User's email.
 *           example: user@email.com
 *         firstName:
 *           type: string
 *           required: true
 *           description: User's first name.
 *           example: Jane
 *         lastName:
 *           type: string
 *           required: true
 *           description: User's last name.
 *           example: Doe
 *         secondName:
 *           type: string
 *           required: false
 *           description: User's second/middle name.
 *           example: Lilly
 *         auth:
 *           type: string
 *           required: true
 *           enum: [admin, contributor]
 *           example: admin
 *           description: User's authentication role.
 *     FieldErrorMessage:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Description of the error.
 *           example: Invalid Request
 *         code:
 *           type: integer
 *           description: Code reference to the error.
 *           example: 3000
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *                 description: Missing/malformed field.
 *                 example: requiredField
 *               message:
 *                 type: string
 *                 description: Requirements for the field.
 *                 example: Required
 */

/**
 * @swagger
 * /admin/users:
 *   post:
 *     summary: Create new user. (Must Be Admin)
 *     tags:
 *       - Users
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
 *               firstName:
 *                 required: true
 *                 type: string
 *                 example: Jane
 *                 description: User's first name.
 *               lastName:
 *                 required: true
 *                 type: string
 *                 example: Doe
 *                 description: User's last name.
 *               secondName:
 *                 required: false
 *                 type: string
 *                 example: Lilly
 *                 description: User's second/middle name.
 *               auth:
 *                 required: true
 *                 type: string
 *                 enum: [admin, contributor]
 *                 example: admin
 *                 description: User's authentication role.
 *               password:
 *                 required: true
 *                 type: string
 *                 example: p4ssw0rd
 *                 description: User's password.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       201:
 *         description: The user was created successfully.
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *               example: /cf52bde2-d3ff-4e2b-95f0-8461e0d70edc
 *             description: URI to created user.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Missing/malformed fields.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FieldErrorMessage'
 *       401:
 *         description: Invalid authentication token.
 *         headers:
 *           WWW-Authenticate:
 *             schema:
 *               type: string
 *               example: Archivepelago Authentication
 *             description: The authentication realm.
 *       403:
 *         description: Forbidden. Authenticated role is not permitted to access this endpoint.
 *             
 */
router.post('/users', permitRoles(Auth.ADMIN), archiveNeo4jUsers.createUser);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Retrieve a list of users. (Must Be Admin)
 *     tags:
 *       - Users
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: A list of retrieved users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid authentication token.
 *         headers:
 *           WWW-Authenticate:
 *             schema:
 *               type: string
 *               example: Archivepelago Authentication
 *             description: The authentication realm.
 *       403:
 *         description: Forbidden. Authenticated role is not permitted to access this endpoint.
 *             
 */
router.get('/users', permitRoles(Auth.ADMIN), archiveNeo4jUsers.getUsers);


/**
 * @swagger
 * /admin/users:
 *   delete:
 *     summary: Method not allowed.
 *     tags:
 *       - Users
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
router.delete('/users', sendStatus405('POST, GET'));

 /**
 * @swagger
 * /admin/users:
 *   put:
 *     summary: Method not allowed.
 *     tags:
 *       - Users
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
router.put('/users', sendStatus405('POST, GET'));



module.exports = router;