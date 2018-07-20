(function () {
    'use strict';
    angular
        .module('ticketingApp', ['ngSanitize', 'ngAnimate', 'ngRoute', 'ticketingApp.Controller', 'ticketingApp.Services', 'whatsonApp.sharedFilters', 'angularGrid'])
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
                controller: 'TicketingSearchCtrl',
                controllerAs: 'ticketing',
                templateUrl: '/partials/search-results/index.html',
                reloadOnSearch: false
            })
            .when('/ticket/:ticket', {
                templateUrl: '/partials/detail/index.html',
                controller: 'TicketDetailCtrl',
                controllerAs: 'ticket',
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