'use strict';

/** @module landing **/
angular.module('hfApp.landing', ['ngRoute', 'chart.js', 'rzModule'])

	.config(function($routeProvider) {
		$routeProvider.when('/', {
			templateUrl: 'app/pages/landing/landing.html',
			controller: 'LandingCtrl'
		});
	})

	.controller('LandingCtrl', function($scope, $rootScope, $location, ApiService, AchieveService, Notification, GeoService, MetricService) {

		function load() {
			getUserGoals();
			getCurrentWeather();
			getFollowedUsers();
			getUsers();
		}
		load();

		/**
		 * Get boundaries of achievments by userId from the database.
		 * @param  {string} userId The user's userId.
		 */
		function calculateTotalStats() {
			ApiService.getRunsByUserId($rootScope.profile.user._id)
				.then(function(runs) {
					$scope.runs = runs;

					$scope.totalDistance = Math.floor(runs.reduce(function(acc, run) {
						return acc + run.distance;
					}, 0));
					$scope.totalSteps = Math.floor(runs.reduce(function(acc, run) {
						return acc + run.totalClimb;
					}, 0) * 5);

					var distanceBounds = AchieveService.getAchievementBounds($scope.totalDistance);
					var stepsBounds = AchieveService.getAchievementBounds($scope.totalSteps);

					$scope.reachedDistance = distanceBounds.reached;
					$scope.toNextDistance = distanceBounds.toNext;
					$scope.reachedSteps = stepsBounds.reached;
					$scope.toNextSteps = stepsBounds.toNext;
				});
		}


		/**
		 * Calculate the summed stats for all runs in the weekly goal period
		 * @param  {string} user.id The user id.
		 * @param  {string} startDate start date of weekly goal period
		 * @param  {string} endeDate end date of weekly goal period
		 */

		function calculateWeeklyStats() {

			ApiService.getRunsByDateRange($rootScope.profile.user._id, $scope.weeklyGoals.startDateTime, $scope.weeklyGoals.endDateTime)
				.then(function(runs) {
					var weeklyGoalsStartDay = new Date($scope.weeklyGoals.startDateTime).getDay();
					var paceData = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
					var times = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
					var stepsClimbed = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
					var kcalsBurned = 0;
					$scope.weekDistance = Math.floor(runs.reduce(function(acc, run) {
						return acc + run.distance;
					}, 0));

					/* Pace bar chart labels*/
					$scope.pacelabels = rotate(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], weeklyGoalsStartDay);
					/* Steps bar chart labels*/
					$scope.stepslabels = $scope.pacelabels;

					runs.map(function(run) {
						// index of adjusted day of run (e.g. weeklyGoals set on Thursday means Friday = 1, Saturday = 2, etc.)
						var dayOfRun = (new Date(run.startDateTime).getDay() + 7 - weeklyGoalsStartDay) % 7;
						paceData[dayOfRun] += ((new Date(run.endDateTime).getTime() - new Date(run.startDateTime).getTime()) / 60000) / run.distance;
						times[dayOfRun]++;
						stepsClimbed[dayOfRun] += run.totalClimb * 5;
						kcalsBurned += MetricService.calcKCalBurned(run);
					});

					$scope.paceWeek = [0, 1, 2, 3, 4, 5, 6].map(function(dayOfWeek) {
						return (paceData[dayOfWeek] / (times[dayOfWeek] || 1)).toFixed(2);
					});
					$scope.maxPaceWeek = getMaxOfArray($scope.paceWeek.map(function(minPerKm) {
						return ((minPerKm > 0) ? 60 / minPerKm : 0).toFixed(2);
					}));
					$scope.stepsWeek = ([0, 1, 2, 3, 4, 5, 6].map(function(dayOfWeek) {
						return (stepsClimbed[dayOfWeek]).toFixed(2);
					}));
					$scope.sumStepsWeek = sumUpArray($scope.stepsWeek);
					$scope.kcalsBurned = kcalsBurned;

				}).catch(function(res) {
					Notification.error(res.data.error);
				})
		}

		/**
		 * Get maximal value of any array.
		 * @param  {integer} array
		 * @return {integer} Maximal value
		 */
		function getMaxOfArray(numArray) {
			return Math.max.apply(null, numArray);
		}

		/* Function to rotate an array by a given number of places*/
		function rotate(array, index) {
			var slice1 = array.slice(0, index),
				slice2 = array.slice(index);

			return slice2.concat(slice1);
		}

		/**
		 * Get current weather information
		 * @return {object} weather object including temperature, humidity
		 */
		function getCurrentWeather() {
			navigator.geolocation.getCurrentPosition(function(position) {
				ApiService.getCurrentWeatherByLocation(position.coords.latitude, position.coords.longitude)
					.then(function(weather) {
						$scope.weather = {
							'icon': weather.currently.icon,
							'temperature': Math.round(weather.currently.temperature * 10) / 10,
							'humidity': weather.currently.humidity * 100,
							'color': '#337ab7'
						}
					}).catch(function(res) {
						Notification.error(res.data.error);
					});
			});
		}


		/**
		 * Get weekly goals by user from the database and set the slider values.
		 * @param  {String} ID The user id.
		 */
		function getUserGoals() {
			ApiService.getCurrentGoalsByUserId($rootScope.profile.user._id)
				.then(function(goals) {
					if (goals) {
						$scope.weeklyGoals = goals;
						$scope.distanceSlider.value = goals.distance;
						$scope.speedSlider.value = 60 / goals.speed;
						$scope.stepSlider.value = goals.steps;
						var hoursToUnlock = Math.floor((new Date(goals.endDateTime).getTime() - new Date().getTime()) / 3600000);
						$scope.timeToUnlock = `${Math.floor(hoursToUnlock / 24)} days, ${hoursToUnlock % 24} hours to go`;
						calculateTotalStats();
						calculateWeeklyStats();
					}
				}).catch(function(res) {
					Notification.error(res.data.error);
				});
		}
		$scope.$watch("weeklyGoals", function(newValue) {
			$scope.distanceSlider.options.disabled = !!newValue;
			$scope.speedSlider.options.disabled = !!newValue;
			$scope.stepSlider.options.disabled = !!newValue;
		})


		/* Get weekly goals from the sliders and post it to the database */
		$scope.setWeeklyGoal = function() {
			$scope.weeklyGoals = {
				user: $rootScope.profile.user._id,
				distance: $scope.distanceSlider.value,
				speed: 60 / $scope.speedSlider.value,
				steps: $scope.stepSlider.value,
				startDateTime: new Date(),
				endDateTime: addDaysToDate(new Date(), 7)
			}

			ApiService.createGoals($scope.weeklyGoals)
				.then(function() {
					Notification.success('Your goals are set');
					calculateWeeklyStats();
				})
				.catch(function(res) {
					Notification.error(res.data.error);
				});
			console.log(setGoalTimer());
			runsSinceGoalSet();
		};

		/**
		 * Used to load all the followers from the databased into memory so we can perform
		 * typeahead autocomplete search in the frontend
		 */
		function getFollowedUsers() {
			ApiService.getFollowedUsers($rootScope.profile.user._id)
				.then(function(followers) {
					$scope.followers = followers;
				})
				.catch(function(res) {
					Notification.error(res.data.error);
				});
		}

		/**
		 * Get all users from the database.
		 */
		function getUsers() {
			ApiService.getAllUsers()
				.then(function(users) {
					$scope.users = users;
					$scope.added = false;
				})
				.catch(function(res) {
					Notification.error(res.data.error);
				});
		}


		/**
		 * Once a user has been selected in the 'find friends' box, we instanly
		 * follow them when enter is pressed for example.
		 * @param $item - what is selected during typehead
		 */
		$scope.onSelectFollowed = function($item) {
			ApiService.followUser($rootScope.profile.user._id, $item._id).then(function(user) {}).then(function() {
				getFollowedUsers();
				Notification.success('You are now following ' + $item.name)
			}).catch(function(res) {
				Notification.error(res.data.error);
			});
		}

		/**
		 * Headlines of the landing.html file.
		 */
		$scope.headings = {
			headingsWeather: "Weather Today",
			headingsAchievements: "Achievement Progress",
			headingUpload: "Click to Upload GPX file",
			headingGoals: "Set Weekly Goals",
			headingFriending: "Add a friend",
			headingFriendlist: "Friends List",
			headingDistanceGoal: "Distance To Run (km)",
			headingStepsGoal: "Steps To Climb",
			headingSpeedgoal: "Highest Pace To Achieve (min/km)",
			headingDistanceMeasure: "Weekly Distance Statistics",
			headingStepMeasure: "Weekly Steps Statistics",
			headingSpeedMeasure: "Weekly Pace Statistics",
			headingDistanceArch: "Distance",
			headingStepsArch: "Steps",
		};

		/**
		 * Adds any number of days to a date.
		 * @param  {string}  date The user name.
		 * @param  {integer} days The user password.
		 * @return {string}  A date is return which is x days ahead of the input date.
		 */
		function addDaysToDate(date, days) {
			return new Date(date.setDate(date.getDate() + parseInt(days)));
		};

		/*Define default values of sliders*/
		$scope.distanceSlider = {
			value: 50,
			options: { floor: 0, ceil: 300, disabled: false }
		};
		$scope.speedSlider = {
			value: 10,
			options: { floor: 2, ceil: 10, rightToLeft: true, disabled: false }
		};
		$scope.stepSlider = {
			value: 35000,
			options: { floor: 0, ceil: 200000, disabled: false }
		};

		/* Pie chart title and labels*/
		$scope.pietitle = "Level of achievement this week"
		$scope.pielabels = ["achieved", "to be achieved"];

		/**
		 * Get an geoJson object of a run, add weather data matching the run.
		 * @param  {JSONobject} geoJson object including all data of a run.
		 * @param  {JSONobject} geoJson object including all data of a run.
		 */
		$scope.onCreateRun = function(geoJson) {
			var startingPoint = GeoService.extractStartingPoint(geoJson),
				runData = GeoService.getRunData(geoJson);

            if ($scope.runs) {
                for (var i = 0; i < $scope.runs.length; i++) {
                    if (new Date($scope.runs[i].startDateTime).getTime() == runData.startDateTime) {
                        Notification.error("You have already uploaded this run");
                        return;
                    }
                }
            }

			if (runData.distance >= 42.195 && !AchieveService.isMarathonerUnlocked($scope.runs)) {
				Notification.success("Special Achievement Unlocked : 'Marathoner'");
			}
			if (GeoService.distance(startingPoint, [-2.7967, 56.3398]) < 3 && !AchieveService.isHomecomingUnlocked($scope.runs)) {
				Notification.success("Special Achievement Unlocked : 'Homecoming'");
			}

			ApiService.getWeatherByDateTime(startingPoint[1], startingPoint[0], runData.startDateTime)
				.then(function(weather) {
					var run = {
							'geo': geoJson,
							'user': $rootScope.profile.user,
							'distance': runData.distance,
							'elevationData': runData.elevationData,
							'totalClimb': runData.totalClimb,
							'timestamps': runData.timestamps,
							'startDateTime': runData.startDateTime,
							'endDateTime': runData.endDateTime,
							'weather': weather
						},
						newRunId = null;

					if (weather.currently.temperature < 0 && !AchieveService.isSubZeroUnlocked($scope.runs)) {
						Notification.success("Special Achievement Unlocked : 'Sub-Zero'");
					}

					ApiService.createRun(run)
						.then(function(run) {
							newRunId = run._id;
							Notification.success('You have successfully uploaded your run');
							calculateTotalStats();
							calculateWeeklyStats();
						})
						.then(getRuns)
						.then(function(runs) {
							var uploadedRun = runs.find(function(run) {
								return run._id === newRunId;
							});

						})
						.catch(function(err) {
							console.log(err);
							Notification.error(err.data.error);
						});
				});
		};

		function getRuns() {
			return ApiService.getRunsByUserId($rootScope.profile.user._id)
				.then(function(runs) {
					$scope.runs = runs;
					return runs;
				});
		}

		function sumUpArray(inputArray) {
			var sum = 0;
			for (var i = 0; i < inputArray.length; i++) {
				sum += parseInt(inputArray[i])
			}
			return sum;
		};

		/* weather today*/
		function displayWeather(weather) {
			if (weather) {
				$scope.weather = {
					'icon': weather.currently.icon,
					'temperature': weather.currently.temperature,
					'humidity': weather.currently.humidity * 100,
					'color': 'blue',
					'iconSize': 50
				}
			}
		}

		$scope.cap = function(val, cap) {
			return Math.min(val, cap);
		};
		$scope.cup = function(val) {
			return Math.max(val, 0);
		};

	})
