(function() {
  'use strict';

  angular.module('ticketingApp').directive('ticketPrice', ticketPrice);

  // function to display price in product sidebar and mobile details
  function ticketPrice() {
    var directive = {
      restrict: 'E',
      templateUrl: 'ticket/views/shared/price.html'
    };

    return directive;
  }
})();
