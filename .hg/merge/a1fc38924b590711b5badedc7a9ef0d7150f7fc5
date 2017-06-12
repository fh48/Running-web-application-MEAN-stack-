'use strict'

angular.module('hfApp.geometry', [])
    .service('GeoService', function() {

        var that = this;

        /**
         * Turn degrees into radians
         * @returns {number} radians
         */
        Number.prototype.toRad = function() {
            return this * Math.PI / 180;
        };

        /**
         * Calculate distance based on latitude and longitude coordinates
         * from the geoJson
         * @param point1
         * @param point2
         * @returns {number}
         */
        this.distance = function(point1, point2) {
            // note lat, lon order in geoJSON is reverse of usual
            var lat1 = point1[1];
            var lon1 = point1[0];
            var lat2 = point2[1];
            var lon2 = point2[0];

            var R = 6371; // km
            var x1 = lat2 - lat1;
            var dLat = x1.toRad();
            var x2 = lon2 - lon1;
            var dLon = x2.toRad();
            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        };

        /**
         * Gets the starting point of a run
         * @param geoJson a run
         * @returns {*} the starting point
         */
        this.extractStartingPoint = function(geoJson) {
            if (geoJson.type === 'FeatureCollection') {
                return geoJson.features[0].geometry.coordinates[0];
            } else {
                return geoJson.geometry.coordinates[0];
            }
        };

        /**
         * Extracts timestamps from the geoJson
         * @param geoJson
         * @returns an array of timestamps
         */
        this.extractTimestamps = function(geoJson) {
            if (geoJson.type === 'FeatureCollection') {
                return geoJson.features[0].properties.coordTimes.map(Date.parse);
            } else {
                return geoJson.properties.coordTimes.map(Date.parse);
            }
        };

        // calculate length of run from array of coordinates
        // (also create pace and elevation profiles if data exists)
        /**
         * Calculate length of run from array of coordinates and creates
         * pace and elevation profiles if data exists
         * @param geoJson gpx data in json format
         * @returns {{distance: number, elevationData: Array, totalClimb: number, timestamps: Array, startDateTime: number, endDateTime: number}} object containing various information
         *
         */
        this.getRunData = function(geoJson) {
            var runLength = 0;
            var elevationData = [];
            var totalClimb = 0;
            var timestamps = this.extractTimestamps(geoJson);
            var timeData = [];
            if (geoJson.type == "FeatureCollection") {
                geoJson.features.forEach(function(feature) {
                    if (feature.geometry.type == "LineString" || feature.geometry.type == "MultiLineString") {
                        addFeatureLength(feature);
                    }
                });
            } else if (geoJson.type == "Feature") {
                addFeatureLength(geoJson);
            } else {
                console.log("Could not extract route length");
                return;
            }
            return {
                "distance": runLength,
                "elevationData": elevationData,
                "totalClimb": totalClimb,
                "timestamps": timeData,
                "startDateTime": timeData[0].y * 1000,
                "endDateTime": timeData[timeData.length - 1].y * 1000
            };

            function addFeatureLength(feature) {
                processPoints(feature.geometry.coordinates);
            }

            function processPoints(coordinates) {
                if (!isNaN(coordinates[0][0])) {
                    for (var i = 0; i < coordinates.length - 1; i++) {
                        if (coordinates[i].length > 2) {
                            elevationData.push({
                                x: runLength,
                                y: coordinates[i][2]
                            });
                            totalClimb += Math.max(coordinates[i + 1][2] - coordinates[i][2], 0);
                        }
                        timeData.push({
                            x: runLength,
                            y: timestamps[0] / 1000
                        });
                        timestamps.shift();
                        runLength += that.distance(coordinates[i], coordinates[i + 1]);
                    }
                    if (coordinates[coordinates.length - 1].length > 2) {
                        elevationData.push({
                            x: runLength,
                            y: coordinates[coordinates.length - 1][2]
                        });
                    }
                    timeData.push({
                        x: runLength,
                        y: timestamps[0] / 1000
                    });
                } else {
                    coordinates.forEach(processPoints);
                }
            }
        };

        /**
         * [Custom Algorithm]Compares two routes based on two geoJson objects by extracting, validating and
         * checking that the new route passes through each checkpoint of the original route.
         * This allows us to decide the rout a user ran is compatible with any others and allows
         * us to create challenges.
         * @param newGeoJson the newly uploaded run
         * @param existingGeoJson an existing run
         * @returns {boolean} true if the routes match
         */
        this.isSameRoute = function(newGeoJson, existingGeoJson) {
            // extract coordinates of existingGeoJson
            if (existingGeoJson.type == "FeatureCollection") {
                if (existingGeoJson.features.length != 1) {
                    console.log("Multiple features in newGeoJson");
                    return;
                } else {
                    var existingCoordinates = existingGeoJson.features[0].geometry.coordinates;
                }
            } else if (existingGeoJson.type == "Feature") {
                var existingCoordinates = existingGeoJson.geometry.coordinates;
            } else {
                console.log("Could not extract route coordinates");
                return;
            }

            // extract coordinates of newGeoJson
            if (newGeoJson.type == "FeatureCollection") {
                if (newGeoJson.features.length != 1) {
                    console.log("Multiple features in newGeoJson");
                    return;
                } else {
                    var newCoordinates = newGeoJson.features[0].geometry.coordinates;
                }
            } else if (newGeoJson.type == "Feature") {
                var newCoordinates = newGeoJson.geometry.coordinates;
            } else {
                console.log("Could not extract route coordinates");
                return;
            }

            // validate existing coordinates
            if (isNaN(existingCoordinates[0][0])) {
                console.log("Invalid existingCoordinates");
                return;
            }

            // validate new coordinates
            if (isNaN(newCoordinates[0][0])) {
                console.log("Invalid newCoordinates");
                return;
            }

            // now check new run passes through each point ('checkpoint') of the existing route
            // initialise counter:
            var existingPointReached = 0;
            // increment when next checkpoint is passed
            // if value at end == number of checkpoints, routes match

            for (var i = 0; i < newCoordinates.length - 1; i++) {
                var D = 0.02 // allowable route deviation in km
                var dNew = that.distance(newCoordinates[i], newCoordinates[i + 1]);
                var checkpointToNew1 = that.distance(existingCoordinates[existingPointReached], newCoordinates[i]);
                var checkpointToNew2 = that.distance(existingCoordinates[existingPointReached], newCoordinates[i + 1]);
                var checkpointSum = checkpointToNew1 + checkpointToNew2;
                if (checkpointSum < dNew + 2 * D) {
                    // next checkpoint lies inside ellipse with newCoordinate foci
                    existingPointReached++;
                    // check if all checkpoints were passed
                    if (existingPointReached == existingCoordinates.length) {
                        return true;
                    }
                    // else restart checking from same point
                    i--;
                }
            }
            return false;
        };
    })
