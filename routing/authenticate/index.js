const express = require('express');
const router = express.Router();

const { sendStatus405 } = require('../../middleware/errors');
const userRoutes = require('../routes/user');

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
 *       204:
 *         description: Cookie was set successfully.
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
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalError'
 *             
 */
 router.post('/authenticate', userRoutes.authenticate)


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
  *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalError'
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
  *       500:
  *         description: Internal Server Error.
  *         content:
  *           application/json:
  *             schema:
  *               $ref: '#/components/schemas/InternalError'
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
  *       500:
  *         description: Internal Server Error.
  *         content:
  *           application/json:
  *             schema:
  *               $ref: '#/components/schemas/InternalError'
  */
 router.delete('/authenticate', sendStatus405('POST'));

 module.exports = router;