const express = require('express');
const router = express.Router();
const uriConfig = require('../uriConfig');
const personRoutes = require('../routes/person');


const { permitRoles } = require("../../middleware/auth");
const { Auth } = require('../../_helpers/auth');
const { sendStatus405 } = require('../../middleware/errors');

/**
 * @swagger
 * /person:
 *   delete:
 *     summary: Method not allowed.
 *     tags:
 *       - Person
 *     responses:
 *       405:
 *         description: Method not allowed.
 *         headers:
 *           Allow:
 *             schema:
 *               type: string
 *               example: 'GET, POST'
 *             description: The methods allowed at this endpoint.
 */
router.delete(uriConfig.person, sendStatus405('GET, POST'));

/**
 * @swagger
 * /person:
 *   put:
 *     summary: Method not allowed.
 *     tags:
 *       - Person
 *     responses:
 *       405:
 *         description: Method not allowed.
 *         headers:
 *           Allow:
 *             schema:
 *               type: string
 *               example: 'GET'
 *             description: The methods allowed at this endpoint.
 */
router.put(uriConfig.person, sendStatus405('GET, POST'));

/**
 * @swagger
 * /person:
 *   post:
 *     summary: Create new user. (Must Be Admin or Contributor)
 *     tags:
 *       - Person
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lastName:
 *                 required: true
 *                 type: string
 *                 example: Toklas
 *                 description: User's last name.
 *               firstName:
 *                 type: string
 *                 example: Alice
 *                 description: User's first name.
 *               secondName:
 *                 type: string
 *                 example: Babette
 *                 description: User's second/middle name.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       201:
 *         description: The person was created successfully.
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *               example: /cf52bde2-d3ff-4e2b-95f0-8461e0d70edc
 *             description: URI to created user.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Person'
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
 *             
 */
router.post(uriConfig.person, permitRoles(Auth.ADMIN, Auth.CONTRIBUTOR), personRoutes.createPerson);

/**
 * @swagger
 * /person:
 *   get:
 *     summary: Retrieve a list of people.
 *     tags:
 *       - Person
 *     responses:
 *       200:
 *         description: A list of retrieved people.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Person'
 *       404:
 *         description: No person found.
 *             
 */
router.get(uriConfig.person, personRoutes.getPeople);

/**
 * @swagger
 * /person/{personId}:
 *   get:
 *     summary: Get person by personId.
 *     parameters:
 *       - in: path
 *         name: personId
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
 *         description: Retrieved person.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Person'
 *       401:
 *         description: Invalid authentication token.
 *         headers:
 *           WWW-Authenticate:
 *             schema:
 *               type: string
 *               example: Archivepelago Authentication
 *             description: The authentication realm.
 *       404:
 *         description: Person not found.
 * 
 */
router.get(`${uriConfig.person}/:personId`, personRoutes.getPerson);

/**
 * @swagger
 * /person/{personId}:
 *   delete:
 *     summary: Delete person.
 *     parameters:
 *       - in: path
 *         name: personId
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID of the user.
 *     tags:
 *       - Person
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       204:
 *         description: Person was deleted successfully.
 *       401:
 *         description: Invalid authentication token.
 *         headers:
 *           WWW-Authenticate:
 *             schema:
 *               type: string
 *               example: Archivepelago Authentication
 *             description: The authentication realm.
 *       404:
 *         description: Person not found.
 * */
router.delete(`${uriConfig.person}/:personId`, permitRoles(Auth.ADMIN, Auth.CONTRIBUTOR), personRoutes.deletePerson);

/**
 * @swagger
 * /person/{personId}:
 *   put:
 *     summary: Update person.
 *     parameters:
 *       - in: path
 *         name: personID
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID of the person.
 *     tags:
 *       - Person
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lastName:
 *                 required: true
 *                 type: string
 *                 example: Toklas
 *                 description: Person's new or current last name.
 *               firstName:
 *                 required: false
 *                 type: string
 *                 example: Alice
 *                 description: Person's new or current first name.
 *               secondName:
 *                 required: false
 *                 type: string
 *                 example: Babette
 *                 description: Person's new or current second/middle name.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Updated person.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Person'
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
 *       404:
 *         description: Person not found.
 */
router.put(`${uriConfig.person}/:personId`, permitRoles(Auth.ADMIN, Auth.CONTRIBUTOR), personRoutes.updatePerson);

module.exports = router;