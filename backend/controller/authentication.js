"use strict";

/** @module Authentication Controller */

let express = require('express'),
	passport = require('passport'),
	router = express.Router(),
	dao =  require('../middleware/dao');

/**
 * Route: /api/login
 */
router.route('/login')
	/**
	 * Route to login a user.
	 * If user credentials are valid, a JWT token and the user object is returned.
	 */
	.post(function(req, res, next) {
		dao.loginUser(req.body.name, req.body.password)
			.then(data => res.json(data))
			.catch(err => next(err));
	});

/**
 * Route: /api/register
 */
router.route('/register')
	/**
	 * Route to register a user.
	 */
	.post(function(req, res, next) {
		dao.createUser(req.body)
			.then(data => res.json(data))
			.catch(err => next(err));
	});

module.exports = router;
