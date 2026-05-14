/* eslint-disable angular/window-service */
/* eslint-disable angular/di */
(function() {
  'use strict';

  angular
    .module('ticketingApp', [
      'ngSanitize',
      'ngRoute',
      'angucomplete-alt',
      'angularGrid',
      'ng.deviceDetector'
    ])
    .config(trustedURLs)
    .config(routeProvider)
    .run(analytics)
    .constant('ngAuthSettings', {
      // this is used for what build you require before uploading to the relevant dir on CDN, just un-comment the one you require below
      baseURL: '$*baseUrlScDev',
      apiServiceBaseUri: '$*api',

      // LOCAL
      local: true, // Changes logic in services.js based on if this is available

      buildNo: 'NWM Ticketing v2.0.0'
    });
  trustedURLs.$inject = ['$sceDelegateProvider'];
  function trustedURLs($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([
      // Allow same origin resource loads.
      'self',
      'http://censlwebdev01/**',
      // Allow loading from our assets domain.  Notice the difference between * and **.
      'https:https://cloudcdn.wmca.org.uk/**',
      'http:https://cloudcdn.wmca.org.uk/**',
      '$*baseUrlScDev**'
    ]);
  }
  routeProvider.$inject = ['$routeProvider', 'ngAuthSettings'];
  function routeProvider($routeProvider) {
    // console.log(ngAuthSettings.buildNo + ngAuthSettings.apiServiceBaseUri); // Log the build to the console
    $routeProvider
      .when('/', {
        title: 'tickets',
        controller: 'TicketingSearchCtrl',
        templateUrl: 'tickets/views/tfwm/index.html',
        controllerAs: 'tickets',
        reloadOnSearch: false
      })

      .when('/ticket/:ticket', {
        title: 'ticket',
        controller: 'TicketDetailCtrl',
        controllerAs: 'ticket',
        templateUrl: 'ticket/views/shared/index.html',
        resolve: {
          // Before page loads..
          getUnique: [
            'savedFilter',
            function(savedFilter) {
              // Get the search page history url from cache
              return savedFilter.get('stateless');
            }
          ],
          getURL: [
            'savedFilter',
            function(savedFilter) {
              // get saved url from cache
              return savedFilter.get('url');
            }
          ]
        },
        reloadOnSearch: false
      })
      .otherwise({
        title: 'tickets',
        redirectTo: '/'
      });
  }

  // Safely instantiate dataLayer  - This is so Google Analytics tracks properly via Tag Manager
  analytics.$inject = ['$rootScope', '$location', '$window'];
  function analytics($rootScope, $location, $window) {
    const dataLayer = $window.dataLayer || [];

    $rootScope.$on('$routeChangeSuccess', function() {
      dataLayer.push({
        event: 'ngRouteChange',
        attributes: {
          route: $location.absUrl().split('https://www.tfwm.org.uk')[1]
        }
      });
    });
  }
})();
