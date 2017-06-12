'use strict';

angular.module('hfApp.api', [])

.service('ApiService', function($http, $rootScope, $q, Upload) {

    const USER_PATH = '/api/user/',
        RUN_PATH = '/api/run/',
        CHALLENGE_PATH = '/api/challenge/',
        ROUTE_PATH = '/api/route/',
        WEATHER_PATH = '/api/weather/',
        UPLOAD_PATH = '/api/upload/',
        GOALS_PATH = '/api/goals/';


    function unpackData(res) {
        var deferred = $q.defer();

        if (res.data && res.data.error) {
            deferred.reject(res);
        } else {
            deferred.resolve(res.data);
        }
        return deferred.promise;
    }


    /**
     * -------------------------------------------
     * ------------------ User -------------------
     * -------------------------------------------
     */

    /**
     * Get all the users from the database
     */
    this.getAllUsers = function() {
        return $http.get(USER_PATH)
            .then(unpackData);
    };

    /**
     * Get a particular user by id
     * @param id
     */
    this.getUserById = function(id) {
        return $http.get(USER_PATH + id)
            .then(unpackData);
    };

    /**
     * Get the followed users of a user by specifying that users id
     * @param userId
     */
    this.getFollowedUsers = function(userId) {
        return $http.get(USER_PATH + userId + "/followed")
            .then(unpackData);
    };

    /**
     * Delete a user by specifying its id
     * @param userId
     */
    this.deleteUserById = function(userId) {
        return $http.delete(USER_PATH + userId)
            .then(unpackData);
    };

    /**
     * Update a user in the database based on a user object
     * @param userData user object
     */
    this.updateUser = function(userData) {
        return $http.put(USER_PATH, userData)
            .then(unpackData);
    };

    /**
     * Follow a user given the user id and the followers id
     * @param followerId
     * @param userId
     */
    this.followUser = function(followerId, userId) {
        return $http.get(USER_PATH + followerId + "/follow/" + userId)
            .then(unpackData);
    };


    /**
     * -------------------------------------------
     * ------------------ Run --------------------
     * -------------------------------------------
     */

    /**
     * Get all the runs in the database
     */
    this.getAllRuns = function() {
        return $http.get(RUN_PATH)
            .then(unpackData);
    };

    /**
     * Get a single run by the run id
     * @param id run id
     */
    this.getRunById = function(id) {
        return $http.get(RUN_PATH + id)
            .then(unpackData);;
    };

    /**
     * Get all the runs of a particular user by user id
     * @param userId
     */
    this.getRunsByUserId = function(userId) {
        return $http.get(RUN_PATH + "byUser/" + userId)
            .then(unpackData);
    };

    /**
     * Get all the runs by route id
     * @param routeId
     */
    this.getRunsByRouteId = function(routeId) {
        return $http.get(RUN_PATH + "byRoute/" + routeId)
            .then(unpackData);
    };

    /**
     * Get multiple runs of a user based on a user id and a
     * date range in which the runs have occurred
     * @param userId
     * @param startDateTime of data range
     * @param endDateTime of date range
     */
    this.getRunsByDateRange = function(userId, startDateTime, endDateTime) {
        return $http.get(RUN_PATH + "byDateRange/" + startDateTime + '/' + endDateTime, {
                'params': {
                    'userId': userId
                }
            })
            .then(unpackData);
    };

    /**
     * Create a run in the database given a run object
     * @param runData
     */
    this.createRun = function(runData) {
        return $http.post(RUN_PATH, runData)
            .then(unpackData);
    };

    /**
     * Ubdate a run in the database given a run object
     * @param runData
     */
    this.updateRun = function(runData) {
        return $http.put(RUN_PATH, runData)
            .then(unpackData);
    };

    /**
     * Delete a particular run by specifying the run id
     * @param id run id
     */
    this.deleteRunById = function(id) {
        return $http.delete(RUN_PATH + id)
            .then(unpackData);
    };


    /**
     * -------------------------------------------
     * ----------------- Route -------------------
     * -------------------------------------------
     */

    /**
     * Get all the routes in the database
     */
    this.getAllRoutes = function() {
        return $http.get(ROUTE_PATH)
            .then(unpackData);
    };

    /**
     * Get a particular route by specifying its id
     * @param id
     */
    this.getRouteById = function(id) {
        return $http.get(ROUTE_PATH + id)
            .then(unpackData);;
    };

    /**
     * Get all the routes of a given user by the user id
     * @param userId
     */
    this.getRoutesByUserId = function(userId) {
        return $http.get(ROUTE_PATH + "byUser/" + userId)
            .then(unpackData);
    };

    /**
     * Get all the routes of the people that a user follows
     * @param userId
     */
    this.getRoutesByFollowed = function(userId) {
        return $http.get(ROUTE_PATH + "byFollowed/" + userId)
            .then(unpackData);
    };

    /**
     * Persist a route in the database based on a route object
     * @param routeData
     */
    this.createRoute = function(routeData) {
        return $http.post(ROUTE_PATH, routeData)
            .then(unpackData);
    };


    /**
     * Delete a route by specifying its id
     * @param id
     */
    this.deleteRouteById = function(id) {
        return $http.delete(ROUTE_PATH + id)
            .then(unpackData);
    };


    /**
     * -------------------------------------------
     * --------------- Challenge -----------------
     * -------------------------------------------
     */

    /**
     * Get all challenges in the database
     */
    this.getAllChallenges = function() {
        return $http.get(CHALLENGE_PATH)
            .then(unpackData);
    };

    /**
     * Get one challange by the challenge id
     * @param id
     */
    this.getChallengeById = function(id) {
        return $http.get(CHALLENGE_PATH + id)
            .then(unpackData);;
    };

    /**
     * Get all challenges of a particular user by the user id
     * @param userId
     */
    this.getChallengesByUserId = function(userId) {
        return $http.get(CHALLENGE_PATH + "byUser/" + userId)
            .then(unpackData);
    };

    /**
     * Get all the challenges that contain a particular route id
     * @param routeId
     */
    this.getChallengesByRouteId = function(routeId) {
        return $http.get(CHALLENGE_PATH + "byRoute/" + routeId)
            .then(unpackData);
    };

    /**
     * User challenges a route and we pass in a challenge object
     * @param challengeData
     */
    this.challengeRoute = function(challengeData) {
        return $http.post(CHALLENGE_PATH + 'route', challengeData)
            .then(unpackData);
    };

    /**
     * Delete a particular challenge by the challange id
     * @param id
     */
    this.deleteChallengeById = function(id) {
        return $http.delete(CHALLENGE_PATH + id)
            .then(unpackData);
    };

    /**
     * -------------------------------------------
     * ---------------- Goals ------------------
     * -------------------------------------------
     */

    /**
     * Update goals using goalData
     * @param goalData
     */
    this.updateGoals = function(goalData) {
        return $http.put(GOALS_PATH, goalData)
            .then(unpackData);
    };

    /**
     * Create goal object in the database
     * @param goalData
     */
    this.createGoals = function(goalData) {
        return $http.post(GOALS_PATH, goalData)
            .then(unpackData);
    };

    /**
     * Get a single goal by goals id
     * @param id
     */
    this.getGoalsById = function(id) {
        return $http.get(GOALS_PATH + id)
            .then(unpackData);
    };

    /**
     * Delete goals by goals id
     * @param id
     */
    this.deleteGoalsById = function(id) {
        return $http.delete(GOALS_PATH + id)
            .then(unpackData);
    };

    /**
     * Get multiple goals by user id
     * @param userId
     */
    this.getGoalsByUserId = function(userId){
        return $http.get(GOALS_PATH + "byUser/" + userId)
            .then(unpackData);
    };

    /**
     * Get the current goals of the user
     * @param userId
     */
    this.getCurrentGoalsByUserId = function(userId){
        return $http.get(GOALS_PATH + "byUser/" + userId + '/current')
            .then(unpackData);
    };


    /**
     * -------------------------------------------
     * ---------------- Weather ------------------
     * -------------------------------------------
     */

    /**
     * Gets the current weather data for a specific location by requesting the DarkSky API.
     * @param  {number} lat The lat coordinate of the location.
     * @param  {number} long The long coordinate of the location.
     */
    this.getCurrentWeatherByLocation = function(lat, long) {
        return $http.get(WEATHER_PATH + 'current/', {
                'params': {
                    'lat': lat,
                    'long': long
                }
            })
            .then(unpackData);
    };

    /**
     * Gets the weather forecast data for a specific location by requesting the DarkSky API.
     * @param  {number} lat The lat coordinate of the location.
     * @param  {number} long The long coordinate of the location.
     */
    this.getWeatherForecastByLocation = function(lat, long) {
        return $http.get(WEATHER_PATH + 'forecast/', {
                'params': {
                    'lat': lat,
                    'long': long
                }
            })
            .then(unpackData);
    };


    /**
     * Gets the weather data for a specific time and location by requesting the DarkSky API.
     * @param  {number} lat The lat coordinate of the location.
     * @param  {number} long The long coordinate of the location.
     * @param  {number} timestamp The time.
     * @param dateTime
     */
    this.getWeatherByDateTime = function(lat, long, dateTime) {
        return $http.get(WEATHER_PATH + 'byDateTime/' + Math.round(dateTime / 1000), {
                'params': {
                    'lat': lat,
                    'long': long
                }
            })
            .then(unpackData);
    };


    /**
     * -------------------------------------------
     * ------------- Miscellaneous ---------------
     * -------------------------------------------
     */

    /**
     * Upload image file.
     * @param  {Object} fileData The image file.
     * @return {Promise}
     */
    this.uploadImage = function(fileData, onProgress) {
        return Upload.upload({
            url: UPLOAD_PATH + 'image',
            data: { 'image': fileData }
        }).then(unpackData, unpackData, onProgress);
    };

    /**
     * Convert gpx file into geoJson.
     * @param  {Object} fileData The gpx file.
     * @param  {Function} onProgress Callback  gets executed on upload progress.
     * @return {Promise}
     */
    this.convertGpx = function(fileData, onProgress) {
        return Upload.upload({
            url: UPLOAD_PATH + 'gpx',
            data: { 'gpx': fileData }
        }).then(unpackData, unpackData, onProgress);
    }

    // this.convertGpx = function(fileData) {
    //     console.log(fileData);
    //     return $http.post(UPLOAD_PATH + 'gpx', fileData, {
    //         transformRequest: angular.identity,
    //         headers: { 'Content-Type': undefined }
    //     }).then(unpackData);
    // };

})
