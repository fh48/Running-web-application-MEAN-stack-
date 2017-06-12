"use strict";

let common = require("../common"),
	server = common.server,
	chai = common.chai,
	should = common.should,
	purgeDB = common.purgeDB,
	login = common.login,

	User = require('../../model/User'),

	authToken = null,
	user = null,
	followedUser = null,
	obj = null;

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
	var sampleUser = {
		'name': 'albert',
		'password': 'albert',
		'weight': 80,
		'height': 185,
		'gender': 'male',
		'email': 'albert@albert.com'
	};

	User.insertMany([sampleUser])
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
	obj.remove().then(() => done())
});

it('GET all users', function(done) {
	chai.request(server)
		.get('/api/user')
		.set('Authorization', authToken)
		.end(function(err, res) {
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('array');
			res.body.should.have.lengthOf(3);
			done();
		});
});

it('GET single user', function(done) {
	chai.request(server)
		.get('/api/user/' + obj._id)
		.set('Authorization', authToken)
		.end(function(err, res) {
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('object');
			res.body.should.have.property('_id');
			res.body.should.have.property('__v');
			res.body.should.have.property('name');
			res.body.should.have.property('password');
			res.body.should.have.property('email');
			res.body.should.have.property('weight');
			res.body.should.have.property('height');
			res.body.should.have.property('gender');
			res.body.should.have.property('registrationDate');

			res.body._id.should.be.a('string');
			res.body._id.should.equal(obj._id.toString());
			res.body.name.should.be.a('string');
			res.body.name.should.equal(obj.name);
			res.body.password.should.be.a('string');
			res.body.email.should.be.a('string');
			res.body.email.should.equal(obj.email);
			res.body.weight.should.be.a('number');
			res.body.weight.should.equal(obj.weight);
			res.body.height.should.be.a('number');
			res.body.height.should.equal(obj.height);
			res.body.gender.should.be.a('string');
			res.body.gender.should.equal(obj.gender);
			new Date(res.body.registrationDate).should.be.a('date');
			done();
		});
});

it('POST register user', function(done) {
	var bob = {
		'name': 'bob',
		'password': 'bob',
		'email': 'bob@bob.com',
		'weight': 80,
		'height': 185,
		'gender': 'male'
	};

	chai.request(server)
		.post('/api/register')
		.send(bob)
		.set('Authorization', authToken)
		.end(function(err, res) {
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('object');
			res.body.should.have.property('_id');
			res.body.should.have.property('__v');
			res.body.should.have.property('name');
			res.body.should.have.property('password');
			res.body.should.have.property('email');
			res.body.should.have.property('weight');
			res.body.should.have.property('height');
			res.body.should.have.property('gender');
			res.body.should.have.property('registrationDate');

			res.body._id.should.be.a('string');
			res.body.name.should.be.a('string');
			res.body.name.should.equal(bob.name);
			res.body.password.should.be.a('string');
			res.body.email.should.be.a('string');
			res.body.email.should.equal(bob.email);
			res.body.weight.should.be.a('number');
			res.body.weight.should.equal(bob.weight);
			res.body.height.should.be.a('number');
			res.body.height.should.equal(bob.height);
			res.body.gender.should.be.a('string');
			res.body.gender.should.equal(bob.gender);
			new Date(res.body.registrationDate).should.be.a('date');

			// Delete user again
			User.find({ '_id': res.body._id })
				.remove()
				.exec()
				.then(() => done())
		});
});

it('POST register user with occupied name', function(done) {
	var bob = {
		'name': 'albert',
		'password': 'albert',
		'weight': 80,
		'height': 185,
		'gender': 'male',
		'email': 'albert@albert.com'
	};

	chai.request(server)
		.post('/api/register')
		.send(bob)
		.set('Authorization', authToken)
		.end(function(err, res) {
			res.should.have.status(500);
			res.should.be.json;
			res.body.should.be.a('object');
			res.body.should.have.property('error');
			res.body.error.should.be.a('string');
			res.body.error.should.equal('User name is already taken.');
			done();
		});
});

it('DELETE single user', function(done) {
	chai.request(server)
		.delete('/api/user/' + obj._id)
		.set('Authorization', authToken)
		.end(function(err, res) {
			// DELETE Response
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('object');
			res.body.should.have.property('_id');
			res.body.should.have.property('__v');
			res.body.should.have.property('name');
			res.body.should.have.property('password');
			res.body.should.have.property('email');
			res.body.should.have.property('weight');
			res.body.should.have.property('height');
			res.body.should.have.property('gender');
			res.body.should.have.property('registrationDate');

			// Check Response
			chai.request(server)
				.get('/api/user/' + res.body._id)
				.set('Authorization', authToken)
				.end(function(err, res) {
					res.should.have.status(200);
					should.equal(res.body, null);
					done();
				});
		});
});

it('GET all users followed by a user', function(done) {
	chai.request(server)
		.get('/api/user/' + user._id + '/followed')
		.set('Authorization', authToken)
		.end(function(err, res) {
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('array');
			res.body.should.have.lengthOf(1);
			done();
		});
});

it('GET Follow another user', function(done) {
	chai.request(server)
		.get('/api/user/' + obj._id + '/follow/' + user._id)
		.set('Authorization', authToken)
		.end(function(err, res) {
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('object');
			res.body.should.have.property('_id');
			res.body.should.have.property('__v');
			res.body.should.have.property('name');
			res.body.should.have.property('password');
			res.body.should.have.property('email');
			res.body.should.have.property('weight');
			res.body.should.have.property('height');
			res.body.should.have.property('gender');
			res.body.should.have.property('registrationDate');
			res.body.should.have.property('follows');

			res.body._id.should.be.a('string');
			res.body.name.should.be.a('string');
			res.body.name.should.equal(obj.name);
			res.body.password.should.be.a('string');
			res.body.email.should.be.a('string');
			res.body.email.should.equal(obj.email);
			res.body.weight.should.be.a('number');
			res.body.weight.should.equal(obj.weight);
			res.body.height.should.be.a('number');
			res.body.height.should.equal(obj.height);
			res.body.gender.should.be.a('string');
			res.body.gender.should.equal(obj.gender);
			new Date(res.body.registrationDate).should.be.a('date');
			res.body.follows.should.be.a('array');
			res.body.follows[0].should.equal(user._id.toString());
			done();
		});
});

it('GET Follow same user twice', function(done) {
	chai.request(server)
		.get('/api/user/' + user._id + '/follow/' + followedUser._id)
		.set('Authorization', authToken)
		.end(function(err, res) {
			res.should.have.status(500);
			res.should.be.json;
			res.body.should.be.a('object');
			res.body.should.have.property('error');
			res.body.error.should.be.a('string');
			res.body.error.should.equal('The User already follows this user.');
			done();
		});
});
