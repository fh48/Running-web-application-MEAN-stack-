'use strict'

angular.module('hfApp.auth', [])
	.service('AuthService', function($http, $rootScope, $q, $localStorage) {

		const LOGIN_PATH = '/api/login/',
			REGISTER_PATH = '/api/register/';

		function unpackData(res) {
			var deferred = $q.defer();

			deferred.resolve(res.data);
			return deferred.promise;
		}

		/**
		 * Logs in a user.
		 * @param  {String} name     The user name.
		 * @param  {String} password The user password.
		 * @return {Promise}
		 */
		this.login = function(name, password) {
			var deferred = $q.defer();

			$http.post(LOGIN_PATH, {
					'name': name,
					'password': password
				})
				.then(unpackData)
				.then(function success(profile) {
					if (profile && profile.token && profile.user) {
						// Store user and token in the local storage to keep the user logged in between page refreshes.
						$localStorage.profile = profile;
						$rootScope.profile = profile;

						// Add JWT token to the auth header for all requests made by the $http service.
						$http.defaults.headers.common.Authorization = 'JWT ' + profile.token;
						deferred.resolve();
					} else {
						deferred.reject(profile);
					}

				})
				.catch(function error(err) {
					deferred.reject(err);
				});

			return deferred.promise;
		};

		/**
		 * Registers a new user.
		 * @param  {Object} userData The new user object
		 * @return {Promise}
		 */
		this.register = function(userData) {
			return $http.post(REGISTER_PATH, userData)
				.then(unpackData);
		};

		/**
		 * Logs out the current user.
		 */
		this.logout = function() {
			// remove user from local storage and clear http auth header
			delete $localStorage.profile;
			delete $rootScope.profile;
			$http.defaults.headers.common.Authorization = '';
		}

	})
