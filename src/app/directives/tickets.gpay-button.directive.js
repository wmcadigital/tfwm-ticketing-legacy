(function() {
  'use strict';

  angular.module('ticketingApp').directive('paygButton', paygButton);

  // function to retrieve pricelevels and return if product is available on Google Pay
  function paygButton() {
    var directive = {
      restrict: 'EA',
      templateUrl: 'tickets/views/shared/product-payg-button.html',
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
    vm.buyButton = 'Buy now'; // default button text

    // get ticket data form simple api
    $http.get('$*apitickets/' + vm.value + '/simple').then(function(response) {
      vm.buyTicketUrl = response.data.buyTicketUrl;
    });

    // get ticket data form complete api - work out if product is gpay
    $http.get('$*apitickets/' + vm.value + '/complete').then(function(response) {
      console.log(response);

      // work out payg and gpay
      // get each priceLevel
      angular.forEach(response.data.priceLevels, function(price) {
        vm.elementIds.push(price.type);
      });

      // remove duplicates from priceLevel
      vm.unique = vm.elementIds.filter(function(elem, index, self) {
        return index === self.indexOf(elem);
      });

      // if priceLevel includes Google Pay
      if (vm.unique.includes('Google Pay')) {
        vm.gpay = true;
        vm.buyButton = 'Buy on Google Pay';
      } else {
        vm.gpay = false;
      }
    });
  }
})();
