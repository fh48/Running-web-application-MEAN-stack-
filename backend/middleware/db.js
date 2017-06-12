"use strict";

/** @module DB Middleware */

let Promise = require('es6-promise').Promise,
    config = require('../config'),
    mongoose = require('mongoose');

let initialise = function() {
    // Use ES6 Promise for mongoose
    mongoose.Promise = Promise;

    // Connect to mongoDB
    mongoose.connect(config.mongo.url + config.mongo.dbName, {
        'auth': config.mongo.auth,
        'user': config.mongo.user,
        'pass': config.mongo.password
    }).then(
        () => { console.log('Successfully connected to mongoDB: ' + config.mongo.dbName) },
        err => console.log(err));
}

/**
 * Exports the initialise function which initialises the mongo database.
 */
exports.initialise = initialise;
