'use strict';

/** @module modalDestination **/
angular.module('hfApp.modalChallenge', [])
	.controller('ModalChallengeCtrl', function($uibModalInstance, $scope, ApiService, data, Notification) {
		var runs = data.runs,
			route = data.route;

		$scope.runs = angular.copy(runs);
		$scope.selectedRun = null;


		/**
		 * Called when cancel is selected. Closes the dialog.
		 */
		$scope.cancel = function() {
			$uibModalInstance.dismiss();
		};

		/**
		 * Saves the destination.
		 */
		$scope.confirm = function(selectedRun) {
			challengeRoute(selectedRun);
		};

		$scope.getDuration = function(startDateTime, endDateTime) {
			return (new Date(endDateTime).getTime() - new Date(startDateTime).getTime());
		};

		/**
		 * Updates a user.
		 */
		function challengeRoute(selectedRun) {
			var challenge = {
				'user': selectedRun.user._id,
				'route': route._id,
				'startDateTime': selectedRun.startDateTime,
				'endDateTime': selectedRun.endDateTime
			}

			ApiService.challengeRoute(challenge)
				.then(function(challenge) {
					return ApiService.getChallengeById(challenge._id);
				})
				.then(function(challenge){
					$uibModalInstance.close(challenge);
				})
				.then(function (){
					Notification.success('You have challanged '+ route.user.name );
				})
				.catch(function(res) {
					Notification.error(res.data.error);
				});
		}
	});
