(function() {
  'use strict';

  angular
    .module('ticketingApp')
    .directive('detailDetails', detailDetails)
    .directive('detailSidebar', detailSidebar)
    .directive('detailAlternative', detailAlternative)
    .directive('detailRelated', detailRelated)
    .directive('detailWhere', detailWhere)
    .directive('operators', operators);

  // DIRECTIVES

  function detailDetails() {
    return {
      templateUrl: 'ticket/views/shared/details.html',
      restrict: 'E'
    };
  }

  function detailSidebar() {
    return {
      templateUrl: 'ticket/views/shared/sidebar.html',
      restrict: 'E'
    };
  }

  function detailAlternative() {
    return {
      templateUrl: 'ticket/views/shared/alternative.html',
      restrict: 'E'
    };
  }

  detailRelated.$inject = ['$timeout', 'angularGridInstance'];
  function detailRelated($timeout, angularGridInstance) {
    return {
      templateUrl: 'ticket/views/shared/related-product.html',
      restrict: 'E',
      // this fixes a bug where the cards weren't loading on initial load in slow loading browsers
      link: function(scope) {
        scope.$$postDigest(function() {
          angular.element(document).ready(function() {
            $timeout(function() {
              angularGridInstance.alternativeResults.refresh();
            }, 0);
          });
        });
      }
    };
  }

  function detailWhere() {
    return {
      templateUrl: 'ticket/views/shared/where-can-i-use.html',
      restrict: 'E'
    };
  }

  function operators() {
    return {
      templateUrl: 'ticket/views/shared/operator.html',
      restrict: 'E'
    };
  }
})();
