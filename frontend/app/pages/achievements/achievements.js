'use strict';

/** @module challenges **/

angular.module('hfApp.achievements', ['ngRoute', 'chart.js'])

    .config(function($routeProvider) {
        $routeProvider.when('/achievements', {
            templateUrl: 'app/pages/achievements/achievements.html',
            controller: 'AchievementsCtrl'
        });
    })

    .controller('AchievementsCtrl', function($scope, $rootScope, ApiService, AchieveService, MetricService, GeoService) {
      /**
       * Calculates and displays the achievments using the matric and achieve service
       * @param  {Object} runs A object containing runs.
       */
        function displayAchievements(runs) {
            var totalMetrics = MetricService.calcTotalMetrics(runs);
            $scope.totalDist = totalMetrics.totalDist;
            $scope.totalSteps = totalMetrics.totalSteps;
            $scope.totalFloors = Math.round($scope.totalSteps / 18)
            $scope.totalKcal = totalMetrics.totalKcal;
            $scope.equivKcal = Math.floor($scope.totalKcal / 50) / 10;
            $scope.blueWhaleKcal = Math.floor($scope.totalKcal / 45.78) / 10000000;

            var bounds = AchieveService.getAchievementBounds($scope.totalDist);
            $scope.reachedDistance = bounds.reached;
            $scope.toNextDistance = bounds.toNext;
            $scope.remainingDist = Math.round(($scope.reachedDistance + $scope.toNextDistance - $scope.totalDist) * 10) / 10;

            bounds = AchieveService.getAchievementBounds($scope.totalSteps);
            $scope.reachedSteps = bounds.reached;
            $scope.toNextSteps = bounds.toNext;

            bounds = AchieveService.getAchievementBounds($scope.equivKcal);
            $scope.reachedKcal = bounds.reached;
            $scope.toNextKcal = bounds.toNext;

            $scope.isUnlocked = {
                "First Steps": "unlocked-achievement",
                "Marathoner": (AchieveService.isMarathonerUnlocked(runs))? "unlocked-achievement":"locked-achievement",
                "Sub-Zero": (AchieveService.isSubZeroUnlocked(runs))? "unlocked-achievement":"locked-achievement",
                "Homecoming": (AchieveService.isHomecomingUnlocked(runs))? "unlocked-achievement":"locked-achievement"
            }
        }

        $scope.user = $rootScope.profile.user;

        /**
      	 * Display achievements when runs are retrieved from the DB.
      	 * @param  {String} userID The user ID from the rootScope.
      	 */
        ApiService.getRunsByUserId($rootScope.profile.user._id)
            .then(function(runs) {
                displayAchievements(runs)
            });

        /**
         * Assign followers to scope when retrieved from the DB.
         * @param  {String} userID The user ID from the rootScope.
         */
        ApiService.getFollowedUsers($rootScope.profile.user._id)
            .then(function(followers) {
                $scope.followers = followers;
            });

        /**
         * Assign function to scope which retrieves runs from DB and runs.
         * When retrieved it runs a function to display the achievements.
         * @param  {String} userID The user ID.
         */
        $scope.onSelectUser = function(userId) {
            ApiService.getRunsByUserId(userId)
                .then(function(runs) {
                    displayAchievements(runs);
                });
        }

        /**
         * Object which contains all details about special achievements
         */
        $scope.specialAchievements = [{
            "name": "First Steps",
            "imageName": "first_steps.jpg",
            "description": "Register with the site"
        }, {
            "name": "Marathoner",
            "imageName": "marathoner.png",
            "description": "Run 42.2km (26.2 miles) in one go"
        }, {
            "name": "Sub-Zero",
            "imageName": "sub_zero.png",
            "description": "Run in freezing conditions (stay safe!)"
        }, {
            "name": "Homecoming",
            "imageName": "homecoming.png",
            "description": "Run in St Andrews, the birthplace of Runciple"
        }];
    });
