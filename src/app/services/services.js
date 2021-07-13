(function() {
  'use strict';

  angular
    .module('ticketingApp')
    .factory('ticketingService', ['$http', ticketingService])
    .factory('savedFilter', [savedFilter])
    .factory('updatePageView', ['$location', updatePageView]);

  ticketingService.$inject = ['$http'];
  function ticketingService($http) {
    const uri = '$*api';
    return {
      ticketSearch: function(data) {
        return getData($http.post(uri + 'tickets/search', data, { cache: true }));
      },
      getTicket: function(data) {
        return getData($http.get(uri + 'tickets/' + data, { cache: true }));
      },
      getTicketFull: function(data) {
        return getData($http.get(uri + 'tickets/' + data + '/complete', { cache: true }));
      },
      getTerms: function(data) {
        return getData($http.get(uri + 'terms/' + data, { cache: true }));
      },
      getStations: function() {
        return getData($http.get(uri + 'station/train', { cache: true }));
      },
      getOperators: function() {
        return getData($http.get(uri + 'operators', { cache: true }));
      },
      getBrands: function() {
        return getData($http.get(uri + 'brands', { cache: true }));
      },
      getSwiftSearch: function() {
        return getData($http.post(uri + 'tickets/search', { cache: true }));
      }
    };

    function getData(jsonData) {
      return jsonData.then(getDataComplete, getDataFail);
    }

    function getDataComplete(response) {
      return response.data;
    }

    function getDataFail(response) {
      // Log error
      console.warn(
        'Status: ' +
          response.status +
          '\n\nHeaders: ' +
          response.statusText +
          '\n\nData: ' +
          JSON.stringify(response.data) +
          '\n\nConfig: ' +
          JSON.stringify(response.config)
      );
    }
  }

  savedFilter.$inject = [];
  function savedFilter() {
    function set(savedData, data) {
      sessionStorage.setItem(savedData, JSON.stringify(data));
    }
    function get(savedData) {
      return JSON.parse(sessionStorage.getItem(savedData));
    }
    return {
      set: set,
      get: get
    };
  }

  updatePageView.$inject = ['$location'];
  function updatePageView($location) {
    // set function for updating GA pageview count...this is here for reusablility across controllers
    function update() {
      dataLayer.push({
        event: 'ngRouteChange',
        attributes: {
          route: $location.absUrl().split('https://legacy.wmnetwork.co.uk/')[1]
        }
      });
    }
    return {
      update: update
    };
  }
})();
