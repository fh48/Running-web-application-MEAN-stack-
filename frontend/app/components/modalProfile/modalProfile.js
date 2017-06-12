'use strict';

/** @module modalDestination **/
angular.module('hfApp.modalProfile', [])
	.controller('ModalProfileCtrl', function($uibModalInstance, $scope, ApiService, user, Notification) {
		$scope.user = angular.copy(user);
	    $scope.genderOptions = ['male', 'female'];

		/**
		 * Called when cancel is selected. Closes the dialog.
		 */
		$scope.cancel = function() {
			$uibModalInstance.dismiss();
		};

		/**
		 * Saves the destination.
		 */
		$scope.save = function() {
			updateUser();
		};

		$scope.onUploadImage = function(file) {
			ApiService.uploadImage(file, function(evt) {
					console.log(parseInt(100.0 * evt.loaded / evt.total));
				})
				.then(function(image) {
					$scope.user.imageUrl = image.url;
				})
				.then(function () {
                	Notification.success('You successfully uploaded your image')
				})
				.catch(function(res) {
                    Notification.error(res.data.error);
				});
		}

		/**
		 * Updates a user.
		 */
		function updateUser() {
			ApiService.updateUser($scope.user)
				.then(function(user) {
					$uibModalInstance.close(user);
				}).then(function () {
					Notification.success('You successfully updated your profile details')
				})
				.catch(function(res) {
                    Notification.error(res.data.error);
				});
		}
	});
