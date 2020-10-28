(function() {
  'use strict';

  angular.module('ticketingApp').directive('gPay', gPay);

  // function to retrieve pricelevels and return if product is available on Google Pay
  function gPay() {
    var directive = {
      restrict: 'EA',
      templateUrl: 'tickets/views/shared/gpay.html',
      scope: {
        value: '='
      },
      controller: gpayController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;
  }

  gpayController.$inject = ['$http'];
  function gpayController($http) {
    var vm = this;
    vm.elementIds = [];
    vm.whereToBuy = [];

    // get ticket data form complete api
    $http.get('$*apitickets/' + vm.value + '/complete').then(function(response) {
      vm.matrixID = response.data.matrixId;
    });
  }
})();
