(function() {
  'use strict';

  angular.module('ticketingApp').directive('mobilityCredits', mobilityCredits);

  // function to retrieve pricelevels and return if product is available on Google Pay
  function mobilityCredits() {
    var directive = {
      restrict: 'EA',
      templateUrl: 'tickets/views/shared/mobility-credits.html',
      scope: {
        value: '='
      },
      controller: mobilityCreditsController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;
  }

  mobilityCreditsController.$inject = ['$http'];
  function mobilityCreditsController($http) {
    var vm = this;
    vm.elementIds = [];
    vm.whereToBuy = [];

    // get ticket data form complete api
    $http.get('$*apitickets/' + vm.value + '/complete').then(function(response) {
      // work out if product has mobility credits in it's features
      angular.forEach(response.data.features, function(price) {
        vm.elementIds.push(price.name);
      });

      // remove duplicates from features
      vm.unique = vm.elementIds.filter(function(elem, index, self) {
        return index === self.indexOf(elem);
      });

      // if features include Mobility Credits
      if (vm.unique.includes('Mobility Credits')) {
        vm.mobC = true;
      } else {
        vm.mobC = false;
      }
    });
  }
})();
