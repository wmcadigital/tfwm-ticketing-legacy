(function () {
    'use strict';
    angular
        .module('timetablesApp', ['ngSanitize', 'ngAnimate', 'ngRoute', 'timetablesApp.timetablesCtrl', 'timetablesApp.timetablesServices', 'whatsonApp.sharedFilters', 'angularGrid'])
        .config(['$sceDelegateProvider', trustedURLs])
        .config(['$routeProvider', '$locationProvider', routeProvider])
        .run(['$rootScope', '$location', '$window', analytics]);

    function trustedURLs($sceDelegateProvider) {
        $sceDelegateProvider.resourceUrlWhitelist([
            // Allow same origin resource loads.
            'self',
            // Allow loading from our assets domain.  Notice the difference between * and **.
            'https://static.centro.org.uk/**',
            'http://static.centro.org.uk/**',
            'http://stagenwm.cenapps.org.uk/**',
            'https://stagenwm.cenapps.org.uk/**',
            'http://journeyplanner.cenapps.org.uk/Api/**',
            'https://www.networkwestmidlands.com/**'
        ]);
    }

    function routeProvider($routeProvider, $locationProvider, savedFilter, $location) {
        $routeProvider
            .when('/:query?', {
                controller: 'TimetablesListingCtrl',
                controllerAs: 'timetables',
                templateUrl: '//static.centro.org.uk/nwmAssets/apps/timetables/partials/search-results/index.html',
                reloadOnSearch: false
            })
            .when('/route/:ttID-:version', {
                templateUrl: '//static.centro.org.uk/nwmAssets/apps/timetables/partials/timetable/index.html',
                controller: 'TimetableCtrl',
                controllerAs: 'timetable',
                resolve: {//Before page loads..
                    getUnique: ['savedFilter', function (savedFilter) {//Get the search page history url from cache
                        return savedFilter.get("stateless");
                    }],
                    getURL: ['savedFilter', function (savedFilter) {//get saved url from cache
                        return savedFilter.get('url');
                    }]
                },
                reloadOnSearch: false
            })
            .otherwise({
                redirectTo: '/'
            });
        // $locationProvider.html5Mode(true);
    }

    // Safely instantiate dataLayer  - This is so Google Analytics tracks properly via Tag Manager
    function analytics($rootScope, $location, $window) {
        var dataLayer = $window.dataLayer = $window.dataLayer || [];

        $rootScope.$on('$routeChangeSuccess', function () {
            dataLayer.push({
                event: 'ngRouteChange',
                attributes: {
                    route: $location.absUrl().split('https://www.networkwestmidlands.com')[1]
                }
            });
        });
    }
})();