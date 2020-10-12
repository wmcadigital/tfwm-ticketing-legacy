(function() {
  'use strict';

  angular.module('ticketingApp').directive('item', item);

  // function to display item
  function item() {
    var directive = {
      restrict: 'E',
      templateUrl: 'tickets/views/shared/item.html'
    };

    return directive;
  }
})();
