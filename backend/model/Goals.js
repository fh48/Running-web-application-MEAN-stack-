"use strict";

/** @module The Goals model */

let mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    Schema = mongoose.Schema;

let goalsSchema = new Schema({
    'user': {'type': ObjectId, 'ref': 'User', 'required': true},
    'distance': {'type': Number, 'required': true},
    'speed': {'type': Number, 'required': true},
    'steps': {'type': Number, 'required': true},
    'startDateTime': {'type': Date, 'required': true},
    'endDateTime': {'type': Date, 'required': true}
});

/**
 * Automatically populates reference fields of the schema.
 * @param  {Function} next Callback.
 */
var autoPopulate = function (next) {
    this.populate('user');
    next();
};

goalsSchema
    .pre('findOne', autoPopulate)
    .pre('find', autoPopulate);

module.exports = mongoose.model('Goals', goalsSchema);
