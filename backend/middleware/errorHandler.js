"use strict";

/** @module errorHandler Middleware */

/**
 * Exports function which handles upcoming errors.
 * @param  {Object}   err  The thrown error.
 * @param  {Object}   req  The correspondning request.
 * @param  {Object}   res  The correspondning response.
 * @param  {Function} next Function for passing request to next instance.
 */
module.exports = function(err, req, res, next) {
	if (err) {
		let status = err.status || 500;
		res.status(status).send({ 'status': status, 'error': err.message, 'stack': err.stack });
	} else {
		next();
	}
}
