'use strict'

/**
 * Service class to calculate various metrics based on runs
 */
angular.module('hfApp.metric', [])
	.service('MetricService', function() {

		var that = this;
        /**
		 * This function takes a decimal minutes value and converts it to mm:ss format
         * @param m decimal minutes
         * @returns {string} minutest in mm:ss format
         */
		this.minutesToMMSS = function(m) {
			return `${Math.floor(m)}:${Math.floor((m - Math.floor(m)) * 60)}`
		}

        /**
		 * Custom algorithm to claculate the amount of callories burned based on a run and the
		 * users details
         * @param run a run object
         * @returns {number} the amount of calories burned
         */
		this.calcKCalBurned = function(run) {
			if (run && run.user) {
				var user = run.user,
					weight = user.weight || 75,
					height = user.height || 177,
					gender = user.gender || "male",
					timeInSeconds = (new Date(run.endDateTime).getTime() - new Date(run.startDateTime).getTime()) / 1000,
					// Base Metabolic Rate: based on https://en.wikipedia.org/wiki/Harris%E2%80%93Benedict_equation
					BMR = 10 * weight + 6.25 * height - ((gender == "male") ? 145 : 311),
					// Physical Activity Ratio: based on https://www.thatsgeeky.com/2011/09/physical-activity-ratios/
					PAR = Math.min(Math.max(run.distance / timeInSeconds, 0.002), 0.006) * 3000;

				return BMR * PAR * timeInSeconds / 86400; // <-- diving by number of seconds in a day
			}
		};

        /**
		 * Calculates the total distance, steps and calories burned from
		 * an array of run objects. This can be used to create weekly statistics
		 * as well as total statistics used for the achievements
         * @param runs an array of runs
         * @returns {{}} an object containing the total distance, total steps and total calories burned
         */
		this.calcTotalMetrics = function(runs) {
			var totalMetrics = {};

			totalMetrics.totalDist = Math.floor(runs.reduce(function(acc, run) {
				return acc + run.distance;
			}, 0) * 10) / 10;
			totalMetrics.totalSteps = Math.floor(runs.reduce(function(acc, run) {
				return acc + run.totalClimb || 0;
			}, 0) * 5);
			totalMetrics.totalKcal = Math.floor(runs.reduce(function(acc, run) {
				return acc + that.calcKCalBurned(run);
			}, 0));

			return totalMetrics;
		}

        /**
		 * Calculates the duration of a run
         * @param run a run object
         * @returns {Date} the total time run
         */
		this.calcDuration = function(run) {
			if (run && run.endDateTime && run.startDateTime) {
				return new Date(new Date(run.endDateTime).getTime() - new Date(run.startDateTime).getTime());
			}
		}

        /**
		 * Calculates the pace for a given run
         * @param run a run object
         * @returns {string} the pace in mm:ss format
         */
		this.calcPace = function(run) {
			if (run && run.endDateTime && run.startDateTime && run.distance) {
				return that.minutesToMMSS(((new Date(run.endDateTime).getTime() - new Date(run.startDateTime).getTime()) / 60000) / run.distance);
			}
		}
	})
