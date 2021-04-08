const express = require('express');
const router = express.Router();

const { permitRoles } = require("../../middleware/auth");
const { sendStatus405 } = require('../../middleware/errors');
const { Auth } = require('../../_helpers/auth');
const archiveNeo4jUsers = require('../routes/users');
/**
 * @swagger
 * components:
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
 * /admin/authenticate:
 *   post:
 *     summary: Authenticate user.
 *     tags:
 *       - Authentication
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
 * /admin/authenticate:
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
 *             description: The methods allowed at this endpoint.
 */
router.get('/authenticate', sendStatus405('POST'));

 /**
 * @swagger
 * /admin/authenticate:
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
 *             description: The methods allowed at this endpoint.
 */
router.put('/authenticate', sendStatus405('POST'));

/**
 * @swagger
 * /admin/authenticate:
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
 *             description: The methods allowed at this endpoint.
 */
router.delete('/authenticate', sendStatus405('POST'));

 module.exports = router;