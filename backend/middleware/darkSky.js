"use strict";

/** @module DarkSky Middleware */

let Promise = require('es6-promise').Promise,
	request = require('request'),
	config = require('../config');

require('any-promise/register/es6-promise');
let rp = require('request-promise-any');

/**
 * The DarkSky class provides a functionality to fetch weather data from the DarkSky API.
 * @class
 */
class DarkSky {

	/**
	 * Generic method to get weather data by requesting the DarkSky API.
	 * @param  {array} opt The request options used for the request url.
	 * @param  {object} qs The additional query parameter used in the request's url parameters.
	 * @return {Promise}
	 */
	getWeatherData(opt, qs) {
		let options = {
			method: 'GET',
			uri: config.darkSky.url + config.darkSky.apiKey + '/' + opt.join(','),
			json: true,
			qs: qs
		};
		return rp(options)
			.then(data => data)
			.catch(err => err);
	}

	/**
	 * Gets the current weather data for a specific location by requesting the DarkSky API.
	 * @param  {number} lat The lat coordinate of the location.
	 * @param  {number} long The long coordinate of the location.
	 * @return {Promise}
	 */
	getCurrentWeather(lat, long) {
		return this.getWeatherData([lat, long], { 'exclude': 'minutely,hourly,daily,flags', 'units': 'si' });
	}

	/**
	 * Gets the weather forecast data for a specific location by requesting the DarkSky API.
	 * @param  {number} lat The lat coordinate of the location.
	 * @param  {number} long The long coordinate of the location.
	 * @return {Promise}
	 */
	getWeatherForecast(lat, long) {
		return this.getWeatherData([lat, long], { 'exclude': 'currently,minutely,hourly,flags', 'units': 'si' });
	}

	/**
	 * Gets the weather data for a specific time and location by requesting the DarkSky API.
	 * @param  {number} lat The lat coordinate of the location.
	 * @param  {number} long The long coordinate of the location.
	 * @param  {number} timestamp The time.
	 * @return {Promise}
	 */
	getWeatherByDate(lat, long, timestamp) {
		return this.getWeatherData([lat, long, timestamp], { 'exclude': 'minutely,hourly,daily,flags', 'units': 'si' });
	}

}

module.exports = new DarkSky();
