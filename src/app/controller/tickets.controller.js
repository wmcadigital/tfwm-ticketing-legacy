/* eslint-disable angular/window-service */
/* eslint-disable no-useless-escape */
(function() {
  'use strict';

  angular
    .module('ticketingApp')
    .controller('TicketingSearchCtrl', TicketingSearchCtrl)
    .filter('replace', replace);

  TicketingSearchCtrl.$inject = [
    'ngAuthSettings',
    '$scope',
    '$anchorScroll',
    '$timeout',
    '$filter',
    '$location',
    'savedFilter',
    'ticketingService',
    'angularGridInstance',
    '$httpParamSerializer',
    'deviceDetector'
  ];

  function TicketingSearchCtrl(
    ngAuthSettings,
    $scope,
    $anchorScroll,
    $timeout,
    $filter,
    $location,
    savedFilter,
    ticketingService,
    angularGridInstance,
    $httpParamSerializer,
    deviceDetector
  ) {
    const vm = this;
    let stations;
    let stationSel;
    let stationSplit;
    vm.submit = submit; // Function to submit initial search
    vm.clearFilter = clearFilter; // Function to reset filters
    vm.getStations = getStations; // Function to retrieve stations
    vm.getoocStations = getoocStations; // Function to retrieve out of county stations
    vm.geticStations = geticStations; // Function to retrieve in county stations
    vm.clearFromStation = clearFromStation; // Function to clear from station
    vm.clearToStation = clearToStation; // Function to clear to station
    vm.clearViaOneStation = clearViaOneStation; // Function to clear via one station
    vm.clearStation = clearStation; // Function to clear to from station if not in url - []
    vm.clearTime = clearTime; // Function to clear time selection
    vm.checkTimeAll = checkTimeAll; // Function to check time checkboxes
    vm.checkTime = checkTime; // Function to check time checkboxes
    vm.getSwiftPAYG = getSwiftPAYG; // Function to retrieve stations
    vm.updateGrid = updateGrid; // Function to update results grid
    vm.update = update; // Do filtering logic in controller so sessions can be stored
    vm.loadMore = loadMore; // function to load more results
    vm.loadMoreExact = loadMoreExact; // function to load more exact results
    vm.refreshExact = refreshExact; // function to refresh the exact results grid
    vm.refreshOther = refreshOther; // function to refresh the other results grid
    vm.filterButtons = {
      operator: [],
      operatorLength: 0,
      busTravelArea: [],
      railZoneFrom: [],
      railZoneTo: []
    }; // set an object for the filters show/hide toggle to fall into
    vm.toggleFilter = toggleFilter;
    vm.swiftPAYG = swiftPAYG; // Function for hiding fields if Swift PAYG is selected
    vm.swiftABT = swiftABT; // Function for hiding fields if Swift ABT is selected
    vm.ntrainOOC = ntrainOOC; // Function for setting out of county tickets
    vm.toggleModalFilter = toggleModalFilter;
    vm.searchLocation = $location.host(); // Set the current host
    vm.deviceDetect = deviceDetect; // Function to detect device
    vm.selectPass = selectPass; // Function to reset filters if select your pass is selected
    // Set up the default Vars on page load, and so that they can be reset with 'reset filters' button
    function defaultVars() {
      vm.all = []; // Set results to blank array
      vm.filteredTickets = []; // Define filtered results as blank array
      vm.origTickets = []; // Define original filtered results as blank array
      vm.otherTickets = []; // Define other filtered results as blank array
      vm.stationList = []; // Define Station list
      vm.stationoocList = []; // Define out of county Station list
      vm.stationicList = []; // Define in county Station list
      vm.swiftPaygIds = []; // Define Swift PAYG tickets
      vm.loadingStatus = ''; // Set results status to blank
      vm.swiftPaygloadingStatus = ''; // Set results status to blank
      vm.passValue = ''; // Set pass select value to blank
      vm.orderBy = 'orderSequence';
      vm.limit = parseInt($location.search().limit) || 6; // Set paging limit to what's in url or default to 6
      vm.limitExact = parseInt($location.search().limitExact) || 6; // Set paging limit for exact results to what's in url or default to 6
      vm.postJSON = {
        allowBus: $location.search().allowBus || null,
        allowMetro: $location.search().allowMetro || null,
        allowTrain: $location.search().allowTrain || null,
        passengerType: $location.search().passengerType || '',
        timeBand: $location.search().timeBand || '',
        brand: $location.search().brand || null,
        stationNames: $location.search().stationNames || null
      }; // Define postJSON default values
      vm.stationFromName = null; // Clear Stations
      vm.stationToName = null;
      vm.stationFromTitle = null;
      vm.stationToTitle = null;
      vm.stationFromNameOocZ5 = null;
      vm.stationToNameOocZ5 = null;
      // vm.openFilters = openFilters;
      // vm.closeFilters = closeFilters;
      vm.fromStationInfo = null;
      vm.eligibilityDate = null;

      // url parameters
      // exclude bus
      vm.excludebusParameter = $location.search().excludeBus || null;

      // direct debit
      vm.buyOnDirectDebitParameter = $location.search().buyOnDirectDebit || null;

      // quick buy
      vm.buyOnDirectPurchaseParameter = $location.search().buyOnDirectPurchase || null;

      // swift
      vm.buyOnSwiftParameter = $location.search().buyOnSwift || null;

      // buy online
      vm.hasOnlinePurchaseChannelParameter = $location.search().hasOnlinePurchaseChannel || null;

      // tic
      vm.purchaseTicParameter = $location.search().purchaseTic || null;

      // rail station
      vm.purchaseRailStationParameter = $location.search().purchaseRailStation || null;

      // payzone
      vm.purchasePayzoneParameter = $location.search().purchasePayzone || null;

      // bus travel area
      vm.busTravelAreaParameter = $location.search().busTravelArea || null;

      // bus operator
      vm.operatorParameter = $location.search().operator || null;

      // rail from zone
      vm.railZoneFromParameter = $location.search().railZoneFrom || null;

      // rail to zone
      vm.railZoneToParameter = $location.search().railZoneTo || null;

      // anytime
      vm.timePeriodAnytimeParameter = $location.search().timePeriodAll || null;

      // pre 9.30
      vm.timePeriod1Parameter = $location.search().timePeriod1 || null;

      // 9.30 - 3.30
      vm.timePeriod2Parameter = $location.search().timePeriod2 || null;

      // 3.30 - 6
      vm.timePeriod3Parameter = $location.search().timePeriod3 || null;

      // after 6
      vm.timePeriod4Parameter = $location.search().timePeriod4 || null;

      vm.clearModes = clearModes;
      vm.postedJSON = {}; // Define the object to hold the initial search criteria

      vm.stationFromReq = false; // set from station to not required
      vm.stationToReq = false; // set from station to not required
      vm.stationToReqtwo = false;
      vm.stationFromOOCReq = true; // if Train OOC pass selected make station required
      vm.timePeriodAll = true;
      vm.fromZoneNumber = null;
      vm.toZoneNumber = null;
    }

    defaultVars();

    vm.slug = 'testing789';

    // work out 16-18 elibility year
    function subtractYears(dates, years) {
      // 👇 make copy with "Date" constructor
      const dateCopy = new Date(dates);
      dateCopy.setFullYear(date.getFullYear() - years);
      return dateCopy;
    }

    const currentDate = new Date();
    const year = currentDate.getFullYear();

    const date = new Date(`${year}-09-01T00:00:00.000Z`);
    let newDate = subtractYears(date, 18);

    if (currentDate > date) {
      newDate = subtractYears(date, 18);
    } else {
      newDate = subtractYears(date, 19);
    }

    vm.eligibilityDate = newDate.getFullYear();

    // If location.search contains search criteria force the submit on page load
    if (
      $location.search().allowBus ||
      $location.search().allowMetro ||
      $location.search().allowTrain ||
      ($location.search().brand &&
        $location.search().passengerType &&
        $location.search().timeBand) ||
      $location.search().busTravelArea ||
      $location.search().operator ||
      $location.search().stationNames ||
      $location.search().brand
    ) {
      vm.clearStation();
      // Set initial value of from & to stations if in Url
      if (
        ($location.search().stationNames && vm.postJSON.allowTrain === true) ||
        vm.postJSON.brand === 'nnetwork' ||
        vm.postJSON.brand === 'ntrain'
      ) {
        if ($location.search().stationNames) {
          stations = $location.search().stationNames;
          stationSel = stations.toString();
          stationSplit = stationSel.split(',');
          vm.stationFromName = stationSplit['0'];
          vm.stationToName = stationSplit['1'];
          vm.stationViaOneName = stationSplit['2'];
        }
      } else {
        vm.stationFromName = null;
        vm.stationToName = null;
      }
      vm.getStations();
      submit(vm.postJSON);
    } else {
      $location.url('').replace();
    }

    vm.showDetails = false;

    // if back button pressed or breadcrumb selected. If brand is Swift PAYG make sure relevant tickets are shown
    if ($location.search().brand === 'Swift PAYG') {
      getSwiftPAYG();
      swiftPAYG();
    }

    // if back button pressed or breadcrumb selected. If brand is Swift ABT
    if ($location.search().brand === 'Swift Go') {
      swiftABT();
    }

    // detect device in use
    vm.deviceDetect();
    function deviceDetect() {
      vm.deviceDetector = deviceDetector;
      vm.userAgent = deviceDetector.raw.userAgent;
      // check if userAgent is Swift One app
      if (vm.userAgent.includes('SwiftOneApp')) {
        vm.oneApp = true;
      } else {
        vm.oneApp = false;
      }
      if (vm.userAgent.includes('android')) {
        vm.android = true;
      } else {
        vm.android = false;
      }
      if (vm.deviceDetector.os === 'android' || vm.deviceDetector.os === 'ios') {
        vm.isMobile = true;
      } else {
        vm.isMobile = false;
      }
    }

    // Get Rail stations for autocomplete
    function getStations() {
      // console.log("get stations");
      ticketingService.getStations().then(function(response) {
        let fromRail;
        let toRail;
        let ViaOneRail;
        let dataFromRail;
        let dataToRail;
        let dataViaOnRail;
        let dataFromRailData;
        let dataToRailData;
        let dataViaOneRailData;
        // console.log("rail stations");
        // console.log(response);
        vm.stationList = response;
        // if going direct to page with stations work out zone information
        if (vm.stationFromName !== null) {
          fromRail = vm.stationFromName || null;
          toRail = vm.stationToName || null;
          ViaOneRail = vm.stationViaOneName || null;
          dataFromRail = $filter('filter')(response, { name: fromRail });
          dataToRail = $filter('filter')(response, { name: toRail });
          dataViaOnRail = $filter('filter')(response, { name: ViaOneRail });
          dataFromRailData = dataFromRail['0'];
          dataToRailData = dataToRail['0'];
          dataViaOneRailData = dataViaOnRail['0'];
          vm.fromStationInfo = dataFromRailData;
          vm.toStationInfo = dataToRailData;
          vm.ViaOneStationInfo = dataViaOneRailData;

          if (vm.fromStationInfo != null) {
            vm.fromZoneNumber = vm.fromStationInfo.zone;
            vm.toZoneNumber = vm.toStationInfo.zone;
            if (vm.ViaOneStationInfo != null) {
              vm.ViaOneZoneNumber = vm.ViaOneStationInfo.zone;
            }
          }
        }
      });
    }

    function submit(data) {
      let fbus;
      let ftrain;
      let fmetro;
      let i;
      let j;
      let arrlen;
      let bus;
      let train;
      let metro;
      let searchAll;
      let searchExact;
      vm.loadingStatus = 'loading';
      angular.copy(vm.postJSON, vm.postedJSON); // save initial search variables

      $location.search({
        allowBus: vm.postedJSON.allowBus,
        allowTrain: vm.postedJSON.allowTrain,
        allowMetro: vm.postedJSON.allowMetro,
        passengerType: vm.postedJSON.passengerType,
        timeBand: vm.postedJSON.timeBand,
        brand: vm.postedJSON.brand,
        stationNames: vm.postedJSON.stationNames,
        buyOnDirectDebit: vm.buyOnDirectDebitParameter,
        buyOnDirectPurchase: vm.buyOnDirectPurchaseParameter,
        buyOnSwift: vm.buyOnSwiftParameter,
        hasOnlinePurchaseChannel: vm.hasOnlinePurchaseChannelParameter,
        purchaseTic: vm.purchaseTicParameter,
        purchaseRailStation: vm.purchaseRailStationParameter,
        purchasePayzone: vm.purchasePayzoneParameter,
        busTravelArea: vm.busTravelAreaParameter,
        operator: vm.operatorParameter,
        railZoneFrom: vm.railZoneFromParameter,
        railZoneTo: vm.railZoneToParameter,
        timePeriodAll: vm.timePeriodAnytimeParameter,
        timePeriod1: vm.timePeriod1Parameter,
        timePeriod2: vm.timePeriod2Parameter,
        timePeriod3: vm.timePeriod3Parameter,
        timePeriod4: vm.timePeriod4Parameter,
        limit: vm.limit,
        limitExact: vm.limitExact,
        excludeBus: vm.excludebusParameter
      }); // set search url for sharing/tracking

      vm.searchFilters = {}; // set scope for search filters and reset on every search

      vm.origFilters = {}; // set scope for original search filters and reset on every search
      // console.log('this is posted');
      // console.log(vm.postedJSON);

      // work out all tickets available
      ticketingService.ticketSearch(data).then(function(response) {
        vm.all = response;
        vm.original = response;

        // For each item in the results
        angular.forEach(vm.all, function(items) {
          // Check the operator and push it to filters
          if (vm.filterButtons.operator.indexOf(items.operator) === -1) {
            vm.filterButtons.operator.push(items.operator);
          }

          // Check bus area
          if (vm.filterButtons.busTravelArea.indexOf(items.busTravelArea) === -1) {
            vm.filterButtons.busTravelArea.push(items.busTravelArea);
          }

          // Check rail zone from
          if (vm.filterButtons.railZoneFrom.indexOf(items.railZoneFrom) === -1) {
            vm.filterButtons.railZoneFrom.push(items.railZoneFrom);
          }

          // Check rail zone to
          if (vm.filterButtons.railZoneTo.indexOf(items.railZoneTo) === -1) {
            vm.filterButtons.railZoneTo.push(items.railZoneTo);
          }

          // eslint-disable-next-line angular/window-service
          // console.log(window?.setTicketFinder?.name);
          // console.log(items);
          // console.log(items.buyTicketUrl);

          // unicard
          // "https://natex-ssp.unicard-uk.com/ssp/swift/dnr_importBasket.jsp?[{matrixId:'CAA118'}]",
          // "https://ticketing.cenapps.org.uk/DirectDebit/34",

          // "https://my.swiftcard.org.uk/ssp/swift/dnr_importBasket.jsp?[{matrixId:'KAA045'}]",
          // "buyTicketUrl": "https://ticketing.networkwestmidlands.com/DirectDebit/411",

          // Smart Citizen
          // https://m-public-tfwmtest.smartcitizen.net/?matrixId=AAA116
          // https://m-public-tfwm.smartcitizen.net/?matrixId=AAA116

          // https://public-tfwmdev.smartcitizen.net/?matrixId=AAA116
          // https://public-tfwmtest.smartcitizen.net/?matrixId=AAA116

          // https://public-tfwmlive.smartcitizen.net//?matrixId=AAA116

          // console.log('Original: ' + items.buyTicketUrl);

          if (window?.setTicketFinder?.name.includes('TfWM Ticket Finder')) {
            // console.log('Unicard app detected (Production)');
            if (!items.buyTicketUrl.includes('ticketing.networkwestmidlands.com')) {
              // eslint-disable-next-line no-unused-vars
              const [host, queryString] = items.buyTicketUrl.split('?');
              items.buyTicketUrl =
                'https://my.swiftcard.org.uk/ssp/swift/dnr_importBasket.jsp?' + queryString;
            }
          }

          if (window?.setTicketFinder?.name.includes('Unicard Desktop Test')) {
            // console.log('Unicard app detected (Test)');
            if (!items.buyTicketUrl.includes('ticketing.cenapps.org.uk')) {
              // eslint-disable-next-line no-unused-vars
              const [host, queryString] = items.buyTicketUrl.split('?');
              items.buyTicketUrl =
                'https://natex-ssp.unicard-uk.com/ssp/swift/dnr_importBasket.jsp?' + queryString;
            }
          }

          // Check if the buy ticket url is a smartcitizen ticket finder and format it differently
          if (
            items.buyTicketUrl.includes('matrixId') &&
            window?.setTicketFinder?.name.includes('Smart Citizen')
          ) {
            // console.log('Smart Citizen app detected' + window?.setTicketFinder?.name);
            let baseUrl = '';
            if (window?.setTicketFinder?.name.includes('Smart Citizen Mobile Production')) {
              baseUrl = 'https://m-public-tfwmlive.smartcitizen.net';
            } else if (window?.setTicketFinder?.name.includes('Smart Citizen Mobile Test')) {
              baseUrl = 'https://m-public-tfwmtest.smartcitizen.net';
            } else if (window?.setTicketFinder?.name.includes('Smart Citizen Desktop Production')) {
              baseUrl = 'https://public-tfwmlive.smartcitizen.net';
            } else if (window?.setTicketFinder?.name.includes('Smart Citizen Desktop Test')) {
              baseUrl = 'https://public-tfwmtest.smartcitizen.net';
            } else if (window?.setTicketFinder?.name.includes('Smart Citizen Desktop Dev')) {
              baseUrl = 'https://public-tfwmdev.smartcitizen.net';
            }
            // console.log('baseurl: ' + baseUrl);
            // eslint-disable-next-line no-unused-vars
            const [host, queryString] = items.buyTicketUrl.split('?');
            const matrixid = queryString
              .replace('https://', '')
              .replace(/[\[\]]/g, '')
              .replace(/[{}]/g, '')
              .replace(/:/g, '=')
              .replace(/'/g, '');
            items.buyTicketUrl = baseUrl + '?' + matrixid;
          }
          // console.log('Final: ' + items.buyTicketUrl);
          return items.buyTicketUrl;
        });

        fbus = vm.postedJSON.allowBus || false;
        ftrain = vm.postedJSON.allowTrain || false;
        fmetro = vm.postedJSON.allowMetro || false;

        if (
          vm.postJSON.allowTrain === true ||
          vm.postJSON.brand === 'nnetwork' ||
          vm.postJSON.brand === 'ntrain'
        ) {
          if (vm.fromStationInfoZone != null) {
            vm.fromZoneNumber = vm.fromStationInfoZone;
          } else if (vm.fromStationInfo != null) {
            vm.fromZoneNumber = vm.fromStationInfo.zone;
          } else {
            vm.fromZoneNumber = null;
          }

          if (vm.toStationInfoZone != null) {
            vm.toZoneNumber = vm.toStationInfoZone;
          } else if (vm.toStationInfo != null) {
            vm.toZoneNumber = vm.toStationInfo.zone;
          } else {
            vm.toZoneNumber = null;
          }

          if (vm.fromZoneNumber === '1') {
            vm.ffromzone = 1;
          } else if (vm.fromZoneNumber === '2') {
            vm.ffromzone = 2;
          } else if (vm.fromZoneNumber === '3') {
            vm.ffromzone = 3;
          } else if (vm.fromZoneNumber === '4') {
            vm.ffromzone = 4;
          } else if (vm.fromZoneNumber === '5') {
            vm.ffromzone = 5;
          } else {
            vm.ffromzone = null;
          }

          if (vm.toZoneNumber === '1') {
            vm.ftozone = 1;
          } else if (vm.toZoneNumber === '2') {
            vm.ftozone = 2;
          } else if (vm.toZoneNumber === '3') {
            vm.ftozone = 3;
          } else if (vm.toZoneNumber === '4') {
            vm.ftozone = 4;
          } else if (vm.toZoneNumber === '5') {
            vm.ftozone = 5;
          } else {
            vm.ftozone = null;
          }

          if (vm.ViaOneZoneNumber === '1') {
            vm.fViaOnezone = 1;
          } else if (vm.ViaOneZoneNumber === '2') {
            vm.fViaOnezone = 2;
          } else if (vm.ViaOneZoneNumber === '3') {
            vm.fViaOnezone = 3;
          } else if (vm.ViaOneZoneNumber === '4') {
            vm.fViaOnezone = 4;
          } else if (vm.ViaOneZoneNumber === '5') {
            vm.fViaOnezone = 5;
          } else {
            vm.fViaOnezone = null;
          }

          if (vm.ViaOneZoneNumber != null) {
            if (vm.ViaOneZoneNumber < vm.fromZoneNumber) {
              vm.ffromzone = vm.ViaOneZoneNumber;
            } else if (vm.ViaOneZoneNumber > vm.toZoneNumber) {
              vm.ftozone = vm.ViaOneZoneNumber;
            }
          }
        }

        if (vm.postJSON.allowTrain === true) {
          vm.exactMatch = [];
          if (vm.fromZoneNumber !== null && vm.toZoneNumber !== null) {
            // exact results won't work if from zone is greater then the to zone so do a check
            if (vm.ffromzone < vm.ftozone) {
              vm.exactMatch = $filter('filter')(response, {
                allowBus: fbus,
                allowTrain: ftrain,
                allowMetro: fmetro,
                railZoneFrom: vm.ffromzone,
                railZoneTo: vm.ftozone
              });
            } else if (vm.ffromzone > vm.ftozone) {
              vm.exactMatch = $filter('filter')(response, {
                allowBus: fbus,
                allowTrain: ftrain,
                allowMetro: fmetro,
                railZoneFrom: vm.ftozone,
                railZoneTo: vm.ffromzone
              });
            } else if (vm.ffromzone === vm.ftozone) {
              vm.exactMatch = $filter('filter')(response, {
                allowBus: fbus,
                allowTrain: ftrain,
                allowMetro: fmetro,
                railZoneFrom: 1,
                railZoneTo: vm.ftozone
              });
            }
          } else {
            vm.exactMatch = $filter('filter')(response, {
              allowBus: fbus,
              allowTrain: ftrain,
              allowMetro: fmetro
            });
          }
        } else if (vm.postJSON.brand === 'nnetwork' || vm.postJSON.brand === 'ntrain') {
          vm.exactMatch = [];
          if (vm.fromZoneNumber !== null && vm.toZoneNumber !== null) {
            // exact results won't work if from zone is greater then the to zone so do a check
            if (vm.ffromzone < vm.ftozone) {
              vm.exactMatch = $filter('filter')(response, {
                railZoneFrom: vm.ffromzone,
                railZoneTo: vm.ftozone
              });
            } else if (vm.ffromzone > vm.ftozone) {
              vm.exactMatch = $filter('filter')(response, {
                railZoneFrom: vm.ftozone,
                railZoneTo: vm.ffromzone
              });
            } else if (vm.ffromzone === vm.ftozone) {
              vm.exactMatch = $filter('filter')(response, {
                railZoneFrom: 1,
                railZoneTo: vm.ftozone
              });
            }
          } else {
            vm.exactMatch = $filter('filter')(response, {});
          }
        } else {
          // console.log("Exact Search without rail");
          vm.postedJSON.stationNames = null; // make sure no stations are included if train not checked.
          vm.exactMatch = $filter('filter')(response, {
            allowBus: fbus,
            allowTrain: ftrain,
            allowMetro: fmetro
          });
        }

        // compare search results and exact search results and display difference
        searchAll = vm.all;
        searchExact = vm.exactMatch;
        // console.log('all results');
        // console.log(searchAll);
        // console.log("search exact results");
        // console.log(vm.exactMatch);

        for (i = 0; i < searchExact.length; i += 1) {
          arrlen = searchAll.length;
          for (j = 0; j < arrlen; j += 1) {
            if (searchExact[i] === searchAll[j]) {
              searchAll = searchAll.slice(0, j).concat(searchAll.slice(j + 1, arrlen));
            }
          }
        }

        vm.otherResults = searchAll;

        bus = vm.postedJSON.allowBus;
        train = vm.postedJSON.allowTrain;
        metro = vm.postedJSON.allowMetro;

        // if 1 or 2 modes selected open up the exclude mode filter
        if (
          bus !== null ||
          (bus !== null && train !== null) ||
          (bus !== null && metro !== null) ||
          (train !== null && metro !== null)
        ) {
          vm.toggleFilter('mode');
        }

        // if all modes selected open up how to buy filter
        if (bus !== null && train !== null && metro !== null) {
          vm.toggleFilter('payment');
        }

        vm.update(); // When feed is loaded run it through the filters
        vm.loadingStatus = 'success';
        // scroll to results
        $location.hash('sbmBtn');
        $anchorScroll();
      });
    }

    function update() {
      let filtered = vm.all;
      let filteredorg = vm.exactMatch;
      let filteredother = vm.otherResults;

      // For each filter in the search filters loop through and delete any that state false, this is so it doesn't explicitly match false and shows everything.
      angular.forEach(vm.searchFilters, function(val, key) {
        // if Key/Property contains 'Allow" and the value is true || if Key/Property doesn't contain 'Allow' and val is false (this is to make sure the opposite/exclude filter values are deleted as the trues will be false and vice versa)
        if (
          (key.indexOf('allow') !== -1 && val) ||
          (val === false && key.indexOf('allow') === -1)
        ) {
          // Delete the filter and value
          delete vm.searchFilters[key];
        }
        // if pre 9.30 is selected
        if (vm.searchFilters.timePeriod1) {
          vm.searchFilters.timePeriod2 = false;
          vm.searchFilters.timePeriod3 = false;
          vm.searchFilters.timePeriod4 = false;
        }
        // if 9.30 - 3.30 is selected
        if (vm.searchFilters.timePeriod2) {
          vm.searchFilters.timePeriod1 = false;
          vm.searchFilters.timePeriod3 = false;
          vm.searchFilters.timePeriod4 = false;
        }
        // if 3.30 - 6 is selected
        if (vm.searchFilters.timePeriod3) {
          vm.searchFilters.timePeriod1 = false;
          vm.searchFilters.timePeriod2 = false;
          vm.searchFilters.timePeriod4 = false;
        }
        // if after 6 is selected
        if (vm.searchFilters.timePeriod4) {
          vm.searchFilters.timePeriod1 = false;
          vm.searchFilters.timePeriod2 = false;
          vm.searchFilters.timePeriod3 = false;
        }
        // if anytime is selected
        if (vm.timePeriodAll === 'yes') {
          // vm.searchFilters.timeLimited = false;
          // vm.searchFilters.timePeriod1 = '';
          vm.searchFilters.timePeriod1 = true;
          vm.searchFilters.timePeriod2 = true;
          vm.searchFilters.timePeriod3 = true;
          vm.searchFilters.timePeriod4 = true;
        }
      });

      // Filter results by the filters selected
      filtered = $filter('filter')(filtered, vm.searchFilters);
      filteredorg = $filter('filter')(filteredorg, vm.searchFilters);
      filteredother = $filter('filter')(filteredother, vm.searchFilters);

      // Sort results by selected option
      vm.filteredTickets = $filter('orderBy')(filtered, vm.orderBy);
      vm.origTickets = $filter('orderBy')(filteredorg, vm.orderBy);
      vm.otherTickets = $filter('orderBy')(filteredother, vm.orderBy);

      // order filtering
      if (vm.orderBy === 'orderSequence') {
        vm.origTickets.sort(function(a, b) {
          // set conditional attributes for refresher
          vm.sortPop = 'yes';
          vm.sortPlw = 'no';
          vm.sortPhl = 'no';
          return b.buyOnDirectDebit - a.buyOnDirectDebit;
        });
      } else if (vm.orderBy === 'ticketCurrentAmount') {
        vm.origTickets.sort(function(a, b) {
          vm.sortPop = 'no';
          vm.sortPlw = 'yes';
          vm.sortPhl = 'no';
          return a.ticketCurrentAmount - b.ticketCurrentAmount;
        });
      } else if (vm.orderBy === '-ticketCurrentAmount') {
        vm.origTickets.sort(function(a, b) {
          vm.sortPop = 'no';
          vm.sortPlw = 'no';
          vm.sortPhl = 'yes';
          return b.ticketCurrentAmount - a.ticketCurrentAmount;
        });
      }

      // console.log("Search Filters:");
      // console.log(vm.searchFilters);
      // console.log("Filtered Tickets:");
      // console.log(vm.filteredTickets);
      // console.log('Original Search:');
      // console.log(vm.origTickets);
      // console.log('Other Results:');
      // console.log(vm.otherTickets);

      vm.updateGrid();
    }

    updateGrid.$inject = ['$timeout', 'angularGridInstance'];
    function updateGrid() {
      $timeout(
        function() {
          $timeout(
            function() {
              let searchURL;
              let urlstring;
              let abus;
              let atrain;
              let ametro;
              let atime;
              let obj;
              if (vm.filteredTickets.length) {
                // set storage url according to search filters
                // set data to be displayed in serializer
                obj = {
                  passengerType: vm.postedJSON.passengerType,
                  timeBand: vm.postedJSON.timeBand,
                  brand: vm.postedJSON.brand,
                  stationNames: vm.postedJSON.stationNames,
                  busTravelArea: vm.searchFilters.busTravelArea,
                  operator: vm.searchFilters.operator,
                  buyOnDirectDebit: vm.searchFilters.buyOnDirectDebit,
                  buyOnDirectPurchase: vm.searchFilters.buyOnDirectPurchase || null,
                  buyOnSwift: vm.searchFilters.buyOnSwift,
                  hasOnlinePurchaseChannel: vm.searchFilters.hasOnlinePurchaseChannel,
                  purchaseTic: vm.searchFilters.purchaseTic,
                  purchaseRailStation: vm.searchFilters.purchaseRailStation,
                  purchasePayzone: vm.searchFilters.purchasePayzone,
                  railZoneFrom: vm.searchFilters.railZoneFrom,
                  railZoneTo: vm.searchFilters.railZoneTo,
                  limit: vm.limit,
                  limitExact: vm.limitExact,
                  excludeBus: vm.searchFilters.allowBus
                };

                urlstring = $httpParamSerializer(obj);

                if (vm.postedJSON.allowBus) {
                  abus = 'allowBus';
                }

                if (vm.postedJSON.allowTrain) {
                  atrain = 'allowTrain';
                }

                if (vm.postedJSON.allowMetro) {
                  ametro = 'allowMetro';
                }

                // work out time of day selection and update searchURL
                if (vm.searchFilters.timePeriod1 === true) {
                  atime = '&timePeriod1=true&timePeriod2=false&timePeriod3=false&timePeriod4=false';
                } else if (vm.searchFilters.timePeriod2 === true) {
                  atime = '&timePeriod1=false&timePeriod2=true&timePeriod3=false&timePeriod4=false';
                } else if (vm.searchFilters.timePeriod3 === true) {
                  atime = '&timePeriod1=false&timePeriod2=false&timePeriod3=true&timePeriod4=false';
                } else if (vm.searchFilters.timePeriod4 === true) {
                  atime = '&timePeriod1=false&timePeriod2=false&timePeriod3=false&timePeriod4=true';
                } else if (vm.timePeriodAll === true) {
                  atime = '&timePeriodAll=true';
                } else {
                  atime = '';
                }

                // bus only
                if (
                  vm.postedJSON.allowBus &&
                  !vm.postedJSON.allowTrain &&
                  !vm.postedJSON.allowMetro
                ) {
                  searchURL = '/?' + abus + '&' + urlstring + atime;
                  // console.log("bus only - " + searchURL);
                  savedFilter.set('url', searchURL);
                }

                // bus and train
                if (
                  vm.postedJSON.allowBus &&
                  vm.postedJSON.allowTrain &&
                  !vm.postedJSON.allowMetro
                ) {
                  searchURL = '/?' + abus + '&' + atrain + '&' + urlstring + atime;
                  // console.log(searchURL);
                  savedFilter.set('url', searchURL);
                }
                // bus and metro
                if (
                  vm.postedJSON.allowBus &&
                  !vm.postedJSON.allowTrain &&
                  vm.postedJSON.allowMetro
                ) {
                  searchURL = '/?' + abus + '&' + ametro + '&' + urlstring + atime;
                  // console.log(searchURL);
                  savedFilter.set('url', searchURL);
                }
                // train only
                if (
                  !vm.postedJSON.allowBus &&
                  vm.postedJSON.allowTrain &&
                  !vm.postedJSON.allowMetro
                ) {
                  searchURL = '/?' + atrain + '&' + urlstring + atime;
                  // console.log(searchURL);
                  savedFilter.set('url', searchURL);
                }
                // train and metro
                if (
                  !vm.postedJSON.allowBus &&
                  vm.postedJSON.allowTrain &&
                  vm.postedJSON.allowMetro
                ) {
                  searchURL = '/?' + atrain + '&' + ametro + '&' + urlstring + atime;
                  // console.log(searchURL);
                  savedFilter.set('url', searchURL);
                }
                // metro only
                if (
                  !vm.postedJSON.allowBus &&
                  !vm.postedJSON.allowTrain &&
                  vm.postedJSON.allowMetro
                ) {
                  searchURL = '/?' + ametro + '&' + urlstring + atime;
                  // console.log(searchURL);
                  savedFilter.set('url', searchURL);
                }
                // all modes selected
                if (
                  vm.postedJSON.allowBus &&
                  vm.postedJSON.allowTrain &&
                  vm.postedJSON.allowMetro
                ) {
                  searchURL = '/?' + abus + '&' + atrain + '&' + ametro + '&' + urlstring + atime;
                  // console.log(searchURL);
                  savedFilter.set('url', searchURL);
                }
                // no modes selected
                if (
                  !vm.postedJSON.allowBus &&
                  !vm.postedJSON.allowTrain &&
                  !vm.postedJSON.allowMetro
                ) {
                  searchURL = '/?' + urlstring + atime;
                  // console.log(searchURL);
                  savedFilter.set('url', searchURL);
                }
                // load.log(searchURL);
              }
            },
            0,
            false
          );
        },
        0,
        false
      );
    }

    // get Out Of County Rail stations for autocomplete
    function getoocStations() {
      ticketingService.getStations().then(function(response) {
        // console.log("out of county stations");
        // console.log(response);
        const OutOfCounty = $filter('filter')(response, {
          outOfCounty: 'true'
        });
        vm.stationoocList = OutOfCounty;
      });
    }

    // get In County Rail stations for autocomplete
    function geticStations() {
      ticketingService.getStations().then(function(response) {
        const inCounty = $filter('filter')(response, { outOfCounty: 'false' });
        vm.stationicList = inCounty;
      });
    }

    // reset search
    function clearFilter() {
      $location.url('').replace();
      defaultVars();
      // clear filter checkboxes
      vm.excludeBusCheck = function() {
        return false;
      };
      vm.excludeTrainCheck = function() {
        return false;
      };
      vm.excludeTramCheck = function() {
        return false;
      };
      vm.buyOnDirectDebitCheck = function() {
        return false;
      };
      vm.buyOnDirectPurchaseCheck = function() {
        return false;
      };
      vm.buyOnSwiftCheck = function() {
        return false;
      };
      vm.hasOnlinePurchaseChannelCheck = function() {
        return false;
      };
      vm.purchaseTicCheck = function() {
        return false;
      };
      vm.purchaseRailStationCheck = function() {
        return false;
      };
      vm.purchasePayzoneCheck = function() {
        return false;
      };
      vm.timePeriod1CheckAll = function() {
        return false;
      };
      vm.timePeriod1Check = function() {
        return false;
      };
      vm.timePeriod2Check = function() {
        return false;
      };
      vm.timePeriod3Check = function() {
        return false;
      };
      vm.timePeriod4Check = function() {
        return false;
      };
      savedFilter.set('url', '');
      vm.postJSON.stationNames = null;
      clearFromStation();
      clearToStation();
      clearViaOneStation();
    }

    // if a pass is selected deselect all modes
    function clearModes() {
      vm.postJSON.allowBus = null;
      vm.postJSON.allowTrain = null;
      vm.postJSON.allowMetro = null;
    }

    // if no stations set in url make sure from station is set to null. This is to fix back function adding [] in from station
    function clearStation() {
      if ($location.search().stationNames === '[]') {
        clearFromStation();
      }
    }

    // clear time selections
    function clearTime() {
      // uncheck time of day checkboxes
      vm.timePeriod1CheckAll = function() {
        return false;
      };
      vm.timePeriod1Check = function() {
        return false;
      };
      vm.timePeriod2Check = function() {
        return false;
      };
      vm.timePeriod3Check = function() {
        return false;
      };
      vm.timePeriod4Check = function() {
        return false;
      };
      // make time selections false to reset default search criteria
      vm.timePeriodAll = false;
      vm.searchFilters.timePeriod1 = false;
      vm.searchFilters.timePeriod2 = false;
      vm.searchFilters.timePeriod3 = false;
      vm.searchFilters.timePeriod4 = false;
      vm.update();
    }

    function checkTimeAll() {
      if (vm.timePeriodAll === 'yes') {
        vm.searchFilters.timePeriod1 = true;
        vm.searchFilters.timePeriod2 = true;
        vm.searchFilters.timePeriod3 = true;
        vm.searchFilters.timePeriod4 = true;

        vm.timePeriod1CheckAll = function() {
          return true;
        };
        vm.timePeriod1Check = function() {
          return false;
        };
        vm.timePeriod2Check = function() {
          return false;
        };
        vm.timePeriod3Check = function() {
          return false;
        };
        vm.timePeriod4Check = function() {
          return false;
        };
      } else if (vm.timePeriodAll === 'no') {
        vm.searchFilters.timePeriod1 = '';
        vm.searchFilters.timePeriod2 = '';
        vm.searchFilters.timePeriod3 = '';
        vm.searchFilters.timePeriod4 = '';
      }
    }

    // disable anytime if another time period is selected
    function checkTime() {
      vm.timePeriodAll = false;
      if (vm.timePeriodAll === false) {
        vm.timePeriod1CheckAll = function() {
          return false;
        };
      }
    }

    // rail stations - at least 2 required for api to work

    // set From Rail Station
    vm.fromEmpty = 'none';

    vm.fromStationInputChanged = function(str) {
      vm.fromStationText = str;
    };

    vm.fromfocusState = 'None';
    vm.fromFocusIn = function() {
      vm.fromfocusState = 'In';
    };
    vm.fromFocusOut = function() {
      vm.fromfocusState = 'Out';

      if (vm.stationToName != null) {
        vm.stationFromReq = true;
      }

      if (vm.fromStationText != null && vm.stationFromName == null) {
        vm.stationFromReq = true;
      }
    };

    vm.stationFromReq = false; // set from station to not required
    vm.stationFromReqOOC = true; // set ooc station to required
    vm.stationFrom = function(selected) {
      if (selected) {
        vm.postJSON.stationNames = [];
        vm.stationFromName = selected.originalObject.name; // set From station
        vm.postJSON.stationNames[0] = selected.originalObject.name;
        vm.stationFromNameZone = selected.originalObject.zone;
        vm.stationFromNameOoc = selected.originalObject.outOfCounty;
        vm.stationFromNameOocZ5 = selected.originalObject.zone5InCounty;
        vm.fromZoneNumber = selected.originalObject.zone;
        vm.fromStationInfoZone = selected.originalObject.zone;
        vm.stationFromReq = false; // set from to required to ensure selection is made from list
        vm.fromEmpty = true;
      } else {
        vm.stationFromName = null;
        vm.postJSON.stationNames[0] = null;
        vm.stationFromReq = false; // set from to required to ensure selection is made from list
        vm.fromEmpty = false;
      }
    };

    // reset from station
    function clearFromStation() {
      $scope.$broadcast('angucomplete-alt:clearInput', 'stationFrom');
      $scope.$broadcast('angucomplete-alt:clearInput', 'stationFromOOC');
      vm.stationFromName = null;
      vm.postJSON.stationNames[0] = null;
      vm.stationFromReq = false; // set from station to not required
      vm.stationFromNameOocZ5 = null; // clear zone 5 in county
      vm.fromStationInfoZone = null;
      vm.fromStationText = null;
    }

    // set To Rail Station
    vm.toEmpty = 'none';

    vm.toStationInputChanged = function(str) {
      vm.toStationText = str;
    };

    vm.tofocusState = 'None';
    vm.toFocusIn = function() {
      vm.tofocusState = 'In';

      if (vm.stationFromName != null) {
        vm.stationToReq = true;
      }
    };
    vm.toFocusOut = function() {
      vm.tofocusState = 'Out';

      if (vm.stationFromName != null) {
        vm.stationToReq = true;
      }

      if (vm.toStationText !== null && vm.stationToName === null) {
        vm.stationToReq = true;
      }
    };

    vm.stationToReq = false; // set to station to not required
    vm.stationToReqOOC = true;
    vm.stationTo = function(selected) {
      if (selected) {
        vm.stationToName = selected.title; // set To Station
        vm.postJSON.stationNames[1] = selected.originalObject.name;
        vm.stationToTitle = selected.originalObject.name;
        vm.stationToNameZone = selected.originalObject.zone;
        vm.stationToNameOoc = selected.originalObject.outOfCounty;
        vm.stationToNameOocZ5 = selected.originalObject.zone5InCounty;
        vm.toZoneNumber = selected.originalObject.zone;
        vm.toStationInfoZone = selected.originalObject.zone;
        vm.stationToReq = false; // set to to required to ensure selection is made from list
        vm.toEmpty = true;
      } else {
        vm.stationToName = null;
        vm.postJSON.stationNames[1] = null;
        vm.stationToTitle = null;
        vm.toEmpty = false;
      }
    };

    // reset to station
    function clearToStation() {
      $scope.$broadcast('angucomplete-alt:clearInput', 'stationTo');
      $scope.$broadcast('angucomplete-alt:clearInput', 'stationTo2');
      $scope.$broadcast('angucomplete-alt:clearInput', 'stationTo3');
      vm.stationToName = '';
      vm.postJSON.stationNames[1] = null;
      vm.stationToReq = false; // set to station to not required
      vm.stationToNameOocZ5 = null; // clear zone 5 in county
      vm.toStationInfoZone = null;
      vm.toStationText = '';
    }

    // via station
    vm.viaOneStationInputChanged = function(str) {
      vm.viaOneStationText = str;
    };

    vm.viaOnefocusState = 'None';
    vm.stationViaOneFocusIn = function() {
      vm.viaOnefocusState = 'In';
    };
    vm.stationViaOneFocusOut = function() {
      vm.viaOnefocusState = 'Out';

      if (vm.stationViaOneName != null) {
        vm.stationviaOneReq = true;
      }

      if (vm.viaOneStationText != null || vm.stationViaOneName == null) {
        vm.stationViaOneReq = true;
        vm.stationToReq = true;
        vm.stationFromReq = true;
      }
    };

    vm.stationViaOne = function(selected) {
      if (selected) {
        vm.stationViaOneName = selected.originalObject.name; // set To Station
        vm.postJSON.stationNames[2] = selected.originalObject.name;
        vm.stationViaOneTitle = selected.originalObject.name;
        vm.stationViaOneNameZone = selected.originalObject.zone;
        vm.stationViaOneNameOoc = selected.originalObject.outOfCounty;
        vm.stationViaOneNameOocZ5 = selected.originalObject.zone5InCounty;
        vm.ViaOneZoneNumber = selected.originalObject.zone;
        vm.ViaOneStationInfoZone = selected.originalObject.zone;
      }
    };

    // show via station if not null
    if (vm.stationViaOneName != null) {
      vm.stationVia = true;
    }

    // reset via one station
    function clearViaOneStation() {
      $scope.$broadcast('angucomplete-alt:clearInput', 'stationViaOne');
      vm.stationViaOneName = null;
      vm.viaOneStationText = null;
      vm.stationViaOneName = null;
      vm.postJSON.stationNames = null;
    }

    // control filters according to url parameters
    // exclude bus
    if (vm.excludebusParameter) {
      // open how to buy filter
      vm.filterButtons.mode = !vm.filterButtons.mode;
      // set search filters to include DD
      vm.searchFilters.allowBus = false;
      // make sure DD is ticked
      vm.excludeBusCheck = function() {
        return true;
      };
    }

    // direct debit
    if (vm.buyOnDirectDebitParameter) {
      // open how to buy filter
      vm.filterButtons.payment = !vm.filterButtons.payment;
      // set search filters to include DD
      vm.searchFilters.buyOnDirectDebit = true;
      // make sure DD is ticked
      vm.buyOnDirectDebitCheck = function() {
        return true;
      };
    }

    // quick buy
    if (vm.buyOnDirectPurchaseParameter) {
      // open how to buy filter
      vm.filterButtons.payment = !vm.filterButtons.payment;
      // set search filters to include quick buy
      vm.searchFilters.buyOnDirectPurchase = true;
      // make sure quick buy is ticked
      vm.buyOnDirectPurchaseCheck = function() {
        return true;
      };
    }

    // buy on swift
    if (vm.buyOnSwiftParameter) {
      // open how to buy filter
      vm.filterButtons.payment = !vm.filterButtons.payment;
      // set search filters to include swift
      vm.searchFilters.buyOnSwift = true;
      // make sure swift is ticked
      vm.buyOnSwiftCheck = function() {
        return true;
      };
    }

    // buy online
    if (vm.hasOnlinePurchaseChannelParameter) {
      // pen how to buy filter
      vm.filterButtons.payment = !vm.filterButtons.payment;
      // set search filters to include buy online
      vm.searchFilters.hasOnlinePurchaseChannel = true;
      // make sure buy online is ticked
      vm.hasOnlinePurchaseChannelCheck = function() {
        return true;
      };
    }

    // buy at tic
    if (vm.purchaseTicParameter) {
      // open how to buy filter
      vm.filterButtons.payment = !vm.filterButtons.payment;
      // set search filters to include buy from tic
      vm.searchFilters.purchaseTic = true;
      // make sure tic is ticked
      vm.purchaseTicCheck = function() {
        return true;
      };
    }

    // buy rail station
    if (vm.purchaseRailStationParameter) {
      // open how to buy filter
      vm.filterButtons.payment = !vm.filterButtons.payment;
      // set search filters to include rail station
      vm.searchFilters.purchaseRailStation = true;
      // make sure rail station is ticked
      vm.purchaseRailStationCheck = function() {
        return true;
      };
    }

    // payzone
    if (vm.purchasePayzoneParameter) {
      // open how to buy filter
      vm.filterButtons.payment = !vm.filterButtons.payment;
      // set search filters to include payzone
      vm.searchFilters.purchasePayzone = true;
      // make sure payzone is ticked
      vm.purchasePayzoneCheck = function() {
        return true;
      };
    }

    // us travel area
    if (vm.busTravelAreaParameter) {
      // open bus area filter
      vm.filterButtons.busTravelAreaBtn = !vm.filterButtons.busTravelAreaBtn;
      // set search filters to include bus area
      vm.searchFilters.busTravelArea = vm.busTravelAreaParameter;
    }

    // us operator
    if (vm.operatorParameter) {
      // open bus operator filter
      vm.filterButtons.operatorBtn = !vm.filterButtons.operatorBtn;
      // set search filters to include bus operator
      vm.searchFilters.operator = vm.operatorParameter;
    }

    // from rail zone
    if (vm.railZoneFromParameter) {
      // open rail zones filter
      vm.filterButtons.railZoneBtn = !vm.filterButtons.railZoneBtn;
      // set search filters to include from rail zone
      vm.searchFilters.railZoneFrom = vm.railZoneFromParameter;
    }

    // to rail zone
    if (vm.railZoneToParameter) {
      // open rail zone filter
      vm.filterButtons.railZoneBtn = !vm.filterButtons.railZoneBtn;
      // set search filters to include to rail zone
      vm.searchFilters.railZoneTo = vm.railZoneToParameter;
    }

    // anytime
    if ($location.search().timePeriodAll === 'true') {
      // update search filters
      vm.searchFilters.timeLimited = false;
      vm.searchFilters.timePeriod1 = '';
      // open time of day filter
      vm.filterButtons.time = !vm.filterButtons.time;
      // set search filters to include timePeriod1
      vm.timePeriodAll = true;
      // make sure payzone is ticked
      vm.timePeriod1CheckAll = function() {
        return true;
      };
    }

    // pre 9.30
    if ($location.search().timePeriod1 === 'true') {
      // open time of day filter
      vm.filterButtons.time = !vm.filterButtons.time;
      // set search filters to include timePeriod1
      vm.searchFilters.timePeriod1 = true;
      // make sure payzone is ticked
      vm.timePeriod1Check = function() {
        return true;
      };
    }

    // 9.30 - 3.30
    if ($location.search().timePeriod2 === 'true') {
      // open time of day filter
      vm.filterButtons.time = !vm.filterButtons.time;
      // set search filters to include timePeriod1
      vm.searchFilters.timePeriod2 = true;
      // make sure payzone is ticked
      vm.timePeriod2Check = function() {
        return true;
      };
    }

    // 3.30 - 6
    if ($location.search().timePeriod3 === 'true') {
      // pen time of day filter
      vm.filterButtons.time = !vm.filterButtons.time;
      // set search filters to include timePeriod1
      vm.searchFilters.timePeriod3 = true;
      // make sure payzone is ticked
      vm.timePeriod3Check = function() {
        return true;
      };
    }

    // after 6
    if ($location.search().timePeriod4 === 'true') {
      // open time of day filter
      vm.filterButtons.time = !vm.filterButtons.time;
      // set search filters to include timePeriod1
      vm.searchFilters.timePeriod4 = true;
      // make sure payzone is ticked
      vm.timePeriod4Check = function() {
        return true;
      };
    }

    // filters
    vm.hideModalFilter = function() {
      vm.modalShownFilter = !vm.modalShownFilter;
    };
    vm.modalShownFilter = false;
    function toggleModalFilter() {
      vm.modalShownFilter = !vm.modalShownFilter;
    }

    // other matches and swift load more button
    function loadMore() {
      vm.limit += 6;
      $location.search('limit', vm.limit);
      vm.updateGrid();
      vm.refreshOther();
    }

    // exact matches load more button
    function loadMoreExact() {
      vm.limitExact += 6;
      $location.search('limitExact', vm.limitExact);
      vm.updateGrid();
      vm.refreshExact();
    }

    // refresh exact results grid
    refreshExact.$inject = ['$timeout', 'angularGridInstance'];
    function refreshExact() {
      angular.element(document).ready(function() {
        $timeout(function() {
          angularGridInstance.origTicketResults.refresh();
        }, 0);
      });
    }

    // refresh other results grid
    refreshOther.$inject = ['$timeout', 'angularGridInstance'];
    function refreshOther() {
      angular.element(document).ready(function() {
        $timeout(function() {
          angularGridInstance.ticketResults.refresh();
        }, 0);
      });
    }

    // toggle filter accordions
    function toggleFilter(type) {
      vm.filterButtons[type] = !vm.filterButtons[type];
    }

    // if pass is swift payg
    function swiftPAYG() {
      vm.passValue = vm.postJSON.brand;
      if (vm.passValue === 'Swift PAYG') {
        // console.log('swift payg');
        vm.isHideCheck = !vm.isHideCheck;
        vm.postJSON.passengerType = null;
        vm.postJSON.timeBand = null;
        vm.postJSON.stationNames = null;
      } else if (
        vm.passValue === 'nbus' ||
        vm.passValue === 'National Express' ||
        vm.passValue === 'Diamond Bus' ||
        vm.passValue === 'Stagecoach' ||
        vm.passValue === 'Swift PAYG' ||
        vm.passValue === 'West Midlands Metro'
      ) {
        // Clear stationNames list if non-rail pass selected
        vm.postJSON.stationNames = null;
      }
    }

    // if pass is swift abt
    function swiftABT() {
      vm.passValue = vm.postJSON.brand;
      if (vm.passValue === 'Swift Go') {
        vm.isHideCheck = !vm.isHideCheck;
        vm.postJSON.timeBand = null;
        vm.postJSON.stationNames = null;
      } else if (
        vm.passValue === 'nbus' ||
        vm.passValue === 'National Express' ||
        vm.passValue === 'Diamond Bus' ||
        vm.passValue === 'Stagecoach' ||
        vm.passValue === 'Swift PAYG' ||
        vm.passValue === 'West Midlands Metro'
      ) {
        // Clear stationNames list if non-rail pass selected
        vm.postJSON.stationNames = null;
      }
    }

    // if brand is ntrain out of county
    function ntrainOOC() {
      vm.passValue = vm.postJSON.brand;

      if (vm.passValue === 'ntrain - Out of County') {
        vm.isHideCheck = !vm.isHideCheck;
        vm.stationFromReqOOC = true; // set from station to required
        vm.stationToReqOOC = true; // set to station to required
        vm.stationFromName = null;
        vm.stationToName = null;
        vm.stationViaOneName = null;
      } else {
        vm.stationFromReqOOC = false; // set from station to not required
        vm.stationToReqOOC = false; // set to station to not required
        if ($location.search().stationNames) {
          // if station names in url assign station vars
          stations = $location.search().stationNames;
          stationSel = stations.toString();
          stationSplit = stationSel.split(',');
          vm.stationFromName = stationSplit['0'];
          vm.stationToName = stationSplit['1'];
          vm.stationViaOneName = stationSplit['2'];
        }
      }
    }

    // get tickets you can buy on swift
    function getSwiftPAYG() {
      ticketingService.getSwiftSearch().then(function(response) {
        vm.swiftPaygIds = [];

        angular.forEach(response, function(item) {
          if (item.swiftCurrentAmount) {
            vm.swiftPaygIds.push(item);
          }
        });
      });
    }

    // if pass is swift abt
    function selectPass() {
      vm.passValue = vm.postJSON.brand;
      if (vm.passValue === '') {
        console.log('select pass');
        vm.clearFilter();
      }
    }

    // set current date to test for ticketFutureDate
    vm.date = new Date();
  }

  // FILTERS

  // filter to replace text
  replace.$inject = [];
  function replace() {
    let regex;
    return function(input, from, to) {
      if (input === undefined) {
        return;
      }
      regex = new RegExp(from, 'g');
      return input.replace(regex, to);
    };
  }
})();
