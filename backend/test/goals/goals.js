"use strict";

let common = require("../common"),
	server = common.server,
	chai = common.chai,
	should = common.should,
	purgeDB = common.purgeDB,
	login = common.login,
	dao = common.dao,

	Goals = require('../../model/Goals'),

	authToken = null,
	user = null,
	followedUser = null,
	obj = null,
	startDateTime = new Date().getTime(),
	endDateTime = new Date().setDate(new Date().getDate() + 7);

before(function(done) {
	login()
		.then(data => {
			user = data.user;
			followedUser = data.followedUser;
			authToken = data.token;
			done();
		})
		.catch(function(err) {
			console.log(err);
			done();
		});
});

after(function(done) {
	purgeDB().then(() => done());
});

beforeEach(function(done) {
	var sampleGoals = {
		'user': user._id,
		'distance': 1,
		'speed': 1,
		'steps': 1,
		'startDateTime': startDateTime,
		'endDateTime': endDateTime
	};

	Goals.insertMany([sampleGoals])
		.then(docs => {
			obj = docs[0];
			done();
		})
		.catch(function(err) {
			console.log(err);
			done();
		});
});

afterEach(function(done) {
	Goals.collection.drop(function(err) {
		done();
	});
});

it('GET single goals', function(done) {
	chai.request(server)
		.get('/api/goals/' + obj._id)
		.set('Authorization', authToken)
		.end(function(err, res) {
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('object');
			res.body.should.have.property('_id');
			res.body.should.have.property('__v');
			res.body.should.have.property('user');
			res.body.should.have.property('distance');
			res.body.should.have.property('speed');
			res.body.should.have.property('steps');
			res.body.should.have.property('startDateTime');
			res.body.should.have.property('endDateTime');

			res.body._id.should.be.a('string');
			res.body._id.should.equal(obj._id.toString());
			res.body.user.should.be.a('object');
			res.body.user._id.should.equal(user._id.toString());
			res.body.distance.should.be.a('number');
			res.body.distance.should.equal(obj.distance);
			res.body.speed.should.be.a('number');
			res.body.speed.should.equal(obj.speed);
			res.body.steps.should.be.a('number');
			res.body.steps.should.equal(obj.steps);
			new Date(res.body.startDateTime).should.be.a('date');
			new Date(res.body.startDateTime).getTime().should.equal(new Date(obj.startDateTime).getTime());
			new Date(res.body.endDateTime).should.be.a('date');
			new Date(res.body.endDateTime).getTime().should.equal(new Date(obj.endDateTime).getTime());
			done();
		});
});

it('POST single goals', function(done) {
	var goals = {
		'user': user._id,
		'distance': 1,
		'speed': 1,
		'steps': 1,
		'startDateTime': startDateTime,
		'endDateTime': endDateTime
	};

	chai.request(server)
		.post('/api/goals')
		.send(goals)
		.set('Authorization', authToken)
		.end(function(err, res) {
			// POST Response
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('object');
			res.body.should.have.property('_id');
			res.body.should.have.property('__v');
			res.body.should.have.property('user');
			res.body.should.have.property('distance');
			res.body.should.have.property('speed');
			res.body.should.have.property('steps');
			res.body.should.have.property('startDateTime');
			res.body.should.have.property('endDateTime');

			res.body._id.should.be.a('string');
			res.body.user.should.be.a('string');
			res.body.user.should.equal(user._id.toString());
			res.body.distance.should.be.a('number');
			res.body.distance.should.equal(goals.distance);
			res.body.speed.should.be.a('number');
			res.body.speed.should.equal(goals.speed);
			res.body.steps.should.be.a('number');
			res.body.steps.should.equal(goals.steps);
			new Date(res.body.startDateTime).should.be.a('date');
			new Date(res.body.startDateTime).getTime().should.equal(new Date(goals.startDateTime).getTime());
			new Date(res.body.endDateTime).should.be.a('date');
			new Date(res.body.endDateTime).getTime().should.equal(new Date(goals.endDateTime).getTime());
			done();
		});
});

it('PUT single goals', function(done) {
	obj.distance = 3

	chai.request(server)
		.put('/api/goals')
		.send(obj)
		.set('Authorization', authToken)
		.end(function(err, res) {
			// PUT Response
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('object');
			res.body.should.have.property('_id');
			res.body.should.have.property('__v');
			res.body.should.have.property('user');
			res.body.should.have.property('distance');
			res.body.should.have.property('speed');
			res.body.should.have.property('steps');
			res.body.should.have.property('startDateTime');
			res.body.should.have.property('endDateTime');

			// Changed property
			res.body.distance.should.be.a('number');
			res.body.distance.should.equal(3);

			// Object fields
			res.body.user.should.be.a('string');
			res.body.user.should.equal(user._id.toString());
			res.body.speed.should.be.a('number');
			res.body.speed.should.equal(obj.speed);
			res.body.steps.should.be.a('number');
			res.body.steps.should.equal(obj.steps);
			new Date(res.body.startDateTime).should.be.a('date');
			new Date(res.body.startDateTime).getTime().should.equal(new Date(obj.startDateTime).getTime());
			new Date(res.body.endDateTime).should.be.a('date');
			new Date(res.body.endDateTime).getTime().should.equal(new Date(obj.endDateTime).getTime());
			done();
		});
});

it('DELETE single goals', function(done) {
	chai.request(server)
		.delete('/api/goals/' + obj._id)
		.set('Authorization', authToken)
		.end(function(err, res) {
			// DELETE Response
			res.body.should.be.a('object');
			res.body.should.have.property('_id');
			res.body.should.have.property('__v');
			res.body.should.have.property('user');
			res.body.should.have.property('distance');
			res.body.should.have.property('speed');
			res.body.should.have.property('steps');
			res.body.should.have.property('startDateTime');
			res.body.should.have.property('endDateTime');

			// Check Response
			chai.request(server)
				.get('/api/goals/' + res.body._id)
				.set('Authorization', authToken)
				.end(function(err, res) {
					res.should.have.status(200);
					should.equal(res.body, null);
					done();
				});
		});
});

it('GET all goals by user', function(done) {
	chai.request(server)
		.get('/api/goals/byUser/' + user._id)
		.set('Authorization', authToken)
		.end(function(err, res) {
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('array');
			res.body.should.have.lengthOf(1);
			done();
		});
});

it('GET current goals by user', function(done) {
	chai.request(server)
		.get('/api/goals/byUser/' + user._id + '/current')
		.set('Authorization', authToken)
		.end(function(err, res) {
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('object');
			res.body.should.have.property('_id');
			res.body.should.have.property('__v');
			res.body.should.have.property('user');
			res.body.should.have.property('distance');
			res.body.should.have.property('speed');
			res.body.should.have.property('steps');
			res.body.should.have.property('startDateTime');
			res.body.should.have.property('endDateTime');

			res.body._id.should.be.a('string');
			res.body._id.should.equal(obj._id.toString());
			res.body.user.should.be.a('object');
			res.body.user._id.should.equal(user._id.toString());
			res.body.distance.should.be.a('number');
			res.body.distance.should.equal(obj.distance);
			res.body.speed.should.be.a('number');
			res.body.speed.should.equal(obj.speed);
			res.body.steps.should.be.a('number');
			res.body.steps.should.equal(obj.steps);
			new Date(res.body.startDateTime).should.be.a('date');
			new Date(res.body.startDateTime).getTime().should.equal(new Date(obj.startDateTime).getTime());
			new Date(res.body.endDateTime).should.be.a('date');
			new Date(res.body.endDateTime).getTime().should.equal(new Date(obj.endDateTime).getTime());
			done();
		});
});
