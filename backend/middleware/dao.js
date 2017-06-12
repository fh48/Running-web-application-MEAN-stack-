"use strict";

/** @module DAO Middleware */

let Promise = require('es6-promise').Promise,
	mongoose = require('mongoose'),
	ObjectId = mongoose.Types.ObjectId,
	jwt = require('jsonwebtoken'),
	config = require('../config'),
	bcrypt = require('bcryptjs'),

	User = require('../model/User'),
	Run = require('../model/Run'),
	Route = require('../model/Route'),
	Challenge = require('../model/Challenge'),
	Goals = require('../model/Goals');

/**
 * The data access object class provides an interface for the database.
 * @class
 */
class Dao {


	/* -------------------------------------
	----------------- User -----------------
	----------------------------------------*/

	/**
	 * Logs in a user.
	 * @param  {string} name The user name.
	 * @param  {string} password The user password.
	 * @return {Promise}    Resolves to the user object and JWT authentication token.
	 */
	loginUser(name, password) {
		let that = this;

		let promise = new Promise(function(resolve, reject) {
			that.userByName(name)
				.then(user => {
					// Checks the password
					if (user) {
						return bcrypt.compare(password, user.password)
							.then(isValid => {
								if (isValid) {
									let payload = { id: user._id },
										token = jwt.sign(payload, config.jwt.secret);

									resolve({
										user: user,
										token: token
									});
								} else {
									reject(new Error('Wrong password.'));
								}
							})
							.catch(err => reject(err));
					} else {
						reject(new Error('Wrong user name.'));
					}
				})
				.catch(err => reject(err));
		});
		return promise;
	}

	/**
	 * Creates a user and stores it in the database.
	 * @param  {Object} data The raw user object.
	 * @return {Promise}
	 */
	createUser(data) {
		// Create hash first before storing in database.
		return bcrypt.genSalt(10)
			.then(salt => {
				return bcrypt.hash(data.password, salt);
			})
			.then(hash => {
				// Stores a hashed version of the password into the database.
				data.password = hash;
				return this.create(data, this.validateUser.bind(this));
			})
			.catch(err => new Promise(function(resolve, reject) { reject(err) }));
	}

	/**
	 * Get user by id from the database.
	 * @param  {string} id The user id.
	 * @return {Promise}
	 */
	userById(id) {
		return this.getById(User, id);
	}

	/**
	 * Get all users from the database.
	 */
	allUsers() {
		return this.getMultipleByQuery(User, {});
	}

	/**
	 * Get user by name from the database.
	 * @param  {string} name The user name.
	 * @return {Promise}
	 */
	userByName(name) {
		return this.getSingleByQuery(User, { 'name': name });
	}

	/**
	 * Get all the followed users of a user from the database.
	 * @param  {string} userId The user id.
	 * @return {Promise}
	 */
	userByFollowed(userId) {
		let that = this;

		let promise = new Promise(function(resolve, reject) {
			that.userById(userId)
				.then(user => that.getMultipleByQuery(User, { '_id': { '$in': user.follows } }))
				.then(users => resolve(users))
				.catch(err => reject(err));
		});

		return promise;
	}

	/**
	 * Updates a user and stores it in the database.
	 * @param  {Object} data The raw user object.
	 * @return {Promise}
	 */
	updateUser(data) {
		return this.update(User, data, this.validateUser.bind(this));
	}

	/**
	 * A follower is added to a user and the updated user
	 * is stored in the database.
	 * @param  {string} followerId The follower id.
	 * @param  {string} userId The id of the followed user.
	 * @return {Promise}
	 */
	followUser(followerId, userId) {
		let that = this;

		let promise = new Promise(function(resolve, reject) {
			that.userById(followerId)
				.then(follower => {
					try {
						follower.follow(userId);
						return that.updateUser(follower);
					} catch (err) {
						reject(err);
					}
				})
				.then(updatedFollower => resolve(updatedFollower))
				.catch(err => reject(err));
		});

		return promise;
	}

	/**
	 * Deletes a user by its id.
	 * @param  {string} id The user id.
	 * @return {Promise}
	 */
	deleteUser(id) {
		return this.delete(User, id);
	}

	/**
	 * Validates a user.
	 * A user is considered valid if its mandatory attributes are present
	 * and if the name is not already in use.
	 * @param  {Object} data The raw user object.
	 * @return {Promise}
	 */
	validateUser(data) {
		let that = this;

		let promise = new Promise(function(resolve, reject) {
			that.userByName(data.name)
				.then(user => {
					// Compare if username is already taken.
					if (user && !data._id || user && !user._id.equals(data._id)) {
						reject(new Error('User name is already taken.'));
					} else {
						try {
							resolve(new User(data));
						} catch (err) {
							reject(err);
						}
					}
				})
				.catch(err => reject(err));
		});
		return promise;
	}


