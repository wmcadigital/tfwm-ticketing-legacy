(function() {
  'use strict';

  angular.module('ticketingApp').directive('search', search);

  // function to display price in product item
  function search() {
    const directive = {
      restrict: 'E',
      templateUrl: 'tickets/views/shared/initial-search.html',
    };

    return directive;
  }
})();
