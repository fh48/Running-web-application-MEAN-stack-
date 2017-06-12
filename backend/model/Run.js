"use strict";

/** @module The Run model */

let mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    Schema = mongoose.Schema;

let runSchema = new Schema({
    'user': { 'type': ObjectId, 'ref': 'User', 'required': true },
    'distance': { 'type': Number, 'required': true },
    'elevationData': { 'type': Array, 'required': true },
    'totalClimb': { 'type': Number, 'required': true },
    'timestamps': { 'type': Array, 'required': true },
    'startDateTime': { 'type': Date, 'required': true },
    'endDateTime': { 'type': Date, 'required': true },
    'geo': { 'type': {}, 'required': true },
    'route': { 'type': ObjectId, 'ref': 'Route' },
    'weather': {}
});

/**
 * Automatically populates reference fields of the schema.
 * @param  {Function} next Callback.
 */
var autoPopulate = function(next) {
	this.populate('user');
	next();
};

runSchema
	.pre('findOne', autoPopulate)
	.pre('find', autoPopulate);

module.exports = mongoose.model('Run', runSchema);
