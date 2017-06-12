"use strict";

/** @module Goals Controller */

let express = require('express'),
	router = express.Router(),
	dao = require('../middleware/dao');

/**
 * Route: /api/goals
 */
router.route('/')
	/**
	 * Route to update goals.
	 */
	.put(function(req, res, next) {
		dao.updateGoals(req.body)
			.then(goals => res.json(goals))
			.catch(err => next(err));
	})

	/**
	 * Route to create goals.
	 */
	.post(function(req, res, next) {
		dao.createGoals(req.body)
			.then(goals => res.json(goals))
			.catch(err => next(err));
	});

/**
 * Route: /api/goals/:id
 */
router.route('/:id')
	/**
	 * Route to get goals by its id.
	 */
	.get(function(req, res, next) {
		dao.goalsById(req.params.id)
			.then(goals => res.json(goals))
			.catch(err => next(err));
	})

	/**
	 * Route to delete goals by its id.
	 */
	.delete(function(req, res, next) {
		dao.deleteGoals(req.params.id)
			.then(goals => res.json(goals))
			.catch(err => next(err));
	});

/**
 * Route: /api/goals/byUser/:userId
 */
router.route('/byUser/:userId')
	/**
	 * Route to get goals of a specific user.
	 */
	.get(function(req, res, next) {
		dao.goalsByUserId(req.params.userId)
			.then(goals => res.json(goals)
				.catch(err => next(err)));
	});

/**
 * Route: /api/goals/byUser/:userId/current
 */
router.route('/byUser/:userId/current')
	/**
	 * Route to get the current goals of a specific user.
	 */
	.get(function(req, res, next) {
		dao.currentGoalsByUserId(req.params.userId)
			.then(goals => res.json(goals)
				.catch(err => next(err)));
	});

module.exports = router;
