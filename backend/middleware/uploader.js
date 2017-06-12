'use strict';

let Promise = require('es6-promise').Promise,
	cloudinary = require('cloudinary'),
	config = require('../config'),
	geoJsonConverter = require('togeojson'),
	fs = require('fs'),
	DOMParser = require('xmldom').DOMParser;

cloudinary.config({
	cloud_name: config.cloudinary.cloudName,
	api_key: config.cloudinary.apiKey,
	api_secret: config.cloudinary.secret
});

/**
 * The Uploader class provides allows uploading images to the cloudinary
 * cloud platform and convert GPX file to geoJson.
 * @class
 */
class Uploader {

    /**
	 * Uploads an image file to the cloudinary cloud platform.
	 * @param  {object} file The file to upload.
	 * @return {Promise}
	 */
	uploadImageToCloudinary(file) {
		let promise = new Promise(function(resolve, reject) {
			cloudinary.uploader.upload(file.path)
				.then(image => {
                    // Deletes temporarily stored image file from the server.
					fs.unlink(file.path);
					resolve(image);
				})
				.catch(err => reject(err));
		});
		return promise;
	}

    /**
     * Converts a GPX file to a geoJson.
     * @param  {object} file The GPX file to convert.
     * @return {Promise}
     */
	gpxToGeoJson(file) {
		let promise = new Promise(function(resolve, reject) {
			try {
				let gpx = new DOMParser().parseFromString(fs.readFileSync(file.path, 'utf8'), 'text/xml');
				resolve(geoJsonConverter.gpx(gpx));
			} catch (err) {
				reject(err);
			} finally {
                // Deletes temporarily stored GPX file from the server.
				fs.unlink(file.path);
			}
		});
		return promise;
	}
}

module.exports = new Uploader();
