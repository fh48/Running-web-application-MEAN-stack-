"use strict";

/** @module The User model */

let mongoose = require('mongoose'),
	ObjectId = mongoose.Schema.Types.ObjectId,
	Schema = mongoose.Schema;

let userSchema = new Schema({
	'name': { 'type': String, 'required': true },
	'password': { 'type': String, 'required': true },
	'email': { 'type': String, 'required': true },
	'gender': { 'type': String, 'required': true, enum: ['male', 'female'], },
	'height': { 'type': Number, 'required': true },
	'weight': { 'type': Number, 'required': true },
	'registrationDate': { 'type': Date, 'default': Date.now },
	'follows': [{ 'type': ObjectId, 'ref': 'User' }],
	'imageUrl': String
})

/**
 * Add a new followed user to the user.
 * @param  {string} userId The newly followed user's id
 */
userSchema.methods.follow = function(userId) {
	if (!userId) {
		throw new Error('Invalid user id.')
	} else if (this.follows.indexOf(userId) > -1) {
		throw new Error('The User already follows this user.')
	} else if (this._id.equals(userId)) {
		throw new Error('The User cannot follow himself.')
	} else {
		this.follows.push(mongoose.Types.ObjectId(userId));
	}
}

module.exports = mongoose.model('User', userSchema);
