(function() {
  'use strict';

  angular.module('ticketingApp').filter('dateFormat', dateFormat);

  dateFormat.$inject = ['$filter'];
  function dateFormat($filter) {
    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow = tomorrow.setHours(0, 0, 0, 0);

    return function(text) {
      const tempdate = new Date(text).setHours(0, 0, 0, 0);

      if (text === null || text === undefined) {
        return false;
      }

      if (tempdate <= new Date().setHours(0, 0, 0, 0)) {
        return 'Today';
      }
      if (tempdate === tomorrow) {
        return 'Tomorrow';
      }

      return $filter('date')(tempdate, 'EEE dd MMM yyyy');
    };
  }
})();
