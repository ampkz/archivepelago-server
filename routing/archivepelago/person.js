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


router.post(uriConfig.person, permitRoles(Auth.ADMIN, Auth.CONTRIBUTOR), personRoutes.createPerson);

module.exports = router;