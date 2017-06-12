"use strict";

/** @module Route Controller */

let express = require('express'),
	router = express.Router(),
	dao = require('../middleware/dao');

/**
 * Route: /api/route
 */
router.route('/')
	/**
	 * Route to get all routes.
	 */
	.get(function(req, res, next) {
		dao.allRoutes()
			.then(routes => res.json(routes))
			.catch(err => next(err));
	})

	/**
	 * Route to create a route.
	 */
	.post(function(req, res, next) {
		dao.createRoute(req.body)
			.then(route => res.json(route))
			.catch(err => next(err));
	});

/**
 * Route: /api/route/:id
 */
router.route('/:id')
	/**
	 * Route to get a route by its id.
	 */
	.get(function(req, res, next) {
		dao.routeById(req.params.id)
			.then(route => res.json(route))
			.catch(err => next(err));
	})

	/**
	 * Route to delete a route by its id.
	 */
	.delete(function(req, res, next) {
		dao.deleteRoute(req.params.id)
			.then(route => res.json(route))
			.catch(err => next(err));
	});

/**
 * Route: /api/route/byUser/:userId
 */
router.route('/byUser/:userId')
	/**
	 * Route to get all routes of a specific user.
	 */
	.get(function(req, res, next) {
		dao.routesByUserId(req.params.userId)
			.then(routes => res.json(routes))
			.catch(err => next(err));
	});

/**
 * Route: /api/route/byFollowed/:userId
 */
router.route('/byFollowed/:userId')
	/**
	 * Route to get all routes of the followed users of a specific user.
	 */
	.get(function(req, res, next) {
		dao.routesByFollowed(req.params.userId)
			.then(routes => res.json(routes))
			.catch(err => next(err));
	});

module.exports = router;
