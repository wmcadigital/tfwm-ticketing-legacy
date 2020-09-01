(function() {
  'use strict';

  angular.module('ticketingApp').directive('gpayButton', gpayButton);

  // function to retrieve pricelevels and return if product is available on Google Pay
  function gpayButton() {
    var directive = {
      restrict: 'EA',
      templateUrl: 'tickets/views/shared/gpay-button.html',
      scope: {
        value: '='
      },
      controller: gpaybuttonController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;
  }

  gpaybuttonController.$inject = ['$scope', '$http', 'deviceDetector'];
  function gpaybuttonController($scope, $http, deviceDetector) {
    var vm = this;
    vm.elementIds = [];
    vm.gpay = false;
    vm.toggleModalGPay = toggleModalGPay; // function to control gpay modal
    vm.deviceDetect = deviceDetect; // function to detect device

    // get ticket data form complete api
    $http.get('$*apitickets/' + vm.value + '/complete').then(function(response) {
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
      } else {
        vm.gpay = false;
      }
    });

    // get ticket data form simple api
    $http.get('$*apitickets/' + vm.value + '/simple').then(function(response) {
      // get the buy ticket url
      vm.ticketUrl = response.data.buyTicketUrl;
    });

    // google pay modal pop-up
    vm.modalShownGpay = false;
    function toggleModalGPay() {
      vm.modalShownGpay = !vm.modalShownGpay;
    }

    // detect device in use
    vm.deviceDetect();
    function deviceDetect() {
      vm.deviceDetector = deviceDetector.device;
    }
  }
})();
