const express = require('express');
const router = express.Router();
const uriConfig = require('../uriConfig');

// const { permitRoles } = require("../../middleware/auth");
// const { Auth } = require('../../_helpers/auth');
const { sendStatus405 } = require('../../middleware/errors');

/**
 * @swagger
 * /person:
 *   post:
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
router.post(uriConfig.person, sendStatus405('GET'));

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
 *               example: 'GET'
 *             description: The methods allowed at this endpoint.
 */
router.delete(uriConfig.person, sendStatus405('GET'));

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
router.put(uriConfig.person, sendStatus405('GET'));

module.exports = router;