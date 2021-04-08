require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const app = express();
const uriConfig = require('../routing/uriConfig');

// eslint-disable-next-line no-undef
global.__basedir = __dirname;

const { errorHandler } = require("../middleware/errors");
const admin = require('../routing/admin');
const authenticate = require('../routing/authenticate');


app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(uriConfig.api, authenticate);
app.use(uriConfig.api + uriConfig.admin, admin);

// eslint-disable-next-line no-undef
if(process.env.NODE_ENV !== 'test'){
	const swaggerJSDoc = require('swagger-jsdoc');
	const swaggerUi = require('swagger-ui-express');

	const swaggerDefinition = {
		openapi: '3.0.0',
		info: {
			title: 'Archivepelago API',
			version: '0.2.0',
			description:
				'This is the REST API for Archivepelago, a project modeling the transmission of notions of sexuality and gender by mapping networks of 19th and 20th century queer writers and artists.',
			license: {
				name: 'Licensed Under Open Source (GPLv3) License',
				url: 'https://www.gnu.org/licenses/gpl-3.0.html',
			},
			contact: {
				name: 'Archivepelago',
				url: 'https://archivepelago.org',
			},
		},
		servers: [
			{
				url: 'http://localhost:3001/api',
				description: 'Development server'
			},
			{
				url: 'https://archivepelago.org/api',
				description: 'Production server',
			},
		]
	};
	
	const options = {
		swaggerDefinition,
		// Paths to files containing OpenAPI definitions
		apis: ['./routing/api/*.js', './routing/admin/*.js', './routing/authenticate/*.js'],
	};
	
	const swaggerSpec = swaggerJSDoc(options);
	
	app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {customSiteTitle: 'Archivepelago API'}));
}

app.use(function(req,res,next){
	let err = new Error("Not Found");
	err.status = 404;
	err.code = 1000;
	next(err);
});

app.use(errorHandler);

module.exports = app;