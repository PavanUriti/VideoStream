// 'use strict';

const helmet = require('helmet');
const bodyParser = require('body-parser');
const cors = require('cors');
module.exports = init;

/**
 * 
 * @param {*} app 
 */
async function init(app) {
    process.on('uncaughtException', (ex) => {
        console.error(ex, '');
    } );

    process.on('unhandledRejection', (ex) => {
        console.log(ex, '');
    });
    await require('./mongo.init')();
    app.use(cors());
    app.use(helmet());
    app.use(bodyParser.json({limit: '100mb'}));
};
