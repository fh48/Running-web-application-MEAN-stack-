"use strict";

/** @module The Challenge model */

let mongoose = require('mongoose'),
	ObjectId = mongoose.Schema.Types.ObjectId,
	Schema = mongoose.Schema;

let challengeSchema = new Schema({
	'user': { 'type': ObjectId, 'ref': 'User', 'required': true },
	'route': { 'type': ObjectId, 'ref': 'Route', 'required': true },
	'startDateTime': { 'type': Date, 'required': true },
	'endDateTime': { 'type': Date, 'required': true }
});

/**
 * Automatically populates reference fields of the schema.
 * @param  {Function} next Callback.
 */
var autoPopulate = function(next) {
	this.populate('user');
	this.populate('route');
	next();
};

challengeSchema
	.pre('findOne', autoPopulate)
	.pre('find', autoPopulate);

module.exports = mongoose.model('Challenge', challengeSchema);
