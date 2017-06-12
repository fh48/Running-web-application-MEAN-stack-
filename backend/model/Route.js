"use strict";

/** @module The Route model */

let mongoose = require('mongoose'),
	ObjectId = mongoose.Schema.Types.ObjectId,
	Schema = mongoose.Schema;

let routeSchema = new Schema({
	'name': { 'type': String, 'required': true },
	'run': { 'type': ObjectId, 'ref': 'Run', 'required': true },
	'user': { 'type': ObjectId, 'ref': 'User', 'required': true },
	'distance': { 'type': Number, 'required': true },
	'elevationData': { 'type': Array, 'required': true },
	'geo': { 'type': {}, 'required': true },
	'creationDate': { 'type': Date, 'default': Date.now },
	'challengers': [{ 'type': ObjectId, 'ref': 'User' }]
});

/**
 * Add a new challenger to the route.
 * @param  {string} userId The id of the new challenger.
 */
routeSchema.methods.challenge = function(userId) {
	if (!userId) {
		throw new Error('Invalid user id.')
	} else if (this.challengers.indexOf(userId) > -1) {
		throw new Error('The User already challenges this route.')
	} else {
		this.challengers.push(mongoose.Types.ObjectId(userId));
	}
}

/**
 * Automatically populates reference fields of the schema.
 * @param  {Function} next Callback.
 */
var autoPopulate = function(next) {
	this.populate('run');
	this.populate('user');
	next();
};

routeSchema
	.pre('findOne', autoPopulate)
	.pre('find', autoPopulate);

module.exports = mongoose.model('Route', routeSchema);
