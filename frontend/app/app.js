'use strict';

/** @module hfApp **/
// Declare app level module which depends on views, and components
angular.module('hfApp', [
        // Angular modules.
        'ngRoute',
        'ngAnimate',
        'ngMessages',
        'ngStorage',
        'ngTouch',
        // 3rd party.
        'chart.js',
        'ui.bootstrap',
        'ngFileUpload',
        'angular-skycons',
        'ui-notification',
        // Custom page.
        'hfApp.runs',
        'hfApp.routes',
        'hfApp.login',
        'hfApp.landing',
        'hfApp.achievements',
        // Custom services.
        'hfApp.api',
        'hfApp.auth',
        'hfApp.geometry',
        'hfApp.achieve',
        'hfApp.metric',
        // Custom components.
        'hfApp.navbar',
        'hfApp.compareTo',
        'hfApp.modalProfile',
        'hfApp.userImage',
        'hfApp.map',
        'hfApp.uploadGpxArea',
        'hfApp.uploadGpxButton',
        'hfApp.modalChallenge',
        'hfApp.modalRun',
        'hfApp.modalRoute'
    ])
    .config(function($locationProvider, $routeProvider, $httpProvider, NotificationProvider) {
        $locationProvider.hashPrefix('!');
        $routeProvider.otherwise({
            redirectTo: '/login'
        });

        $httpProvider.defaults.headers.common['Content-Type'] = 'application/json';
        $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

        NotificationProvider.setOptions({
            delay: 5000,
            startTop: 20,
            startRight: 10,
            verticalSpacing: 20,
            horizontalSpacing: 20,
            positionX: 'center',
            positionY: 'bottom'
        });
    })

.run(function($rootScope, $http, $location, $localStorage) {
    $rootScope.profile = {};

    //Keep user logged in after page refresh.
    if ($localStorage.profile && $localStorage.profile.user && $localStorage.profile.token) {
        $http.defaults.headers.common.Authorization = 'JWT ' + $localStorage.profile.token;
        $rootScope.profile = $localStorage.profile;
    }

    //Redirect to the login page if no user is logged in and a restricted page is requested.
    $rootScope.$on('$locationChangeStart', function(event, next, current) {
        var publicPages = ['/login'],
            restrictedPage = publicPages.indexOf($location.path()) === -1;

        if (restrictedPage && !$localStorage.profile) {
            $location.path('/login');
        }
    });
});
