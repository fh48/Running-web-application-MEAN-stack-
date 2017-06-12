'use strict';

/** @module navbar **/
angular.module('hfApp.navbar', []).directive('navbar', function() {
	return {
		restrict: "E",
		replace: true,
		templateUrl: "app/components/navbar/navbar.html",
		controller: function($scope, $rootScope, AuthService, $location, $uibModal) {

			$scope.isNavCollapsed = true;

			//Gets the current user.
			$scope.$watch('$root.profile', function() {
				$scope.profile = $rootScope.profile;
			}, true);

			/**
			 * Logs out the user.
			 */
			$scope.onLogout = function() {
				AuthService.logout();
				$location.path('/login');
			};

			/**
			 * Navigates to different paths.
			 * @param  {String} path The navigated path.
			 */
			$scope.onNavigate = function(path) {
				$location.path(path);
			};

			/**
			 * Sate if given path is active.
			 * @param  {String}  path The location path.
			 * @return {Boolean} Indicates if path is active.
			 */
			$scope.isActive = function(path) {
				return $location.path().indexOf(path) === 0;
			};

			/**
			 * Opens a modal profile dialog.
			 */
			$scope.onShowProfile = function(user) {
				var profileModalInstance = $uibModal.open({
					'animation': true,
					'ariaLabelledBy': 'modal-title',
					'ariaDescribedBy': 'modal-body',
					'templateUrl': 'app/components/modalProfile/modal-profile.html',
					'controller': 'ModalProfileCtrl',
					'resolve': {
						'user': user
					}
				});

				profileModalInstance.result
					.then(function(user) {
						if (user) {
							$scope.profile.user = user;
						}
					})
					.catch(function() {

					});
			};
		}
	};
});
