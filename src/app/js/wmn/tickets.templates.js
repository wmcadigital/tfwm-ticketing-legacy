(function() {
  'use strict';

  angular
    .module('ticketingApp')
    .directive('initialSearch', initialSearch)
    .directive('searchResults', searchResults)
    .directive('filters', filters)
    .directive('filtersMobile', filtersMobile)
    .directive('ticketItem', ticketItem);

  // DIRECTIVES
  initialSearch.$inject = [];
  function initialSearch() {
    return {
      templateUrl: 'tickets/views/wmn/initial-search.html',
      restrict: 'E'
    };
  }

  searchResults.$inject = [];
  function searchResults() {
    return {
      templateUrl: 'tickets/views/shared/search-results.html',
      restrict: 'E'
    };
  }

  filters.$inject = [];
  function filters() {
    return {
      templateUrl: 'tickets/views/shared/filters.html',
      restrict: 'E'
    };
  }

  filtersMobile.$inject = [];
  function filtersMobile() {
    return {
      templateUrl: 'tickets/views/shared/filters-mobile.html',
      restrict: 'E'
    };
  }

  ticketItem.$inject = ['$timeout', 'angularGridInstance'];
  function ticketItem($timeout, angularGridInstance) {
    return {
      restrict: 'A',
      // This fixes a bug where the cards weren't loading on initial load in slow loading browsers
      link: function(scope) {
        // start by waiting for digests to finish
        scope.$$postDigest(function() {
          // next we wait for the dom to be ready
          angular.element(document).ready(function() {
            // finally we apply a timeout with a value
            // of 0 ms to allow any lingering js threads
            // to catch up
            $timeout(function() {
              // your dom is ready and rendered
              // if you have an ng-show wrapper
              // hiding your view from the ugly
              // render cycle, we can go ahead
              // and unveil that now:
              angularGridInstance.ticketResults.refresh();
              angularGridInstance.origTicketResults.refresh();
            }, 0);
          });
        });
      }
    };
  }
})();
