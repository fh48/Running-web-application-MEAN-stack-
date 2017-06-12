"use strict";

/** @module User Controller */

let express = require('express'),
	router = express.Router(),
	dao = require('../middleware/dao');

/**
 * Route: /api/user
 */
router.route('/')
	/**
	 * Route to get all users.
	 */
	.get(function(req, res, next) {
		dao.allUsers()
			.then(users => res.json(users))
			.catch(err => next(err));
	})

	/**
	 * Route to update a user.
	 */
	.put(function(req, res, next) {
		dao.updateUser(req.body)
			.then(user => res.json(user))
			.catch(err => next(err));
	});

/**
 * Route: /api/user/:followerId/follow/:userId
 */
router.route('/:followerId/follow/:userId')
	/**
	 * Route to let a user follow another user.
	 */
	.get(function(req, res, next) {
		dao.followUser(req.params.followerId, req.params.userId)
			.then(user => res.json(user))
			.catch(err => next(err));
	});

/**
 * Route: /api/user/:id
 */
router.route('/:id')
	/**
	 * Route to get a user by its id.
	 */
	.get(function(req, res, next) {
		dao.userById(req.params.id)
			.then(user => res.json(user))
			.catch(err => next(err));
	})

	/**
	 * Route to delete a user by its id.
	 */
	.delete(function(req, res, next) {
		dao.deleteUser(req.params.id)
			.then(user => res.json(user))
			.catch(err => next(err));
	});

/**
 * Route: /api/user/:userId/followed
 */
router.route('/:userId/followed')
	/**
	 * Route to get followed users of a user.
	 */
	.get(function(req, res, next) {
		dao.userByFollowed(req.params.userId)
			.then(users => res.json(users))
			.catch(err => next(err));
	});

module.exports = router;
