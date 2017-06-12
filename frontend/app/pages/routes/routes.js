'use strict';

/** @module map **/
angular.module('hfApp.routes', ['ngRoute'])

	.config(function($routeProvider) {
		$routeProvider.when('/routes/:routeId?', {
			templateUrl: 'app/pages/routes/routes.html',
			controller: 'RoutesCtrl'
		});
	})

	.controller('RoutesCtrl', function($scope, ApiService, $rootScope, $q, GeoService, $uibModal, $filter, $routeParams, MetricService) {
		$scope.challenges = null;
		$scope.correspondingRuns = [];
		$scope.selectedRoute = null;

		/**
		 * Load routes of user and users which are followed
			@return {array} containing all routes
		 */
		function loadRoutes() {
			return $q.all([ApiService.getRoutesByFollowed($rootScope.profile.user._id),
					ApiService.getRoutesByUserId($rootScope.profile.user._id)
				])
				.then(function(routes) {
					var followerRoutes = routes[0],
						ownRoutes = routes[1];

					$scope.routes = followerRoutes.concat(ownRoutes);
					return $scope.routes;
				});
		}

		/**
		 * Get the runs which are related to a certain route
		 * @param  {object} route A route object.
		 */
		function loadCorrespondingRuns(route) {
			ApiService.getRunsByUserId($rootScope.profile.user._id)
				.then(function(runs) {
					$scope.correspondingRuns = runs.filter(function(run) {
						return GeoService.isSameRoute(route.geo, run.geo) && route.challengers.indexOf(run.user._id) == -1;
					});
				});
		}

		/**
		 * Assign challenges to scope available for a certain route.
		 * @param  {string} routeId A route ID
		 */
		function loadChallenges(routeId) {
			ApiService.getChallengesByRouteId(routeId)
				.then(function(challenges) {
					$scope.challenges = challenges;
				})
		}

		/**
		 * Assign challenges to scope available for a certain route.
		 * @param  {object} route A route ID
		 */
		function displayRouteDetails(route) {
			if (route) {
				$scope.selectedRoute = route;
				loadChallenges(route._id);
				loadCorrespondingRuns(route);
			}
		};

		/**
		 * Get duration of a route
		 * @param  {string} startDateTime Start date from the GPX file
		 * @param  {string} endDateTime  End date from the GPX file
		 * @return {integer} duration value is returned
		 */
		$scope.getDuration = function(startDateTime, endDateTime) {
			return MetricService.calcDuration({
				'startDateTime': startDateTime,
				'endDateTime': endDateTime
			});
		};

		/**
		 * Get page of a route
		 * @param  {string} startDateTime Start date from the GPX file
		 * @param  {string} endDateTime  End date from the GPX file
		 * @param  {integer} distance  distance of a route
		 * @return {integer} pace value is returned
		 */
		$scope.getPace = function(startDateTime, endDateTime, distance) {
			return MetricService.calcPace({
				'startDateTime': startDateTime,
				'endDateTime': endDateTime,
				'distance': distance
			});
		};

		/**
		 * Assign route object to modal at onclick.
		 */
		$scope.onSelectRoute = function() {
			var routesModalInstance = $uibModal.open({
				'animation': true,
				'ariaLabelledBy': 'modal-title',
				'ariaDescribedBy': 'modal-body',
				'templateUrl': 'app/components/modalRoute/modal-route.html',
				'controller': 'ModalRouteCtrl',
				'resolve': {
					'data': {
						'routes': $scope.routes
					}
				}
			});

			routesModalInstance.result
				.then(function(route) {
					if (route) {
						displayRouteDetails(route);
					}
				})
				.catch(function(err) {
					console.log(err);
				});
		}

		/**
		 * Assign challenge object to modal onclick.
		 */
		$scope.onChallengeRoute = function() {
			var challengeModalInstance = $uibModal.open({
				'animation': true,
				'ariaLabelledBy': 'modal-title',
				'ariaDescribedBy': 'modal-body',
				'templateUrl': 'app/components/modalChallenge/modal-challenge.html',
				'controller': 'ModalChallengeCtrl',
				'resolve': {
					'data': {
						'runs': $scope.correspondingRuns,
						'route': $scope.selectedRoute
					}
				}
			});

			challengeModalInstance.result
				.then(function(challenge) {
					if (challenge) {
						loadRoutes()
							.then(function(routes) {
								return routes.find(function(route) {
									return route._id === challenge.route._id;
								});
							})
							.then(displayRouteDetails)
					}
				})
				.catch(function(err) {
					console.log(err);
				});
		};

		loadRoutes()
			.then(function(routes) {
				var selectedRoute = null;

				// Select the last added route.
				if ($routeParams.routeId) {
					selectedRoute = routes.find(function(route) {
						return route._id === $routeParams.routeId;
					})
				}
				if (!selectedRoute) {
					var orderedRoutes = $filter('orderBy')(routes, '-startDateTime');
					if (orderedRoutes && orderedRoutes.length > 0) {
						selectedRoute = orderedRoutes[0];
					}
				}
				displayRouteDetails(selectedRoute);
			});
	});
