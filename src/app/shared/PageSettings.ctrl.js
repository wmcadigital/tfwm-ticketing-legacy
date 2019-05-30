(function() {
  'use strict';

  angular.module('ticketingApp').controller('PageSettingsCtrl', PageSettingsCtrl);

  // PAGE SETTINGS CONTROLLER
  PageSettingsCtrl.$inject = ['pageService'];
  function PageSettingsCtrl(pageService) {
    var vm = this;

    vm.title = pageService.title;
    vm.breadcrumb = pageService.breadcrumb;
  }
})();
