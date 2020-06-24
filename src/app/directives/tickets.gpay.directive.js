(function() {
  'use strict';

  angular.module('ticketingApp').directive('gpay', gpay);

  // function to retrieve pricelevels and return if product is available on Google Pay
  function gpay() {
    var directive = {
      restrict: 'EA',
      templateUrl: 'tickets/views/shared/gpay-li.html',
      scope: {
        value: '='
      },
      controller: GpayController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;
  }

  GpayController.$inject = ['$http'];
  function GpayController($http) {
    var vm = this;
    vm.elementIds = [];

    // get ticket data form complete api
    $http.get('$*apitickets/' + vm.value + '/complete').then(function(response) {
      // get each priceLevel
      angular.forEach(response.data.priceLevels, function(price) {
        vm.elementIds.push(price.type);
      });

      // remove duplicates from priceLevel
      vm.unique = vm.elementIds.filter(function(elem, index, self) {
        return index === self.indexOf(elem);
      });

      // if priceLevel include Google Pay
      if (vm.unique.includes('Google Pay')) {
        vm.gpay = true;
      } else {
        vm.gpay = false;
      }
    });
  }
})();
