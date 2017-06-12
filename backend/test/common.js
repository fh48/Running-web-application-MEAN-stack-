"use strict";

process.env.NODE_ENV = 'test';

let Promise = require('es6-promise').Promise,
	chai = require('chai'),
	chaiHttp = require('chai-http'),
	mongoose = require("mongoose"),
	should = chai.should(),
	server = require('../app'),
	dao = require('../middleware/dao'),
	mainUser = null,
	followedUser = null,

	/**
	 * Drops the database.
	 * @return {Promise}
	 */
	purgeDB = function() {
		return new Promise(function(resolve, reject) {
			mongoose.connection.db.dropDatabase(function() {
				resolve();
			});
		});
	},

	/**
	 * Logs in a test user.
	 * @return {Promise}
	 */
	login = function() {
		return dao.createUser({
				'name': 'test',
				'password': 'test',
				'weight': 80,
				'height': 185,
				'gender': 'male',
				'email': 'test@test.com'
			})
			.then(user => {
				mainUser = user;
				return dao.createUser({
					'name': 'test2',
					'password': 'test2',
					'weight': 60,
					'height': 170,
					'gender': 'female',
					'email': 'test2@test2.com'
				})
			})
			.then(followed => {
				followedUser = followed;
				return dao.followUser(mainUser._id, followedUser._id)
			})
			.then(() => dao.loginUser('test', 'test'))
			.then(data => {
				return {
					'user': data.user,
					'followedUser': followedUser,
					'token': 'JWT ' + data.token
				};
			})
			.catch(function(err) {
				console.log(err);
			});
	};

chai.use(chaiHttp);

exports.chai = chai;
exports.server = server;
exports.mongoose = mongoose;
exports.should = should;
exports.dao = dao;
exports.purgeDB = purgeDB;
exports.login = login;