	/* -------------------------------------
	----------------- Run -----------------
	----------------------------------------*/

	/**
	 * Get run by id from the database.
	 * @param  {string} id The run id.
	 * @return {Promise}
	 */
	runById(id) {
		return this.getById(Run, id);
	}

	/**
	 * Get all runs from the database.
	 */
	allRuns() {
		return this.getMultipleByQuery(Run, {});
	}

	/**
	 * Get runs by userId from the database.
	 * @param  {string} userId The user's userId.
	 * @return {Promise}
	 */
	runsByUserId(userId) {
		return this.getMultipleByQuery(Run, { 'user': ObjectId(userId) });
	}

	/**
	 * Get runs by userId between start date and end date from the database.
	 * @param  {string} userId The user id.
	 * @param  {Date} startDateTime The start date time of the time range.
	 * @param  {Date} endDateTime The end date time of the time range.
	 * @return {Promise}
	 */
	runsByUserAndDateRange(userId, startDateTime, endDateTime) {
		return this.getMultipleByQuery(Run, {
			'user': userId,
			'startDateTime': {
				'$gt': startDateTime,
				'$lt': endDateTime
			}
		});
	}

	/**
	 * Creates a run and stores it in the database.
	 * @param  {Object} data The raw run object.
	 * @return {Promise}
	 */
	createRun(data) {
		return this.create(data, this.validateRun.bind(this));
	}

	/**
	 * Updates a run and stores it in the database.
	 * @param  {Object} data The raw run object.
	 * @return {Promise}
	 */
	updateRun(data) {
		return this.update(Run, data, this.validateRun.bind(this));
	}

	/**
	 * Deletes a run by its id.
	 * @param  {string} id The run id.
	 * @return {Promise}
	 */
	deleteRun(id) {
		return this.delete(Run, id);
	}

	/**
	 * Validates a run.
	 * A run is considered valid if its mandatory attributes are present
	 * and if the user id belongs to a valid user.
	 * @param  {Object} data The raw run object.
	 * @return {Promise}
	 */
	validateRun(data) {
		let that = this;

		let promise = new Promise(function(resolve, reject) {
			let userId = data.user._id || data.user;

			that.userById(userId)
				.then(user => {
					if (user) {
						try {
							resolve(new Run(data));
						} catch (err) {
							reject(err);
						}
					} else {
						reject(new Error('User id is invalid'));
					}
				})
				.catch(err => reject(err));
		});
		return promise;
	}


	/* -------------------------------------
	----------------- Route ----------------
	----------------------------------------*/

	/**
	 * Get route by id from the database.
	 * @param  {string} id The route id.
	 * @return {Promise}
	 */
	routeById(id) {
		return this.getById(Route, id);
	}

	/**
	 * Get all routes from the database.
	 */
	allRoutes() {
		return this.getMultipleByQuery(Route, {});
	}

	/**
	 * Get routes by userId from the database.
	 * @param  {string} userId The user id.
	 * @return {Promise}
	 */
	routesByUserId(userId) {
		return this.getMultipleByQuery(Route, { 'user': ObjectId(userId) });
	}

	/**
	 * Get routes by followed users of a user.
	 * @param  {string} userId The user id.
	 * @return {Promise}
	 */
	routesByFollowed(userId) {
		let that = this;

		let promise = new Promise(function(resolve, reject) {
			that.userById(userId)
				.then(user => that.getMultipleByQuery(Route, { 'user': { '$in': user.follows } }))
				.then(routes => resolve(routes))
				.catch(err => reject(err));
		});

		return promise;
	}

	/**
	 * Creates a route and stores it in the database.
	 * @param  {Object} data The raw route object.
	 * @return {Promise}
	 */
	createRoute(data) {
		let that = this,
			tempRoute = null;

		let promise = new Promise(function(resolve, reject) {
			that.create(data, that.validateRoute.bind(that))
				.then(route => {
					tempRoute = route;
					return that.runById(route.run);
				})
				.then(run => {
					try {
						run.route = tempRoute._id;
						return that.updateRun(run);
					} catch (err) {
						return that.deleteRoute(tempRoute._id)
							.then(() => reject(err))
							.catch(() => reject(err));
					}
				})
				.then(() => resolve(tempRoute))
				.catch(err => reject(err));
		});

		return promise;
	}

	/**
	 * Updates a route and stores it in the database.
	 * @param  {Object} data The raw route object.
	 * @return {Promise}
	 */
	updateRoute(data) {
		return this.update(Route, data, this.validateRoute.bind(this));
	}

