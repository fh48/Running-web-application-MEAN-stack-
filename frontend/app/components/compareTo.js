/** @module compareTo **/
angular.module('hfApp.compareTo', []).directive('compareTo', function() {
	return {
		require: 'ngModel',
		scope: {
			otherModelValue: '=compareTo'
		},
		link: function(scope, element, attributes, ngModel) {

			/**
			 * Compares given value to own value.
			 * @param  {string} modelValue 	the model value
			 * @return {Boolean}            true if values are equal
			 */
			ngModel.$validators.compareTo = function(modelValue) {
				return modelValue == scope.otherModelValue;
			};

			//Watches the current model.
			scope.$watch('otherModelValue', function() {
				ngModel.$validate();
			});
		}
	};
});
