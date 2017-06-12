"use strict";

let common = require("../common"),
	server = common.server,
	chai = common.chai,
	should = common.should,
	purgeDB = common.purgeDB,
	login = common.login,
	dao = common.dao,

	Run = require('../../model/Run'),
	Route = require('../../model/Route'),
	Challenge = require('../../model/Challenge'),

	authToken = null,
	user = null,
	followedUser = null,
	obj = null,
	route = null,
	startDateTime = new Date().getTime(),
	endDateTime = new Date().setHours(new Date().getHours() + 1);

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
	var sampleRun = {
			'user': user._id,
			'distance': 1,
			'totalClimb': 1,
			'elevationData': [{ 'test': 'test' }],
			'timestamps': [{ 'test': 'test' }],
			'geo': { 'test': 'test' },
			'startDateTime': startDateTime,
			'endDateTime': endDateTime
		},
		sampleRoute = {
			'name': 'test',
			'run': null,
			'user': followedUser._id,
			'distance': 1,
			'elevationData': [{ 'test': 'test' }],
			'geo': { 'test': 'test' }
		},
		sampleChallenge = {
			'user': followedUser._id,
			'route': null,
			'startDateTime': startDateTime,
			'endDateTime': endDateTime
		};

	Run.insertMany([sampleRun])
		.then(docs => {
			sampleRoute.run = docs[0]._id;
			return Route.insertMany([sampleRoute]);
		})
		.then(docs => {
			route = docs[0];
			sampleChallenge.route = route._id;
			return dao.challengeRoute(sampleChallenge);
		})
		.then(challenge => {
			obj = challenge;
			done();
		})
		.catch(function(err) {
			console.log(err);
			done();
		});
});

afterEach(function(done) {
	Challenge.collection.drop(function(err) {
		done();
	});
});

it('GET all challenges', function(done) {
	chai.request(server)
		.get('/api/challenge')
		.set('Authorization', authToken)
		.end(function(err, res) {
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('array');
			res.body.should.have.lengthOf(1);
			done();
		});
});

it('GET single challenge', function(done) {
	chai.request(server)
		.get('/api/challenge/' + obj._id)
		.set('Authorization', authToken)
		.end(function(err, res) {
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('object');
			res.body.should.have.property('_id');
			res.body.should.have.property('__v');
			res.body.should.have.property('user');
			res.body.should.have.property('route');
			res.body.should.have.property('startDateTime');
			res.body.should.have.property('endDateTime');

			res.body._id.should.be.a('string');
			res.body._id.should.equal(obj._id.toString());
			res.body.user.should.be.a('object');
			res.body.user._id.should.equal(followedUser._id.toString());
			res.body.route.should.be.a('object');
			res.body.route._id.should.equal(route._id.toString());
			new Date(res.body.startDateTime).should.be.a('date');
			new Date(res.body.startDateTime).getTime().should.equal(new Date(obj.startDateTime).getTime());
			new Date(res.body.endDateTime).should.be.a('date');
			new Date(res.body.endDateTime).getTime().should.equal(new Date(obj.endDateTime).getTime());
			done();
		});
});

it('POST single challenge', function(done) {
	chai.request(server)
		.post('/api/challenge/route')
		.send({
			'user': user._id,
			'route': route._id,
			'startDateTime': startDateTime,
			'endDateTime': endDateTime
		})
		.set('Authorization', authToken)
		.end(function(err, res) {
			// POST Response
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('object');
			res.body.should.have.property('_id');
			res.body.should.have.property('__v');
			res.body.should.have.property('user');
			res.body.should.have.property('route');
			res.body.should.have.property('startDateTime');
			res.body.should.have.property('endDateTime');

			res.body._id.should.be.a('string');
			res.body.user.should.be.a('string');
			res.body.user.should.equal(user._id.toString());
			res.body.route.should.be.a('string');
			res.body.route.should.equal(route._id.toString());
			new Date(res.body.startDateTime).should.be.a('date');
			new Date(res.body.startDateTime).getTime().should.equal(new Date(startDateTime).getTime());
			new Date(res.body.endDateTime).should.be.a('date');
			new Date(res.body.endDateTime).getTime().should.equal(new Date(endDateTime).getTime());
			done();
		});
});

it('POST Challenge route twice', function(done) {
	chai.request(server)
		.post('/api/challenge/route')
		.send({
			'user': followedUser._id,
			'route': route._id,
			'startDateTime': startDateTime,
			'endDateTime': endDateTime
		})
		.set('Authorization', authToken)
		.end(function(err, res) {
			// POST Response
			res.should.have.status(500);
			res.should.be.json;
			res.body.should.be.a('object');
			res.body.should.have.property('error');
			res.body.error.should.be.a('string');
			res.body.error.should.equal('The User already challenges this route.');
			done();
		});
});

it('DELETE single challenge', function(done) {
	chai.request(server)
		.delete('/api/challenge/' + obj._id)
		.set('Authorization', authToken)
		.end(function(err, res) {
			// DELETE Response
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('object');
			res.body.should.have.property('_id');
			res.body.should.have.property('__v');
			res.body.should.have.property('user');
			res.body.should.have.property('route');
			res.body.should.have.property('startDateTime');
			res.body.should.have.property('endDateTime');

			// Check Response
			chai.request(server)
				.get('/api/challenge/' + res.body._id)
				.set('Authorization', authToken)
				.end(function(err, res) {
					res.should.have.status(200);
					should.equal(res.body, null);
					done();
				});
		});
});

it('GET all challenges by user', function(done) {
	chai.request(server)
		.get('/api/challenge/byUser/' + followedUser._id)
		.set('Authorization', authToken)
		.end(function(err, res) {
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('array');
			res.body.should.have.lengthOf(1);
			done();
		});
});

it('GET all challenges by route', function(done) {
	chai.request(server)
		.get('/api/challenge/byRoute/' + route._id)
		.set('Authorization', authToken)
		.end(function(err, res) {
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('array');
			res.body.should.have.lengthOf(1);
			done();
		});
});
