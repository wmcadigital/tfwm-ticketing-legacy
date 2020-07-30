(function() {
  'use strict';

  angular.module('ticketingApp').directive('search', search);

  // function to display price in product item
  function search() {
    var directive = {
      restrict: 'E',
      templateUrl: 'tickets/views/shared/initial-search.html'
    };

    return directive;
  }
})();
