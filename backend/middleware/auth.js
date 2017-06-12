"use strict";

/** @module Authentication Middleware
 * This module's structure is inspired from a solution for the second assignment.
 */

let passport = require('passport'),
	config = require('../config'),
	dao = require('./dao'),
	JwtStrategy = require('passport-jwt').Strategy,
	ExtractJwt = require('passport-jwt').ExtractJwt,
	opts = {};

/**
 * The extractor specifies the way in how the JWT token gets extracted fromt the
 * http header. In this case, the JWT token is extracted from the
 * Authorization header in the http request.
 */
opts.jwtFromRequest = ExtractJwt.fromAuthHeader();

/**
 * Defines the private key taken from the configuration module for
 * JWT token generation.
 */
opts.secretOrKey = config.jwt.secret;

/**
 * Provide a function to passport in order to identify if user is valid or not.
 * The identification is done by requesting the database.
 */
passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
	dao.userById(jwt_payload.id)
		.then(user => {
			if (!user) {
				return done(null, false);
			} else {
				return done(null, user);
			}
		})
		.catch(err => done(err));
}));

/**
 * Exports the authentication function which starts the authentication process.
 * This function is used by the controllers to make authentication mandatory.
 */
exports.isAuthenticated = passport.authenticate('jwt', {
	session: false
});
