"use strict";

/** @module User Controller */

let express = require('express'),
	router = express.Router(),
	uploader = require('../middleware/uploader'),
	multer = require('multer'),
	upload = multer({ dest: 'temp/' });

/**
 * Route: /api/upload/image
 */
router.route('/image')
	/**
	 * Route to upload single image file.
	 */
	.post(upload.single('image'), function(req, res, next) {
		uploader.uploadImageToCloudinary(req.file)
			.then(result => res.json(result))
			.catch(err => next(err));
	});

/**
 * Route: /api/upload/gpx
 */
router.route('/gpx')
	/**
	 * Route to upload single GPX file.
	 */
	.post(upload.single('gpx'), function(req, res, next) {
		uploader.gpxToGeoJson(req.file)
			.then(result => res.json(result))
			.catch(err => next(err));
	});


module.exports = router;
