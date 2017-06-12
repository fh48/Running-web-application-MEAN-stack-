'use strict';

/** @module login **/
angular.module('hfApp.login', ['ngRoute'])

.config(function($routeProvider) {
    $routeProvider.when('/login', {
        templateUrl: 'app/pages/login/login.html',
        controller: 'LoginCtrl'
    });
})

.controller('LoginCtrl', function($scope, $location, AuthService, ApiService, Notification) {

    $scope.login = {};
    $scope.register = {};
    $scope.genderOptions = ['male', 'female'];

    /**
  	 * Initialise the object login and register on the scope.
  	 */
    function resetForm() {
        $scope.login = {
            'name': '',
            'password': '',
            'error': ''
        };

        $scope.register = {
            'name': '',
            'email': '',
            'gender': '',
            'weight': '',
            'height': '',
            'password': '',
            'passwordRepeat': '',
            'error': ''
        };
    }

    /**
     * Assigns the onLogin function to the scope used for onclick of a button.
     */
    $scope.onLogin = function() {
        login($scope.login.name, $scope.login.password);
    };

    /**
     * Assigns the onRegister function to the scope used for onclick of a button.
     */
    $scope.onRegister = function() {
        register($scope.register);
    };

    /**
  	 * Logs in a user.
  	 * @param  {string} name The user name.
  	 * @param  {string} password The user password.
  	 */
    function login(name, password) {
        AuthService.login(name, password)
            .then(function() {
                resetForm();
                $location.path('/');
            })
            .catch(function(res) {
                $scope.login.error = res.data.error;
            })
    }
    
    /** Registers a new user.
  	  * @param  {object} register The user data from the form.
  	 */
    function register(register) {
        AuthService.register({
                'name': register.name,
                'password': register.password,
                'email': register.email,
                'gender': register.gender,
                'weight': register.weight,
                'height': register.height
            })
            .catch(function(err) {
                if (err && err.data && err.data.error) {
                    $scope.register.error = err.data.error;
                }
            })
            .then(function() {
                login(register.name, register.password);
                Notification.success("Special Achievement Unlocked : 'First Steps'");
            });
    };

    resetForm();

});
