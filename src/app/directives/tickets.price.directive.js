(function() {
  'use strict';

  angular.module('ticketingApp').directive('price', price);

  // function to display price in product item
  function price() {
    const directive = {
      restrict: 'E',
      templateUrl: 'tickets/views/shared/price.html',
    };

    return directive;
  }
})();