	/**
	 * Deletes a route by its id.
	 * @param  {string} id The route id.
	 * @return {Promise}
	 */
	deleteRoute(id) {
		return this.delete(Route, id);
	}

	/**
	 * Validates a route.
	 * A route is considered valid if its mandatory attributes are present,
	 * if the user id belongs to a valid user and if the run id belongs to a
	 * valid run.
	 * @param  {Object} data The raw route object.
	 * @return {Promise}
	 */
	validateRoute(data) {
		let that = this;

		let promise = new Promise(function(resolve, reject) {
			let userId = data.user._id || data.user,
				runId = data.run._id || data.run;

			that.userById(userId)
				.then(user => {
					if (user) {
						return that.runById(runId);
					} else {
						reject(new Error('User id is invalid'));
					}
				})
				.then(run => {
					if (run) {
						if (!run.route || run.route.equals(data._id)) {
							try {
								resolve(new Route(data));
							} catch (err) {
								reject(err);
							}
						} else {
							reject(new Error('Run is already published'));
						}
					} else {
						reject(new Error('Run id is invalid'));
					}
				})
				.catch(err => reject(err));
		});
		return promise;
	}


	/* -------------------------------------
	--------------- Challenge --------------
	----------------------------------------*/

	/**
	 * Get challenge by id from the database.
	 * @param  {string} id The challenge id.
	 * @return {Promise}
	 */
	challengeById(id) {
		return this.getById(Challenge, id);
	}

	/**
	 * Get all challenges from the database.
	 */
	allChallenges() {
		return this.getMultipleByQuery(Challenge, {});
	}

	/**
	 * Get challenges by userId from the database.
	 * @param  {string} userId The user id.
	 * @return {Promise}
	 */
	challengesByUserId(userId) {
		return this.getMultipleByQuery(Challenge, { 'user': ObjectId(userId) });
	}

	/**
	 * Get challenges by routeId from the database.
	 * @param  {string} routeId The route id.
	 * @return {Promise}
	 */
	challengesByRouteId(routeId) {
		return this.getMultipleByQuery(Challenge, { 'route': ObjectId(routeId) });
	}

	/**
	 * Creates a challenge and stores it in the database.
	 * @param  {Object} data The raw challenge object.
	 * @return {Promise}
	 */
	challengeRoute(data) {
		let that = this,
			tempChallenge = null,
			userId = data.user._id || data.user;

		let promise = new Promise(function(resolve, reject) {
			that.create(data, that.validateChallenge.bind(that))
				.then(challenge => {
					tempChallenge = challenge;
					return that.routeById(challenge.route);
				})
				.then(route => {
					try {
						route.challenge(ObjectId(userId));
						return that.updateRoute(route);
					} catch (err) {
						return that.deleteChallenge(tempChallenge._id)
							.then(() => reject(err))
							.catch(() => reject(err));
					}
				})
				.then(() => resolve(tempChallenge))
				.catch(err => reject(err));
		});

		return promise;
	}

	/**
	 * Deletes a challenge by its id.
	 * @param  {string} id The challenge id.
	 * @return {Promise}
	 */
	deleteChallenge(id) {
		return this.delete(Challenge, id);
	}

	/**
	 * Validates a challenge.
	 * A challenge is considered valid if its mandatory attributes are present,
	 * if the user id belongs to a valid user and if the route id belongs to
	 * valid route.
	 * @param  {Object} data The raw challenge object.
	 * @return {Promise}
	 */
	validateChallenge(data) {
		let that = this;

		let promise = new Promise(function(resolve, reject) {
			let userId = data.user._id || data.user,
				routeId = data.route._id || data.route;

			that.userById(userId)
				// Check for valid user id.
				.then(user => {
					if (user) {
						return that.routeById(routeId);
					} else {
						reject(new Error('User id is invalid'));
					}
				})
				// Check for valid route id.
				.then(route => {
					if (route) {
						try {
							resolve(new Challenge(data));
						} catch (err) {
							reject(err);
						}
					} else {
						reject(new Error('Route id is invalid'));
					}
				})
				.catch(err => reject(err));
		});
		return promise;
	}

	/* -------------------------------------
	 --------------- Goals ----------------
	 ----------------------------------------*/

	/**
	 * Get goals by id from the database.
	 * @param  {string} id The goals id.
	 * @return {Promise}
	 */
	goalsById(id) {
		return this.getById(Goals, id);
	}

	/**
	 * Get goals by userId from the database.
	 * @param  {string} userId The user's userId.
	 * @return {Promise}
	 */
	goalsByUserId(userId) {
		return this.getMultipleByQuery(Goals, { 'user': ObjectId(userId) });
	}

