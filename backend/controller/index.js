"use strict";

/** @module The index.js exporting all available controllers. */

let express = require('express'),
	router = express.Router(),
	auth = require('../middleware/auth');

/**
 * List of all routes that require authentication.
 */
router.use('/user', auth.isAuthenticated, require('./user'));
router.use('/run', auth.isAuthenticated, require('./run'));
router.use('/challenge', auth.isAuthenticated, require('./challenge'));
router.use('/route', auth.isAuthenticated, require('./route'));
router.use('/upload', auth.isAuthenticated, require('./upload'));
router.use('/weather', auth.isAuthenticated, require('./weather'));
router.use('/goals', auth.isAuthenticated, require('./goals'));

/**
 * List of all routes that DO NOT require authentication.
 */
router.use('', require('./authentication'));

module.exports = router
