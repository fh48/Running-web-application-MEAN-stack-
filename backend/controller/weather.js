"use strict";

/** @module Weather Controller */

let express = require('express'),
    router = express.Router(),
    darkSky = require('../middleware/darkSky');

/**
 * Route: /api/weather/forecast
 */
router.route('/forecast')
    /**
     * Route to get weather forecast for a location.
     */
    .get(function(req, res, next) {
        darkSky.getWeatherForecast(req.query.lat, req.query.long)
            .then(data => res.json(data))
            .catch(err => next(err));
    });

/**
 * Route: /api/weather/current
 */
router.route('/current')
    /**
     * Route to get current weather for a location.
     */
    .get(function(req, res, next) {
        darkSky.getCurrentWeather(req.query.lat, req.query.long)
            .then(data => res.json(data))
            .catch(err => next(err));
    });

/**
 * Route: /api/weather/byDateTime/:timestamp
 */
router.route('/byDateTime/:dateTime')
    /**
     * Route to get weather for a location at a specific time.
     */
    .get(function(req, res, next) {
        darkSky.getWeatherByDate(req.query.lat, req.query.long, req.params.dateTime)
            .then(data => res.json(data))
            .catch(err => next(err));
    });

module.exports = router;
