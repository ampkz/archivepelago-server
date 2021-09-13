const express = require('express');
const router = express.Router();

const { permitRoles } = require("../../middleware/auth");
const { sendStatus405 } = require('../../middleware/errors');
const { Auth } = require('../../_helpers/auth');
const archiveNeo4jUsers = require('../routes/user');

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
 * /admin/user:
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
router.post('/user', permitRoles(Auth.ADMIN), archiveNeo4jUsers.createUser);

/**
 * @swagger
 * /admin/user:
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
router.get('/user', permitRoles(Auth.ADMIN), archiveNeo4jUsers.getUsers);


/**
 * @swagger
 * /admin/user:
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
router.delete('/user', sendStatus405('POST, GET'));

 /**
 * @swagger
 * /admin/user:
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
router.put('/user', sendStatus405('POST, GET'));

/**
 * @swagger
 * /admin/user/{userid}:
 *   post:
 *     summary: Method not allowed.
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID of the user.
 *     tags:
 *       - Users
 *     responses:
 *       405:
 *         description: Method not allowed.
 *         headers:
 *           Allow:
 *             schema:
 *               type: string
 *               example: 'GET, DELETE, PUT'
 *             description: The methods allowed at this endpoint.
 */
router.post('/user/:userId', sendStatus405('GET, DELETE, PUT'));


 /**
 * @swagger
 * /admin/user/{userid}:
 *   get:
 *     summary: Get user by userId.
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID of the user.
 *     tags:
 *       - Users
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Retrieved user.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
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
 *       404:
 *         description: User not found.
 * 
 */
router.get('/user/:userId', permitRoles(Auth.ADMIN, Auth.SAME_ID), archiveNeo4jUsers.getUser);

/**
 * @swagger
 * /admin/user/{userid}:
 *   put:
 *     summary: Update user.
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID of the user.
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
 *                 description: User's new or current email address.
 *               firstName:
 *                 required: true
 *                 type: string
 *                 example: Jane
 *                 description: User's new or current first name.
 *               lastName:
 *                 required: true
 *                 type: string
 *                 example: Doe
 *                 description: User's new or current last name.
 *               secondName:
 *                 required: false
 *                 type: string
 *                 example: Lilly
 *                 description: User's new or current second/middle name.
 *               auth:
 *                 required: true
 *                 type: string
 *                 enum: [admin, contributor]
 *                 example: admin
 *                 description: User's new or current authentication role.
 *               password:
 *                 required: false
 *                 type: string
 *                 example: p4ssw0rd
 *                 description: User's new password.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Updated user.
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
 *       404:
 *         description: User not found.
 */
 router.put('/user/:userId', permitRoles(Auth.ADMIN, Auth.SAME_ID), archiveNeo4jUsers.updateUser);

/**
 * @swagger
 * /admin/user/{userid}:
 *   delete:
 *     summary: Delete user.
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID of the user.
 *     tags:
 *       - Users
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       204:
 *         description: User was deleted successfully.
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
 *       404:
 *         description: User not found.
 * */
 router.delete('/user/:userId', permitRoles(Auth.ADMIN, Auth.SAME_ID), archiveNeo4jUsers.deleteUser);

module.exports = router;