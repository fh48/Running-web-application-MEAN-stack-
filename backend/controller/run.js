"use strict";

/** @module Run Controller */

let express = require('express'),
	router = express.Router(),
	dao = require('../middleware/dao');

/**
 * Route: /api/run
 */
router.route('/')
	/**
	 * Route to get all runs.
	 */
	.get(function(req, res, next) {
		dao.allRuns()
			.then(runs => res.json(runs))
			.catch(err => next(err));
	})

	/**
	 * Route to update a run.
	 */
	.put(function(req, res, next) {
		dao.updateRun(req.body)
			.then(run => res.json(run))
			.catch(err => next(err));
	})

	/**
	 * Route to create a run.
	 */
	.post(function(req, res, next) {
		dao.createRun(req.body)
			.then(run => res.json(run))
			.catch(err => next(err));
	});

/**
 * Route: /api/run/:id
 */
router.route('/:id')
	/**
	 * Route to get a run by its id.
	 */
	.get(function(req, res, next) {
		dao.runById(req.params.id)
			.then(run => res.json(run))
			.catch(err => next(err));
	})

	/**
	 * Route to delete a run by its id.
	 */
	.delete(function(req, res, next) {
		dao.deleteRun(req.params.id)
			.then(run => res.json(run))
			.catch(err => next(err));
	});

/**
 * Route: /api/run/byUser/:userId
 */
router.route('/byUser/:userId')
	/**
	 * Route to get all runs of a specific user.
	 */
	.get(function(req, res, next) {
		dao.runsByUserId(req.params.userId)
			.then(runs => res.json(runs))
			.catch(err => next(err));
	});

/**
 * Route: /api/run/byDateRange/:startDateTime/:endDate?userId=:userId
 */
router.route('/byDateRange/:startDateTime/:endDate')
	/**
	 * Route to get all runs of a specific user between two dates.
	 */
	.get(function(req, res, next) {
		dao.runsByUserAndDateRange(req.query.userId, req.params.startDateTime, req.params.endDate)
			.then(runs => res.json(runs))
			.catch(err => next(err));
	});

module.exports = router;
