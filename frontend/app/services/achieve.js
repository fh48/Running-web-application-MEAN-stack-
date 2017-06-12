'use strict'

angular.module('hfApp.achieve', [])
    .service('AchieveService', function(GeoService) {

        /**
         * Our achievements are incremental, this function is to calculate what achievements
         * have been reached and what achievements are going to be reached next
         * @param n
         * @returns {{reached: *, toNext: *}}
         */
        this.getAchievementBounds = function(n) {
            n = Math.floor(n);
            var prev, next;
            if (n < 10) {
                prev = 0;
                next = 10;
            } else {
                var pow = 10 ** (String(n).length - 1);
                if (n >= 5 * pow) {
                    prev = 5 * pow;
                    next = 5 * pow;
                } else if (n >= 2 * pow) {
                    prev = 2 * pow;
                    next = 3 * pow;
                } else {
                    prev = pow;
                    next = pow;
                }
            }
            return {
                "reached": prev,
                "toNext": next
            }
        }

        /**
         * Checks if the marathoner special achievement has been reached
         * @param runs total runs of a user
         * @returns {boolean} true if it is unlocked
         */
        this.isMarathonerUnlocked = function(runs) {
            return (Math.max.apply(Math, runs.map(function(run) { return run.distance; })) >= 42.195)
        }

        /**
         * Check if the sub zero special achievement has been unlocked. This is when someone ran at sub-zero
         * temperatures
         * @param runs all runs of a user
         * @returns {boolean}
         */
        this.isSubZeroUnlocked = function(runs) {
            for (var i in runs) {
                if (runs[i].weather.currently.temperature < 0) {
                    return true;
                }
            }
            return false;
        }

        /**
         * Check if the user has uploaded a run within 3 miles of St Andrews, the birthplace of Runciple
         * @param runs Runs of a user
         * @returns {boolean}
         */
        this.isHomecomingUnlocked = function(runs) {
            for (var i in runs) {
                var startingPoint = GeoService.extractStartingPoint(runs[i].geo);
                var stAndrews = [-2.7967, 56.3398];
                if (GeoService.distance(startingPoint, stAndrews) < 3) {
                    return true;
                }
            }
            return false;
        }

    })
