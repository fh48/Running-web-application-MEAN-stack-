"use strict";

let common = require("../common"),
	server = common.server,
	chai = common.chai,
	should = common.should,
	purgeDB = common.purgeDB,
	login = common.login,

	Run = require('../../model/Run'),

	authToken = null,
	user = null,
	obj = null,
	startDateTime = new Date().getTime(),
	endDateTime = new Date().setHours(new Date().getHours() + 1);

before(function(done) {
	login()
		.then(data => {
			user = data.user;
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
	}

	Run.insertMany([sampleRun, sampleRun, sampleRun])
		.then(function(docs) {
			obj = docs[0];
			done();
		})
		.catch(function(err) {
			console.log(err);
		});
});

afterEach(function(done) {
	Run.collection.drop(function(err) {
		done();
	});
});

it('GET all runs', function(done) {
	chai.request(server)
		.get('/api/run')
		.set('Authorization', authToken)
		.end(function(err, res) {
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('array');
			res.body.should.have.lengthOf(3);
			done();
		});
});

it('GET single run', function(done) {
	chai.request(server)
		.get('/api/run/' + obj._id)
		.set('Authorization', authToken)
		.end(function(err, res) {
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('object');
			res.body.should.have.property('_id');
			res.body.should.have.property('__v');
			res.body.should.have.property('user');
			res.body.should.have.property('distance');
			res.body.should.have.property('totalClimb');
			res.body.should.have.property('elevationData');
			res.body.should.have.property('timestamps');
			res.body.should.have.property('startDateTime');
			res.body.should.have.property('endDateTime');
			res.body.should.have.property('geo');

			res.body._id.should.be.a('string');
			res.body._id.should.equal(obj._id.toString());
			res.body.user.should.be.a('object');
			res.body.user._id.should.equal(user._id.toString());
			res.body.distance.should.be.a('number');
			res.body.distance.should.equal(obj.distance);
			res.body.totalClimb.should.be.a('number');
			res.body.totalClimb.should.equal(obj.totalClimb);
			res.body.elevationData.should.be.a('array');
			res.body.elevationData.should.deep.include.members(obj.elevationData);
			res.body.timestamps.should.be.a('array');
			res.body.timestamps.should.deep.include.members(obj.timestamps)
			new Date(res.body.startDateTime).should.be.a('date');
			new Date(res.body.startDateTime).getTime().should.equal(new Date(obj.startDateTime).getTime());
			new Date(res.body.endDateTime).should.be.a('date');
			new Date(res.body.endDateTime).getTime().should.equal(new Date(obj.endDateTime).getTime());
			res.body.geo.should.be.a('object');
			res.body.geo.should.eql(obj.geo)
			done();
		});
});

it('POST single run', function(done) {
	var sampleRun = {
		'user': user._id,
		'distance': 1,
		'totalClimb': 1,
		'elevationData': [{ 'test': 'test' }],
		'timestamps': [{ 'test': 'test' }],
		'geo': { 'test': 'test' },
		'startDateTime': startDateTime,
		'endDateTime': endDateTime
	};

	chai.request(server)
		.post('/api/run')
		.send(sampleRun)
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
			res.body.should.have.property('totalClimb');
			res.body.should.have.property('elevationData');
			res.body.should.have.property('timestamps');
			res.body.should.have.property('startDateTime');
			res.body.should.have.property('endDateTime');
			res.body.should.have.property('geo');

			res.body._id.should.be.a('string');
			res.body.user.should.be.a('string');
			res.body.user.should.equal(user._id.toString());
			res.body.distance.should.be.a('number');
			res.body.distance.should.equal(sampleRun.distance);
			res.body.totalClimb.should.be.a('number');
			res.body.totalClimb.should.equal(sampleRun.totalClimb);
			res.body.elevationData.should.be.a('array');
			res.body.elevationData.should.eql(sampleRun.elevationData);
			res.body.timestamps.should.be.a('array');
			res.body.timestamps.should.eql(sampleRun.timestamps)
			new Date(res.body.startDateTime).should.be.a('date');
			new Date(res.body.startDateTime).getTime().should.equal(new Date(sampleRun.startDateTime).getTime());
			new Date(res.body.endDateTime).should.be.a('date');
			new Date(res.body.endDateTime).getTime().should.equal(new Date(sampleRun.endDateTime).getTime());
			res.body.geo.should.be.a('object');
			res.body.geo.should.eql(sampleRun.geo)
			done();
		});
});

it('PUT single run', function(done) {

	obj.distance = 3

	chai.request(server)
		.put('/api/run')
		.send(obj)
		.set('Authorization', authToken)
		.end(function(err, res) {
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('object');
			res.body.should.have.property('_id');
			res.body.should.have.property('__v');
			res.body.should.have.property('user');
			res.body.should.have.property('distance');
			res.body.should.have.property('totalClimb');
			res.body.should.have.property('elevationData');
			res.body.should.have.property('timestamps');
			res.body.should.have.property('startDateTime');
			res.body.should.have.property('endDateTime');
			res.body.should.have.property('geo');

			// Changed property
			res.body.distance.should.be.a('number');
			res.body.distance.should.equal(3);

			// Object fields
			res.body._id.should.be.a('string');
			res.body._id.should.equal(obj._id.toString());
			res.body.user.should.be.a('string');
			res.body.user.should.equal(user._id.toString());
			res.body.totalClimb.should.be.a('number');
			res.body.totalClimb.should.equal(obj.totalClimb);
			res.body.elevationData.should.be.a('array');
			res.body.elevationData.should.deep.include.members(obj.elevationData);
			res.body.timestamps.should.be.a('array');
			res.body.timestamps.should.deep.include.members(obj.timestamps);
			new Date(res.body.startDateTime).should.be.a('date');
			new Date(res.body.startDateTime).getTime().should.equal(new Date(obj.startDateTime).getTime());
			new Date(res.body.endDateTime).should.be.a('date');
			new Date(res.body.endDateTime).getTime().should.equal(new Date(obj.endDateTime).getTime());
			res.body.geo.should.be.a('object');
			res.body.geo.should.eql(obj.geo)
			done();
		});
});

it('DELETE single run', function(done) {
	chai.request(server)
		.delete('/api/run/' + obj._id)
		.set('Authorization', authToken)
		.end(function(err, res) {
			// DELETE Response
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('object');
			res.body.should.have.property('_id');
			res.body.should.have.property('__v');
			res.body.should.have.property('user');
			res.body.should.have.property('distance');
			res.body.should.have.property('totalClimb');
			res.body.should.have.property('elevationData');
			res.body.should.have.property('timestamps');
			res.body.should.have.property('startDateTime');
			res.body.should.have.property('endDateTime');
			res.body.should.have.property('geo');

			// Check Response
			chai.request(server)
				.get('/api/run/' + res.body._id)
				.set('Authorization', authToken)
				.end(function(err, res) {
					res.should.have.status(200);
					should.equal(res.body, null);
					done();
				})
		});
});

it('GET all runs by user', function(done) {
	chai.request(server)
		.get('/api/run/byUser/' + user._id)
		.set('Authorization', authToken)
		.end(function(err, res) {
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('array');
			res.body.should.have.lengthOf(3);
			done();
		});
});

it('GET all runs by date range', function(done) {
	chai.request(server)
		.get('/api/run/byDateRange/' + (new Date(startDateTime).getTime() - 1) + '/' + (new Date(endDateTime).getTime() + 1) + '?userId=' + user._id)
		.set('Authorization', authToken)
		.end(function(err, res) {
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('array');
			res.body.should.have.lengthOf(3);
			done();
		});
});
