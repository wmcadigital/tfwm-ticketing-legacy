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
    vm.whereToBuy = [];

    // get ticket data form complete api
    $http.get('$*apitickets/' + vm.value + '/complete').then(function(response) {
      // set where product can be brought
      if (response.data.purchaseTic) {
        vm.whereToBuy.push('Travel Centres');
      }

      if (response.data.purchasePayzone) {
        vm.whereToBuy.push('Payzone outlets');
      }

      if (response.data.purchaseRailStation) {
        vm.whereToBuy.push('Rail stations');
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

        vm.whereToBuy.push('On' + vm.brand + ' bus');
      }

      if (response.data.purchaseOnMetro) {
        vm.whereToBuy.push('On Metro');
      }

      if (response.data.buyOnDirectDebit) {
        vm.dd = '';

        if (response.data.buyOnSwift) {
          vm.dd = ' on Swift';
        }

        vm.whereToBuy.push('Direct Debit' + vm.dd);
      }

      if (response.data.buyOnSwift && !response.data.buyOnDirectDebit) {
        vm.whereToBuy.push('Swift');
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
        vm.whereToBuy.push('Swift PAYG');
      }

      // if priceLevel includes Google Pay
      if (vm.unique.includes('Google Pay')) {
        vm.gpay = false;
      } else {
        vm.gpay = false;
      }

      if (vm.gpay) {
        vm.whereToBuy.push('Google Pay');
      }
    });
  }
})();
