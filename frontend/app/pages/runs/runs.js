'use strict';
var hafa;
/** @module map **/
angular.module('hfApp.runs', ['ngMap', 'ngRoute'])

    .config(function($routeProvider) {
        $routeProvider.when('/runs', {
            templateUrl: 'app/pages/runs/runs.html',
            controller: 'RunsCtrl'
        });
    })

    .controller('RunsCtrl', function($location, $scope, $uibModal, NgMap, ApiService, $http, $rootScope, GeoService, Notification, $filter, MetricService, AchieveService) {

        $scope.publishPopover = {
            name: '',
            title: 'Choose a name.'
        };

        /**
         * Get runs from the DB.
         * @param  {string} userID The user ID from rootScope
         * @return {array} run objects
         */
        function loadRuns() {
            return ApiService.getRunsByUserId($rootScope.profile.user._id)
                .then(function(runs) {
                    $scope.runs = runs;
                    return runs;
                });
        }

        /**
         * Display weather and info graphs.
         * @param  {object} run The object of a run.
         * @param  {string} password The user password.
         * @return {Promise}    Resolves to the user object and JWT authentication token.
         */
        function displayRunDetails(run) {
            $scope.selectedRun = run;
            displayWeather(run.weather);
            showInfoGraphs(run);
        }


        /**
         * Assign weather object to scope if existing.
         * @param  {object} weather weather object
         */
        function displayWeather(weather) {
            if (weather) {
                $scope.weather = {
                    'icon': weather.currently.icon,
                    'temperature': weather.currently.temperature,
                    'humidity': weather.currently.humidity * 100,
                    'color': '#337ab7'
                }
            }
        }

        /**
         * Create run from GPX file at an onclick event
         * @param  {object} geoJson geo data from GPX source
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
                        })
                        .then(loadRuns)
                        .then(function(runs) {
                            var uploadedRun = runs.find(function(run) {
                                return run._id === newRunId;
                            });
                            displayRunDetails(uploadedRun);
                        })
                        .catch(function(err) {
                            Notification.error(err.data.error);
                        });
                });
        }

        /**
         * Get duration value from metric service
         * @param  {object} run run object
         * @return {integer} duration integer value
         */
        $scope.getDuration = function(run) {
            return MetricService.calcDuration(run);
        };

        /**
         * Get pace value from metric service
         * @param  {object} run run object
         * @return {integer} pace integer value
         */
        $scope.getPace = function(run) {
            return MetricService.calcPace(run);
        };

        /**
         * Get Kcal value from metric service
         * @param  {object} run run object
         * @return {integer} pace integer value
         */
        $scope.getKcal = function(run) {
            return MetricService.calcKCalBurned(run);
        }

        /**
         * display run detail modal at onclick.
         */
        $scope.onSelectRun = function() {
            var runModalInstance = $uibModal.open({
                'animation': true,
                'ariaLabelledBy': 'modal-title',
                'ariaDescribedBy': 'modal-body',
                'templateUrl': 'app/components/modalRun/modal-run.html',
                'controller': 'ModalRunCtrl',
                'resolve': {
                    'data': {
                        'runs': $scope.runs
                    }
                }
            });

            runModalInstance.result
                .then(function(run) {
                    if (run) {
                        displayRunDetails(run);
                    }
                })
                .catch(function(err) {
                    console.log(err);
                });
        }

        /**
         * Publishing a route
         * @param  {string} name The name of the route
         * @param  {object} run  A run object
         */
        $scope.onPublishRun = function(name, run) {
            var route = {
                    'name': name,
                    'user': run.user,
                    'run': run,
                    'distance': run.distance,
                    'elevationData': run.elevationData,
                    'geo': run.geo
                },
                challenge = {
                    'user': run.user,
                    'route': null,
                    'startDateTime': run.startDateTime,
                    'endDateTime': run.endDateTime
                };

            ApiService.createRoute(route)
                .then(function(route) {
                    challenge.route = route;
                    return ApiService.challengeRoute(challenge);
                }).then(function() {
                    Notification.success('You have successfully published your run')
                })
                .then(function() {
                    $location.path('/routes').search({
                        'routeId': challenge.route._id
                    });
                })
                .catch(function(res) {
                    Notification.error(res.data.error);
                });
        };

        /**
         * Options of the elevation graph
         */
        $scope.elevationOptions = {
            scales: {
                xAxes: [{
                    type: 'linear',
                    position: 'bottom',
                    scaleLabel: {
                        display: true,
                        labelString: 'Distance (km)'
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Elevation (meters)'
                    }
                }],
            },
            maintainAspectRatio: false,
            tooltips: {
                callbacks: {
                    title: function() {
                        return "";
                    },
                    label: function(tooltipItem, data) {
                        return Math.round(tooltipItem.yLabel * 100) / 100;
                    }
                }
            },
            tooltipTitleFontSize: 0
        };

        /**
         * Colors of the elevation graph
         */
        $scope.elevationColors = [{
            borderColor: "#8CF",
            backgroundColor: "rgba(167,211,225,.4)",
            pointBackgroundColor: 'transparent',
            pointBorderColor: 'transparent'
        }];

        /**
         * Options of the pace graph
         */
        $scope.paceOptions = {
            scales: {
                xAxes: [{
                    type: 'linear',
                    position: 'bottom',
                    scaleLabel: {
                        display: true,
                        labelString: 'Distance (km)'
                    }
                }],
                yAxes: [{
                    ticks: {
                        userCallback: function(s) {
                            return secondsToMMSS(s);
                        }
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Pace (min/km)'
                    }
                }]
            },
            maintainAspectRatio: false,
            tooltips: {
                callbacks: {
                    title: function() {
                        return "";
                    },
                    label: function(tooltipItem, data) {
                        return secondsToMMSS(tooltipItem.yLabel);
                    }
                }
            }
        };

        /**
         * Colors of the pace graph
         */
        $scope.paceColors = [{
            borderColor: "#F88",
            fill: false,
            pointBackgroundColor: 'transparent',
            pointBorderColor: 'transparent'
        }];

        /**
         * Calculates miliseconds from seconds
         * @param  {integer} seconds time in seconds
         * @return {integer} time in miliseconds
         */
        function secondsToMMSS(s) {
            s = Math.round(s)
            return `${Math.floor(s / 60)}:${("0" + s % 60).slice(-2)}`;
        }

        /**
         * display graphs of elevation and pace
         * @param  {object} run  A run object
         */
        function showInfoGraphs(run) {
            if (run.elevationData.length > 0) {
                $scope.elevationData = [run.elevationData];
            } else {
                $scope.elevationData = undefined;
            }

            // compute an array of paces between consecutive timestamps
            var paceData = run.timestamps.map(function(timestamp, i) {
                return {
                    x: i ? (timestamp.x + run.timestamps[i - 1].x) / 2 : undefined,
                    y: i ? (timestamp.y - run.timestamps[i - 1].y) / (timestamp.x - run.timestamps[i - 1].x) : undefined
                }
            });
            // then apply smoothing to the pace data
            $scope.paceData = [paceData.map(function(elt, i) {
                if (i == 0) {
                    return {
                        x: paceData[0].x,
                        y: paceData[1].y
                    }
                } else if (i == 1) {
                    return {
                        x: paceData[1].x,
                        y: (4 * paceData[1].y + paceData[2].y) / 5
                    }
                } else if (i == paceData.length - 1) {
                    return {
                        x: paceData[i].x,
                        y: (paceData[i - 1].y + 4 * paceData[i].y) / 5
                    }
                } else {
                    return {
                        x: paceData[i].x,
                        y: (paceData[i - 1].y + 8 * paceData[i].y + paceData[i + 1].y) / 10
                    }
                }
            })];
        }

        loadRuns()
            .then(function(runs) {
                // Select the last ran run.
                var orderedRuns = $filter('orderBy')(runs, '-startDateTime');
                if (orderedRuns && orderedRuns.length > 0) {
                    displayRunDetails(orderedRuns[0]);
                }
            });

    });
