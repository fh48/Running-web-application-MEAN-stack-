/** @module compareTo **/
angular.module('hfApp.uploadGpxButton', []).directive('hfUploadGpxButton', function(ApiService, Notification) {
	return {
		scope: {
			callback: '&onConverted'
		},
		restrict: "E",
		replace: true,
		transclude: true,
		templateUrl: "app/components/uploadGpx/upload-gpx-button.html",
		link: function(scope, element, attributes, ngModel) {
			scope.onConvertGpx = function(file) {
				if (file) {
					ApiService.convertGpx(file, function(evt) {
							console.log('progress: ' + parseInt(100.0 * evt.loaded / evt.total) + '%');
						})
						.then(function(geoJson) {
							scope.callback({ 'geoJson': geoJson });
						})
						.catch(function(res) {
	                        Notification.error('Invalid GPX file');
						});
				}
			};

		}
	};
});
