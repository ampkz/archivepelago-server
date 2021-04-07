const express = require('express');
const router = express.Router();

const { permitRoles } = require("../../middleware/auth");
const { sendStatus405 } = require('../../middleware/errors');
const { Auth } = require('../../_helpers/auth');

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