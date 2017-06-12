/** @module userImage **/
angular.module('hfApp.userImage', []).directive('userImage', function() {
	return {
		scope: {
			userImage: '='
		},
		link: function(scope, element, attrs, ngModel) {
			scope.$watch('userImage', function(newValue, oldValue) {
				var imagePath = newValue ? newValue : 'app/images/dummy-profile.jpg';
				element.css({
					'background': 'url(' + imagePath + ') no-repeat center center',
				    'background-size': 'cover',
				    'background-repeat': 'no-repeat'
				});
			});
		}
	};
});
