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

	authToken = null,
	user = null,
	followedUser = null,
	run = null,
	obj = null,
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
		};

	Run.insertMany([sampleRun])
		.then(docs => {
			run = docs[0];
			sampleRoute.run = run._id;
			return Route.insertMany([sampleRoute, sampleRoute, sampleRoute]);
		})
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
	Route.collection.drop(function(err) {
		done();
	});
});

it('GET all routes', function(done) {
	chai.request(server)
		.get('/api/route')
		.set('Authorization', authToken)
		.end(function(err, res) {
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('array');
			res.body.should.have.lengthOf(3);
			done();
		});
});

it('GET single route', function(done) {
	chai.request(server)
		.get('/api/route/' + obj._id)
		.set('Authorization', authToken)
		.end(function(err, res) {
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('object');
			res.body.should.have.property('_id');
			res.body.should.have.property('__v');
			res.body.should.have.property('name');
			res.body.should.have.property('run');
			res.body.should.have.property('user');
			res.body.should.have.property('distance');
			res.body.should.have.property('elevationData');
			res.body.should.have.property('geo');

			res.body._id.should.be.a('string');
			res.body._id.should.equal(obj._id.toString());
			res.body.name.should.be.a('string');
			res.body.name.should.equal(obj.name);
			res.body.run.should.be.a('object');
			res.body.run._id.should.equal(run._id.toString());
			res.body.user.should.be.a('object');
			res.body.user._id.should.equal(followedUser._id.toString());
			res.body.distance.should.be.a('number');
			res.body.distance.should.equal(obj.distance);
			res.body.elevationData.should.be.a('array');
			res.body.elevationData.should.deep.include.members(obj.elevationData);
			res.body.geo.should.be.a('object');
			res.body.geo.should.eql(obj.geo)
			done();
		});
});

it('POST single route', function(done) {
	var route = {
		'name': 'test',
		'run': run._id,
		'user': user._id,
		'distance': 1,
		'elevationData': [{ 'test': 'test' }],
		'geo': { 'test': 'test' }
	};

	chai.request(server)
		.post('/api/route')
		.send(route)
		.set('Authorization', authToken)
		.end(function(err, res) {
			// POST Response
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('object');
			res.body.should.have.property('_id');
			res.body.should.have.property('__v');
			res.body.should.have.property('name');
			res.body.should.have.property('run');
			res.body.should.have.property('user');
			res.body.should.have.property('distance');
			res.body.should.have.property('elevationData');
			res.body.should.have.property('geo');

			// Changed property
			res.body._id.should.be.a('string');

			// Object fields
			res.body.name.should.be.a('string');
			res.body.name.should.equal(route.name);
			res.body.user.should.be.a('string');
			res.body.user.should.equal(user._id.toString());
			res.body.run.should.be.a('string');
			res.body.run.should.equal(run._id.toString());
			res.body.distance.should.be.a('number');
			res.body.distance.should.equal(route.distance);
			res.body.elevationData.should.be.a('array');
			res.body.elevationData.should.deep.include.members(route.elevationData);
			res.body.geo.should.be.a('object');
			res.body.geo.should.eql(route.geo);
			done();
		});
});

it('DELETE single route', function(done) {
	chai.request(server)
		.delete('/api/route/' + obj._id)
		.set('Authorization', authToken)
		.end(function(err, res) {
			// DELETE Response
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('object');
			res.body.should.have.property('_id');
			res.body.should.have.property('__v');
			res.body.should.have.property('name');
			res.body.should.have.property('run');
			res.body.should.have.property('user');
			res.body.should.have.property('distance');
			res.body.should.have.property('elevationData');
			res.body.should.have.property('geo');

			// Check Response
			chai.request(server)
				.get('/api/run/' + res.body._id)
				.set('Authorization', authToken)
				.end(function(err, res) {
					res.should.have.status(200);
					should.equal(res.body, null);
					done();
				});
		});
});

it('GET all routes by user', function(done) {
	chai.request(server)
		.get('/api/route/byUser/' + followedUser._id)
		.set('Authorization', authToken)
		.end(function(err, res) {
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('array');
			res.body.should.have.lengthOf(3);
			done();
		});
});

it('GET all routes by followed users', function(done) {
	chai.request(server)
		.get('/api/route/byFollowed/' + user._id)
		.set('Authorization', authToken)
		.end(function(err, res) {
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('array');
			res.body.should.have.lengthOf(3);
			done();
		});
});
