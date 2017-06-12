"use strict";

process.env.NODE_ENV = 'test';

let common = require('./common'),
	mongoose = common.mongoose;

/**
 * Imports a chai test at a given path.
 * @param  {string} name The name of the test.
 * @param  {string} path The path to the test.
 */
function importTest(name, path) {
	describe(name, function() {
		require(path);
	});
}

describe('Top', function() {
	/**
	 * Synchronously go through all the defined tests.
	 */
	importTest("Run", './run/run');
	importTest("Route", './route/route');
	importTest("User", './user/user');
	importTest("Goals", './goals/goals');
	importTest("Challenge", './challenge/challenge');
});
