"use strict";

let express = require('express'),
	bodyParser = require('body-parser'),
	app = express(),
	config = require('./config'),
	passport = require('passport');

require('./middleware/db').initialise();

// Configure BodyParser.
// Extend max limit to allow upload of large GPX files.
app.use(bodyParser.json({ 'limit': '50mb' }));
app.use(bodyParser.urlencoded({
	'extended': true,
	'limit': '50mb'
}));

// Initialise passport for user authentication.
app.use(passport.initialize());

// Sets the static folder where the frontend app is located.
app.use(express.static(__dirname + '/public'));

// Requires index.js in controller folder with all controllers containing the routes.
app.use('/api', require('./controller'));

// Returns upcoming errors to the client.
app.use(require('./middleware/errorHandler'))

app.set('port', process.env.PORT || config.server.port);

let server = app.listen(app.get('port'), function() {
	console.log('Express server is listening on port ' + server.address().port + ' in ' + app.settings.env + ' mode.');
});

/**
 * Exports the server for testing purposes.
 */
module.exports = server;
