/* eslint-disable no-undef */
const { serverInit } = require('./server/utils');

serverInit()
    .then(success => {
        console.log(success);
    })
    .catch(error => {
        console.log(error);
    })
    .finally(() => {
        process.exit();
    });