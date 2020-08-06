(function() {
  'use strict';

  angular.module('ticketingApp').directive('whereToBuy', whereToBuy);

  // function to retrieve pricelevels and return if product is available on Google Pay
  function whereToBuy() {
    var directive = {
      restrict: 'EA',
      templateUrl: 'tickets/views/shared/product-where-to-buy.html',
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
      // set where product can be brought
      if (response.data.purchaseTic) {
        vm.purchaseTic = true;
      }

      if (response.data.purchasePayzone) {
        vm.purchasePayzone = true;
      }

      if (response.data.purchaseRailStation) {
        vm.purchaseRailStation = true;
      }

      if (response.data.purchaseOnBus) {
        vm.brand = '';

        if (response.data.brand === 'National Express') {
          vm.brand = ' National Express';
        }

        if (response.data.brand === 'Stagecoach') {
          vm.brand = ' Stagecoach';
        }

        if (response.data.brand === 'Diamond Bus') {
          vm.brand = ' Diamond';
        }
      }

      if (response.data.purchaseOnMetro) {
        vm.purchaseOnMetro = true;
      }

      if (response.data.buyOnDirectDebit) {
        vm.dd = '';
        vm.buyOnDirectDebit = true;

        if (response.data.buyOnSwift) {
          vm.dd = ' on Swift';
          vm.buyOnSwift = true;
        }
      }

      // work out payg and gpay
      // get each priceLevel
      angular.forEach(response.data.priceLevels, function(price) {
        vm.elementIds.push(price.type);
      });

      // remove duplicates from priceLevel
      vm.unique = vm.elementIds.filter(function(elem, index, self) {
        return index === self.indexOf(elem);
      });

      // if priceLevel includes Swift PAYG
      if (vm.unique.includes('Swift PAYG')) {
        vm.payg = true;
      } else {
        vm.payg = false;
      }

      if (vm.payg) {
        vm.purchasePayg = true;
      }

      // if priceLevel includes Google Pay
      if (vm.unique.includes('Google Pay')) {
        vm.gpay = true;
      } else {
        vm.gpay = false;
      }

      if (vm.gpay) {
        vm.purchaseGpay = true;
      }
    });
  }
})();
