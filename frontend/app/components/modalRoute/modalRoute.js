'use strict';

/** @module modalDestination **/
angular.module('hfApp.modalRoute', [])
	.controller('ModalRouteCtrl', function($uibModalInstance, $scope, ApiService, data, Notification) {
		$scope.routes = angular.copy(data.routes);

		/**
		 * Called when cancel is selected. Closes the dialog.
		 */
		$scope.cancel = function() {
			$uibModalInstance.dismiss();
		};

		/**
		 * Saves the destination.
		 */
		$scope.onSelectRoute = function(route) {
			$uibModalInstance.close(route);
		};
	});
