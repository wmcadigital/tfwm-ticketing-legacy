/* eslint-disable angular/window-service */
(function() {
  'use strict';

  angular.module('ticketingApp').directive('item', item);

  // function to display item
  function item() {
    const directive = {
      restrict: 'E',
      templateUrl: 'tickets/views/shared/item.html',
      controller: itemController,
      controllerAs: 'vm', // Add controllerAs for view binding
      bindToController: true // Recommended for isolated scope
    };

    return directive;
  }

  function itemController() {
    const vm = this;
    vm.elementIds = [];
    vm.whereToBuy = [];

    if (window?.setTicketFinder?.name.includes('TfWM Ticket Finder')) {
      vm.finderLink = 'tfwm/';
    } else if (window?.setTicketFinder?.name.includes('Swift Ticket Finder')) {
      vm.finderLink = 'swift/';
    } else if (window?.setTicketFinder?.name.includes('Oneapp Ticket Finder')) {
      vm.finderLink = 'oneapp/';
    } else if (window?.setTicketFinder?.name.includes('Smart Citizen Desktop Production')) {
      vm.finderLink = 'tfwm-sc-desktop/';
    } else if (window?.setTicketFinder?.name.includes('Smart Citizen Desktop Test')) {
      vm.finderLink = 'tfwm-sc-desktop-test/';
    } else if (window?.setTicketFinder?.name.includes('Smart Citizen Production')) {
      vm.finderLink = 'tfwm-sc/';
    } else if (window?.setTicketFinder?.name.includes('Smart Citizen Dev')) {
      vm.finderLink = 'tfwm-sc-dev/';
    } else if (window?.setTicketFinder?.name.includes('Smart Citizen Test')) {
      vm.finderLink = 'tfwm-sc-test/';
    } else if (window?.setTicketFinder?.name.includes('Smart Citizen Mobile Production')) {
      vm.finderLink = 'tfwm-sc-mobile/';
    } else if (window?.setTicketFinder?.name.includes('Smart Citizen Mobile Test')) {
      vm.finderLink = 'tfwm-sc-mobile-test/';
    } else {
      vm.finderLink = '';
    }
  }
})();