	/**
	 * Get current goals by userId from the database.
	 * @param  {string} userId The user id.
	 * @return {Promise}
	 */
	currentGoalsByUserId(userId) {
		let currentDateTime = new Date();

		return this.getSingleByQuery(Goals, {
			'user': userId,
			'startDateTime': {
				'$lte': currentDateTime
			},
			'endDateTime': {
				'$gte': currentDateTime
			}
		})
	}

	/**
	 * Creates goals and stores it in the database.
	 * @param  {Object} data The raw goals object.
	 * @return {Promise}
	 */
	createGoals(data) {
		return this.create(data, this.validateGoals.bind(this));
	}

	/**
	 * Updates goals and stores it in the database.
	 * @param  {Object} data The raw goals object.
	 * @return {Promise}
	 */
	updateGoals(data) {
		return this.update(Goals, data, this.validateGoals.bind(this));
	}

	/**
	 * Deletes goals by its id.
	 * @param  {string} id The goals id.
	 * @return {Promise}
	 */
	deleteGoals(id) {
		return this.delete(Goals, id);
	}

	/**
	 * Validates goals.
	 * Goals are considered valid if its mandatory attributes are present
	 * and if the user id belongs to a valid user.
	 * @param  {Object} data The raw goals object.
	 * @return {Promise}
	 */
	validateGoals(data) {
		let that = this;

		let promise = new Promise(function(resolve, reject) {
			let userId = data.user._id || data.user;

			that.userById(userId)
				.then(user => {
					if (user) {
						try {
							resolve(new Goals(data));
						} catch (err) {
							reject(err);
						}
					} else {
						reject(new Error('User id is invalid'));
					}
				})
				.catch(err => reject(err));
		});
		return promise;
	}



	/* -------------------------------------
	--------------- Generic ----------------
	----------------------------------------*/

	/**
	 * Gets multiple database documents by database query.
	 * @param  {Object} model The defined mongoose model of the document.
	 * @param  {Object} query The defined query for the lookup.
	 * @return {Promise}
	 */
	getMultipleByQuery(model, query) {
		let promise = new Promise(function(resolve, reject) {
			model.find(query)
				.then(data => resolve(data))
				.catch(err => reject(err));
		});
		return promise;
	}

	/**
	 * Gets a single database document by database query.
	 * @param  {Object} model The defined mongoose model of the document.
	 * @param  {Object} query The defined query for the lookup.
	 * @return {Promise}
	 */
	getSingleByQuery(model, query) {
		let promise = new Promise(function(resolve, reject) {
			model.findOne(query)
				.then(data => {
					return resolve(data)
				})
				.catch(err => reject(err));
		});
		return promise;
	}

	/**
	 * Gets a database document by id.
	 * @param  {Object} model The defined mongoose model of the document.
	 * @param  {string} id The document id.
	 * @return {Promise}
	 */
	getById(model, id) {
		let promise = new Promise(function(resolve, reject) {
			model.findById(id)
				.then(data => resolve(data))
				.catch(err => reject(err));
		});
		return promise;
	}

	/**
	 * Creates a database document.
	 * @param  {Object} data The raw object which is persisted.
	 * @param  {function} validation The function which validates
	 * the object before persisting.
	 * @return {Promise}
	 */
	create(data, validation) {
		let promise = new Promise(function(resolve, reject) {
			// validation function is used to keep create function generic
			// and still provide object dependent validation before the creating.
			validation(data)
				.then(data => {
					data.save()
						.then(data => resolve(data))
						.catch(err => {
							reject(err)
						});
				})
				.catch(err => reject(err));
		});

		return promise;
	}

	/**
	 * Updates a database document.
	 * @param  {Object} model The defined mongoose model of the document.
	 * @param  {Object} data The updated data.
	 * @param  {function} validation The function which validates
	 * the object before persisting.
	 * @return {Promise}
	 */
	update(model, data, validation) {
		let promise = new Promise(function(resolve, reject) {
			// validation function is used to keep update function generic
			// and still provide object dependent validation before the updating.
			validation(data)
				.then(data => {
					model.findOneAndUpdate({ _id: data._id }, data, { new: true })
						.then(data => resolve(data))
						.catch(err => reject(err));
				})
				.catch(err => reject(err));
		});
		return promise;
	}


	/**
	 * Deletes a database document.
	 * @param  {Object} model The associated model with the object.
	 * @param  {string} id The document id.
	 * @return {Promise}
	 */
	delete(model, id) {
		let promise = new Promise(function(resolve, reject) {
			model.findOneAndRemove({ _id: id })
				.then(data => resolve(data))
				.catch(err => reject(err));
		});
		return promise;
	}

}

module.exports = new Dao();
