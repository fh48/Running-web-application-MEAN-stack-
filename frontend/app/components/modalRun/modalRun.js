'use strict';

/** @module modalDestination **/
angular.module('hfApp.modalRun', [])
	.controller('ModalRunCtrl', function($uibModalInstance, $scope, ApiService, data, Notification) {
		$scope.runs = angular.copy(data.runs);

		/**
		 * Called when cancel is selected. Closes the dialog.
		 */
		$scope.cancel = function() {
			$uibModalInstance.dismiss();
		};

		/**
		 * Saves the destination.
		 */
		$scope.onSelectRun = function(run) {
			$uibModalInstance.close(run);
		};
	});
