(function () {
    'use strict';
    angular
        .module('ticketingApp.Controller', ["angucomplete-alt"])
        .controller('TicketingSearchCtrl', ['$scope', '$timeout', '$filter', '$location', 'savedFilter', 'ticketingService', 'angularGridInstance', '$httpParamSerializer', TicketingSearchCtrl])
        .filter('removeHTMLTags', [removeHTMLTags])
        .filter('modeFilter', [modeFilter])
        .filter('escapeFilter', [escapeFilter])
        .filter('replace', [replace])
        .filter('buyOnSwiftPAYG', [buyOnSwiftPAYG])
        .directive('initialSearch', [initialSearch])
        .directive('searchResults', [searchResults])
        .directive('filters', [filters])
        .directive('item', ['$timeout', 'angularGridInstance', item])
        .controller('TicketDetailCtrl', ['ticketingService', '$interval', 'getURL', '$routeParams', '$scope', '$timeout', TicketDetailCtrl])
        .directive('detailDetails', [detailDetails])
        .directive('detailSidebar', [detailSidebar])
        .directive('detailAlternative', [detailAlternative])
        //.directive('detailRelated', [detailRelated])
        .directive('detailRelated', ['$timeout', 'angularGridInstance', detailRelated])
        .directive('operators', [operators])
        .directive('modalDialog', [modalDialog])
        .directive('tabs', [tabs])
        .directive('pane', [pane])
        .directive('tooltip', [tooltip]);   
    // CONTROLLER
    function TicketingSearchCtrl($scope, $timeout, $filter, $location, savedFilter, ticketingService, angularGridInstance, $httpParamSerializer) {
        var vm = this;

        vm.submit = submit; //Function to submit inital search
        vm.clearFilter = clearFilter; //Function to reset filters
        vm.getStations = getStations; //Function to retreive stations
        vm.getoocStations = getoocStations; //Function to retreive out of county stations
        vm.geticStations = geticStations; //Function to retreive in county stations
        vm.clearFromStation = clearFromStation; //Function to clear from station
        vm.clearToStation = clearToStation; //Function to clear to station
        vm.clearStation = clearStation; //Function to clear to from station if not in url - []
        vm.getSwiftPAYG = getSwiftPAYG; //Function to retreive stations
        vm.updateGrid = updateGrid; //Function to update results grid
        vm.update = update; //Do filtering logic in controller so sessions can be stored
        vm.loadMore = loadMore; //function to load more results
        vm.loadMoreExact = loadMoreExact; //function to load more exact results
        vm.filterButtons = {
            "operator": [],
            "operatorLength": 0,
            "busTravelArea": [],
            "railZoneFrom": [],
            "railZoneTo": []
        }; //set an object for the filters show/hide toggle to fall into
        vm.toggleFilter = toggleFilter;
        vm.toggleFilterClose = toggleFilterClose;
        vm.swiftPAYG = swiftPAYG; //Function for hiding fields if Swift PAYG is selected
        vm.ntrainOOC = ntrainOOC; //Function for setting out of county tickets
        vm.toggleModalSwift = toggleModalSwift;
        //Set up the default Vars on page load, and so that they can be reset with 'reset filters' button
        function defaultVars() {
            vm.all = []; //Set results to blank array
            vm.filteredTickets = []; //Define filtered results as blank array
            vm.origTickets = []; //Define original filtered results as blank array
            vm.otherTickets = []; //Define other filtered results as blank array
            vm.stationList = []; //Define Station list
            vm.stationoocList = []; //Define out of county Station list
            vm.stationicList = []; //Define in county Station list
            vm.swiftPaygTickets = []; //Define Swift PAYG tickets
            vm.loadingStatus = ''; //Set results status to blank
            vm.passValue = ''; //Set pass select value to blank
            vm.orderBy = "ticketCurrentAmount";
            vm.limit = parseInt($location.search().limit) || 6; //Set paging limit to what's in url or default to 6
            vm.limitExact = parseInt($location.search().limitExact) || 6; //Set paging limit for exact results to what's in url or default to 6
            vm.postJSON = {
                "allowBus": $location.search().allowBus || null,
                "allowMetro": $location.search().allowMetro || null,
                "allowTrain": $location.search().allowTrain || null,
                "passengerType": $location.search().passengerType || '',
                "timeBand": $location.search().timeBand || '',
                "busTravelArea": $location.search().busTravelArea || null,
                "operator": $location.search().operator || null,
                "brand": $location.search().brand || null,
                "stationNames": $location.search().stationNames || [[]]

                // "swiftSearch": true,
                // "firstClass": true,
                // "buyOnDirectDebit": true,
                // "buyOnDirectPurchase": true,
                // "buyOnSwift": true,
                // "purchaseOnMetro": true,
                // "purchaseNatEx": true,
                // "purchasePayzone": true,
                // "purchaseRailStation": true,
                // "purchaseTic": true,
                // "purchaseOnBus": true,
                // "passengerType": "Adult",
                // "brandId": "43ab38e2-9cb6-e411-842f-0050568f6585",
                // "brand": "nbus",
                // "operatorId": "84b5d172-9cb6-e411-9265-0050568f6584",
                // "operator": "National Express Coventry",
                // "busTravelArea": "Coventry",

            }; //Define postJSON default values
            vm.clearModes = clearModes;
            vm.postedJSON = {}; //Define the object to hold the initial search criteria
        }

        defaultVars();

        //If location.search contains search criteria force the submit on page load
        if (
            ($location.search().allowBus ||
            $location.search().allowMetro ||
            $location.search().allowTrain) ||
            ($location.search().brand) &&
            $location.search().passengerType &&
            $location.search().timeBand ||
            $location.search().busTravelArea ||
            $location.search().operator ||
            $location.search().stationNames ||
            $location.search().brand
        ) {
            submit(vm.postJSON);

        } else {
            $location.url('').replace();
        }

        //if back button pressed or breadcrumb selected. If brand is Swift PAYG make sure relevent tickets are shown
        if($location.search().brand == 'Swift PAYG'){
            getSwiftPAYG();
            swiftPAYG();
        }

        function submit(data) {
            vm.loadingStatus = 'loading';
            angular.copy(vm.postJSON, vm.postedJSON); //save initial search variables

            $location.search({
                allowBus: vm.postedJSON.allowBus,
                allowTrain: vm.postedJSON.allowTrain,
                allowMetro: vm.postedJSON.allowMetro,
                passengerType: vm.postedJSON.passengerType,
                timeBand: vm.postedJSON.timeBand,
                busTravelArea: vm.postedJSON.busTravelArea,
                operator: vm.postedJSON.operator,
                brand: vm.postedJSON.brand,
                stationNames: vm.postedJSON.stationNames,
                limit: vm.limit,
                limitExact: vm.limitExact
            }); //set search url for sharing/tracking

            vm.searchFilters = {};//set scope for search filters and reset on every search
            vm.origFilters = {};//set scope for original search filters and reset on every search
            console.log('this is posted');
            console.log(vm.postedJSON);

            //work out ticket which exactly match search
            ticketingService.ticketSearch(data).then(
                function (response) {
                    vm.all = response;
                    //console.log('Full search');
                    //console.log(response);

                    var fbus = vm.postedJSON.allowBus || false;
                    var ftrain = vm.postedJSON.allowTrain || false;
                    var fmetro = vm.postedJSON.allowMetro || false;
                    var fpassengerType = vm.postedJSON.passengerType || null;

                    vm.exactMatch = $filter('filter')(response, { allowBus: fbus, allowTrain: ftrain, allowMetro: fmetro}, true);

                    //console.log('Exact Matches');
                    //console.log(vm.exactMatch);

                    //compare search reults and exact search results and display difference
                    var searchAll = vm.all;
                    var searchExact = vm.exactMatch;

                    for (var i = 0; i < searchExact.length; i++) {
                        var arrlen = searchAll.length;
                        for (var j = 0; j < arrlen; j++) {
                            if (searchExact[i] == searchAll[j]) {
                                searchAll = searchAll.slice(0, j).concat(searchAll.slice(j + 1, arrlen));
                            }
                        }
                    }
                    //console.log("Array Update");
                    //console.log(searchAll);
                    vm.otherResults = searchAll;
                }
            ),

            //work out all tickets available
            ticketingService.ticketSearch(data).then(
                function (response) {
                    vm.all = response;
                    console.log('ticket search');
                    console.log(response);
                    vm.original = response;
                    // For each item in the results
                    angular.forEach(vm.all, function (item) {
                        // Check the operator and push it to filters
                        if (vm.filterButtons.operator.indexOf(item.operator) == -1) {
                            vm.filterButtons.operator.push(item.operator);
                        }

                        // Check bus area
                        if (vm.filterButtons.busTravelArea.indexOf(item.busTravelArea) == -1) {
                            vm.filterButtons.busTravelArea.push(item.busTravelArea);
                        }

                        // Check rail zone from
                        if (vm.filterButtons.railZoneFrom.indexOf(item.railZoneFrom) == -1) {
                            vm.filterButtons.railZoneFrom.push(item.railZoneFrom);
                        }

                        // Check rail zone to
                        if (vm.filterButtons.railZoneTo.indexOf(item.railZoneTo) == -1) {
                            vm.filterButtons.railZoneTo.push(item.railZoneTo);
                        }
                    });

                    //Set initial value of from & to stations if in Url
                    if ($location.search().stationNames){
                    var stations = $location.search().stationNames;
                    var stationSel = stations.toString();
                    var stationSplit = stationSel.split(',');
                    $scope.stationFromName = stationSplit[0];
                    $scope.stationToName = stationSplit[1];

                    var bus = vm.postedJSON.allowBus;
                    var train = vm.postedJSON.allowTrain;
                    var metro = vm.postedJSON.allowMetro;
                    }

                    //if 1 or 2 modes selected open up the exclude mode filter
                    if (bus != null || bus != null && train != null || bus != null && metro != null || train != null && metro != null) {
                        vm.toggleFilter('mode');
                    }

                    //if all modes selected open up how to buy filter
                    if (bus != null && train != null && metro != null) {
                        vm.toggleFilter('payment');
                    }

                    vm.update(); //When feed is loaded run it through the filters
                    vm.loadingStatus = 'success';

                }
            )
        }

        // Get Rail stations for autocomplete
        function getStations() {
            ticketingService.getStations().then(
                function (response) {
                    //console.log(response);
                    vm.stationList = response;
                }
            )
        }

        // Get Out Of County Rail stations for autocomplete
        function getoocStations() {
            ticketingService.getStations().then(
                function (response) {
                    var OutOfCounty = $filter('filter')(response, { OutOfCounty: "true" });
                    vm.stationoocList = OutOfCounty;
                }
            )
        }

        // Get In County Rail stations for autocomplete
        function geticStations() {
            ticketingService.getStations().then(
                function (response) {
                    var inCounty = $filter('filter')(response, { OutOfCounty: "false" });
                    vm.stationicList = inCounty;
                }
            )
        }

        // Reset search
        function clearFilter() {
            $location.url('').replace();
            defaultVars();
            $scope.stationFromName = null;// Clear Stations
            $scope.stationToName = null;
            $scope.stationFromTitle = null;
            $scope.stationToTitle = null;
            $scope.stationFromNameOocZ5 = null;
            $scope.stationToNameOocZ5 = null;
        }

        // If a pass is selected deselect all modes
        function clearModes() {
            vm.postJSON.allowBus = null;
            vm.postJSON.allowTrain = null;
            vm.postJSON.allowMetro = null;
        }

         // if no stations set in url make sure from station is set to null
         function clearStation() {
            if ($scope.stationFromName == "[]") {
                $scope.stationFromName = null;//set from station to blank if no stations in url
            }
        }

        //rail stations - at least 2 required for api to work

        // Set From Rail Station
        $scope.stationFromName = null;//set from station to blank
        $scope.stationFromReq = false;//set from station to not required
        $scope.stationFrom = function (selected) {
            if (selected) {
                $scope.stationFromName = selected.originalObject.name; //Set From station
                vm.postJSON.stationNames[0] = selected.originalObject.name;
                $scope.stationFromTitle = selected.originalObject.name;
                $scope.stationFromNameZone = selected.originalObject.zone;
                $scope.stationFromNameOoc = selected.originalObject.outOfCounty;
                $scope.stationFromNameOocZ5 = selected.originalObject.zone5InCounty;
                $scope.stationToReq = true;//set to station to required
            } else {
                $scope.stationFromName = null;
                vm.postJSON.stationNames[0] = [[]];
                $scope.stationFromTitle = null;
            }
        }

         // Reset from station
         function clearFromStation() {
            $scope.$broadcast('angucomplete-alt:clearInput', 'stationFrom');
            $scope.stationFromName = null;
            vm.postJSON.stationNames = [[]];
            $scope.stationFromReq = false;//set from station to not required
            $scope.stationFromNameOocZ5 = null;//clear zone 5 in county
        }

        // Set To Rail Station
        $scope.stationToName = null;//set to station to blank
        $scope.stationToReq = false;//set to station to not required
        $scope.stationTo = function (selected) {
            if (selected) {
                $scope.stationToName = selected.originalObject.name; //Set To Station
                vm.postJSON.stationNames[1] = selected.originalObject.name;
                $scope.stationToTitle = selected.originalObject.name;
                $scope.stationToNameZone = selected.originalObject.zone;
                $scope.stationToNameOoc = selected.originalObject.outOfCounty;
                $scope.stationToNameOocZ5 = selected.originalObject.zone5InCounty;
                $scope.stationFromReq = true;//set from station to required
            } else {
                $scope.stationToName = null;
                vm.postJSON.stationNames[1] = [[]];
                $scope.stationToTitle = null;
              }
        };

        // Reset to station
        function clearToStation() {
            $scope.$broadcast('angucomplete-alt:clearInput', 'stationTo');
            $scope.stationToName = null;
            vm.postJSON.stationNames = [[]];
            $scope.stationToReq = false;//set to station to not required
            $scope.stationToNameOocZ5 = null;//clear zone 5 in county
        }

        function updateGrid() {
            $timeout(function () {
                $timeout(function () {
                    if (vm.filteredTickets.length) {
                        angularGridInstance.ticketResults.refresh();
                        angularGridInstance.origTicketResults.refresh();

                        // set storage url according to search filters

                        //set data to bbe displayed in serializer
                        var obj = {
                            passengerType: vm.postedJSON.passengerType,
                            timeBand: vm.postedJSON.timeBand,
                            brand: vm.postedJSON.brand,
                            stationNames: vm.postedJSON.stationNames,
                            busTravelArea: vm.searchFilters.busTravelArea,
                            operator: vm.searchFilters.operator,
                            limit: vm.limit,
                            limitExact: vm.limitExact
                        }
            
                        var urlstring = $httpParamSerializer(obj);

                        var abus;
                        if(vm.postedJSON.allowBus){
                            var abus = "allowBus";
                        }

                        var atrain;
                        if(vm.postedJSON.allowTrain){
                            var atrain = "allowTrain";
                        }

                        var ametro;
                        if(vm.postedJSON.allowMetro){
                            var ametro = "allowMetro";
                        }

                        // bus only
                        if(vm.postedJSON.allowBus && !vm.postedJSON.allowTrain && !vm.postedJSON.allowMetro){
                            var searchURL = "/?" + abus + "&" + urlstring;
                            console.log("bus only - " + searchURL);
                            savedFilter.set("url", searchURL);
                        }
                         // bus and train
                         if(vm.postedJSON.allowBus && vm.postedJSON.allowTrain && !vm.postedJSON.allowMetro){
                            var searchURL = "/?" + abus + "&" + atrain + "&" + urlstring;
                            console.log(searchURL);
                            savedFilter.set("url", searchURL);
                        }
                        // bus and metro
                        if(vm.postedJSON.allowBus && !vm.postedJSON.allowTrain && vm.postedJSON.allowMetro){
                            var searchURL = "/?" + abus + "&" + ametro + "&" + urlstring;
                            console.log(searchURL);
                            savedFilter.set("url", searchURL);
                        }
                        // train only
                        if(!vm.postedJSON.allowBus && vm.postedJSON.allowTrain && !vm.postedJSON.allowMetro){
                            var searchURL = "/?" + atrain + "&" + urlstring;
                            console.log(searchURL);
                            savedFilter.set("url", searchURL);
                        }
                        // train and metro
                        if(!vm.postedJSON.allowBus && vm.postedJSON.allowTrain && vm.postedJSON.allowMetro){
                            var searchURL = "/?" + atrain + "&" + ametro + "&" + urlstring;
                            console.log(searchURL);
                            savedFilter.set("url", searchURL);
                        }
                        // metro only
                        if(!vm.postedJSON.allowBus && !vm.postedJSON.allowTrain && vm.postedJSON.allowMetro){
                            var searchURL = "/?" + ametro + "&" + urlstring;
                            console.log(searchURL);
                            savedFilter.set("url", searchURL);
                        }
                        // all modes selected
                        if(vm.postedJSON.allowBus && vm.postedJSON.allowTrain && vm.postedJSON.allowMetro){
                            var searchURL = "/?" + abus + "&" + atrain + "&" + ametro + "&" + urlstring;
                            console.log(searchURL);
                            savedFilter.set("url", searchURL);
                        }
                        // no modes selected
                        if(!vm.postedJSON.allowBus && !vm.postedJSON.allowTrain && !vm.postedJSON.allowMetro){
                            var searchURL = "/?" + urlstring;
                            console.log(searchURL);
                            savedFilter.set("url", searchURL);
                        }
                        //Set local storage with current url for back button


                        //savedFilter.set("url", "/?" + urlstring);
                        //savedFilter.set("url", $location.url()); //Set local storage with current url for back button
                    }
                }, 82, false);
            }, 82, false);
        }

        function update() {
            var filtered = vm.all;
            var filteredorg = vm.exactMatch;
            var filteredother = vm.otherResults;

            console.log(vm.searchFilters);
            // For each filter in the search filters loop through and delete any that state false, this is so it doesn't explicitly match false and shows everything.
            angular.forEach(vm.searchFilters, function (val, key) {
                // if Key/Property contains 'Allow" and the value is true || if Key/Property doesn't contain 'Allow' and val is false (this is to make sure the oppposite/exclude filter values are deleted as the trues will be falses and vice versa)
                if ((key.indexOf('allow') !== -1 && val) || (val == false && key.indexOf('allow') === -1)) {
                    // Delete the filter and value
                    delete vm.searchFilters[key];
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
            
            //console.log("Search Filters:");
            //console.log(vm.searchFilters);
            //console.log("Fitered Tickets:");
            //console.log(vm.filteredTickets);
            //console.log("Original Search:");
            //console.log(vm.origTickets);
            //console.log("Other Results:");
            //console.log(vm.otherTickets);

            vm.updateGrid();
        }

        //swift
        vm.modalShownSwift = false;
        function toggleModalSwift() {
            vm.modalShownSwift = !vm.modalShownSwift;
        }

        function loadMore() {
            vm.limit += 6;
            $location.search('limit', vm.limit);
            vm.updateGrid();
        }

        function loadMoreExact() {
            vm.limitExact += 6;
            $location.search('limitExact', vm.limitExact);
            vm.updateGrid();
        }

        function toggleFilter(type) {
            vm.filterButtons[type] = !vm.filterButtons[type];
        }

        function toggleFilterClose() {
            $('.filter-title')
            .collapse('hide');
        }

        function swiftPAYG() {
            vm.passValue = vm.postJSON.brand;

            if (vm.passValue == 'Swift PAYG') {
                vm.isHideCheck = !vm.isHideCheck;
                vm.postJSON.passengerType = null;
                vm.postJSON.timeBand = null;
                vm.postJSON.stationNames = [];
            } else { // Clear stationNames list if non-rail pass selected
                if (vm.passValue == 'nbus' || vm.passValue == 'National Express' || vm.passValue == 'Diamond Bus' || vm.passValue == 'Stagecoach' || vm.passValue == 'Swift PAYG' || vm.passValue == 'West Midlands Metro') {
                    vm.postJSON.stationNames = [[]];
                }
            }
        }

        function ntrainOOC() {
            vm.passValue = vm.postJSON.brand;

            if (vm.passValue == 'ntrain - Out of County') {
                vm.isHideCheck = !vm.isHideCheck;

            }
        }

        function getSwiftPAYG() {
            ticketingService.getSwiftSearch().then(
                function (response) {
                    vm.swiftPaygTickets = response;
                    console.log('swift search');
                    console.log(response);
                }
            )
        }

        function save(data) {
            savedFilter.set("stateless", data);
        }

        //set current date to test for ticketFutureDate
        $scope.date = new Date();
    }

    // FILTERS
    function removeHTMLTags() {
        return function (text) {
            return text ? String(text).replace(/<[^>]+>/gm, '') : '';
        };
    }

    function modeFilter() {
        return function (items, filters) {
            var arr = [];
            var filters = {};

            //for every filter selected
            angular.forEach(filters, function (val, key) {
                //console.log(key, val);
                //console.log(item[key]);
                if (val) {

                    // if(angular.equals(item[key], val)){
                    //     arr.push(item);
                    // }
                }
            })

            //for every item in array
            angular.forEach(items, function (item) {

            })

            return arr;
        }
    }

    function escapeFilter() {
        return function (text) {
            return text ? String(text).replace(/\n/gm, '<br><br>') : '';
        };
    }

    function replace() {
        return function (input, from, to) {
            if(input === undefined) {
              return;
            }
            var regex = new RegExp(from, 'g');
            return input.replace(regex, to);
          };
    }

    function buyOnSwiftPAYG() {
        return function (input, from, to) {
            if(input === undefined) {
              return;
            }
            var regex = new RegExp(from, 'g');
            return input.replace(regex, to);
          };
    }

    // DIRECTIVES
    function initialSearch() {
        return {
            templateUrl: 'partials/search-results/initial-search.html',
            restrict: 'E'
        };
    }

    function searchResults() {
        return {
            templateUrl: 'partials/search-results/search-results.html',
            restrict: 'E'
        };
    }

    function filters() {
        return {
            templateUrl: 'partials/search-results/filters.html',
            restrict: 'E'
        };
    }

    function item($timeout, angularGridInstance) {
        return {
            templateUrl: 'partials/search-results/item.html',
            restrict: 'E',
            //this fixes a bug where the cards weren't loading on initial load in slow loading browsers
            link: function (scope, element, attrs) {
                $timeout(function () {
                    if (scope.$last) {
                        angularGridInstance.ticketResults.refresh();
                    }
                }, 0);
            }
        };
    }

    // TICKET DETAIL CONTROLLER
    function TicketDetailCtrl(ticketingService, $interval, getURL, $routeParams, $scope, $timeout) {
        var vm = this;
        vm.loadingText = 'Loading...'; //default loading text
        vm.loadingStatus = 'loading'; //default loading status
        vm.loadingArray = ['Well, what are you waiting for?', 'Are we there yet?', 'Warming up the processors...', 'Reconfiguring the office coffee machine...', 'Doing something useful...', 'Are you ready?', 'So, do you come here often?', 'This may take some time...', 'I know this is painful to watch, but I have to load this.', 'Oh, no! Loading time...', 'Still Waiting... huh', 'Waiting for something in the server.', 'Creating randomly generated feature.', "It's not you. It's me.", 'Eating your internet cookies...Yummy!']; //loading messages
        vm.loading = $interval(function () {
            vm.loadingText = vm.loadingArray[Math.round(Math.random() * (vm.loadingArray.length - 1))];
        }, 3500); //show random loading message based on milliseconds set
        vm.ticketID = $routeParams.ticket; //set Ticket ID to URL parameter
        vm.filterAccordions = {};
        vm.relatedTickets = {};
        vm.toggleClick = toggleClick;
        vm.modalShown = false;
        vm.toggleModal = toggleModal;
        vm.toggleModalBus = toggleModalBus;
        vm.toggleModalTrain = toggleModalTrain;
        vm.toggleModalSwift = toggleModalSwift;
        vm.operatorList = []; //Define Operator list
        vm.checkStations = checkStations;
        vm.limit = 4; //Set paging limit for Alt tickets

        // Function to get the ticket data with api call
        function initialise(data) {
            ticketingService.getTicket(data).then(
                function (response) {
                    vm.all = response;
                    console.log(response);
                    if (vm.all.relatedTickets.length) {
                        angular.forEach(vm.all.relatedTickets, function (item) {
                            ticketingService.getSimpleTicket(item.id).then(
                                function (response) {
                                    vm.relatedTickets[item.id] = response;
                                    //console.log(vm.relatedTickets[item.id]);

                                }
                            )
                        })
                    } else {

                    }
                    if (vm.all.documents.length) {
                        ticketingService.getTerms(data).then(
                            function (response) {
                                vm.relatedTerms = response;

                            }
                        )
                    } else {

                    }
                        ticketingService.getOperators().then(
                            function (response) {
                                vm.operatorList = response;
                                console.log(response);

                            }
                        )
                    backButtonLogic(); //Determine back button logic
                }
            )
        }

        function backButtonLogic() {
            vm.backToSearch = getURL; //use session storage
            console.log(vm.backToSearch);
            $scope.stationFromNameZone = '1';
        }

        function checkStations() {
            console.log("hello" + sessionStorage.getItem(savedData));
        }

        initialise(vm.ticketID); //initialise API to get ticket

        function toggleClick(type) {
            vm.filterAccordions[type] = !vm.filterAccordions[type];
        }

        //popup modals

        //bus
        vm.modalShownBus = false;
        function toggleModalBus() {
            vm.modalShownBus = !vm.modalShownBus;
        }

        //train
        vm.modalShownTrain = false;
        function toggleModalTrain() {
            vm.modalShownTrain = !vm.modalShownTrain;
        }

        //general
        vm.modalShown = false;//hide modal on page load
        function toggleModal() {
            vm.modalShown = !vm.modalShown;
        }

        //swift
        vm.modalShownSwift = false;
        function toggleModalSwift() {
            vm.modalShownSwift = !vm.modalShownSwift;
        }

        function toggleHelp() {
            vm.helpShown = !vm.helpShown;
        }

        $timeout(function () {
            vm.loadingStatus = "success";
        }, 2000);

    }

    // DIRECTIVES

    function detailDetails() {
        return {
            templateUrl: 'partials/detail/details.html',
            restrict: 'E'
        };
    }

    function detailSidebar() {
        return {
            templateUrl: 'partials/detail/sidebar.html',
            restrict: 'E'
        };
    }

    function detailAlternative() {
        return {
            templateUrl: 'partials/detail/alternative.html',
            restrict: 'E'
        };
    }

    function detailRelated($timeout, angularGridInstance) {
        return {
            templateUrl: 'partials/detail/related-product.html',
            restrict: 'E',
            //this fixes a bug where the cards weren't loading on initial load in slow loading browsers
            link: function (scope, element, attrs) {
                $timeout(function () {
                    if (scope.$last) {
                        angularGridInstance.alternativeResults.refresh();
                    }
                }, 0);
            }
        };
    }

    function operators() {
        return {
            templateUrl: 'partials/detail/operator.html',
            restrict: 'E'
        };
    }

    function modalDialog() {
        return {
            restrict: 'E',
            scope: {
                show: '='
            },
            replace: true, // Replace with the template below
            transclude: true, // we want to insert custom content inside the directive
            link: function (scope, element, attrs) {
                scope.dialogStyle = {};
                if (attrs.width)
                    scope.dialogStyle.width = attrs.width;
                if (attrs.height)
                    scope.dialogStyle.height = attrs.height;
                if (attrs.modalclass)
                    scope.dialogStyle.class = attrs.modalclass;
                scope.hideModal = function () {
                    scope.show = false;
                };
            },
            template: '<div ng-show="show">' +
                '<div ng-show="show" class="modal" ng-click="hideModal()"></div>' +
                '<div class="ng-modal-dialog boxin modal-content {{dialogStyle.class}}" ng-style="dialogStyle">' +
                '<div class="ng-modal-close modal__close js-modal-close" ng-click="hideModal()">X</div>' +
                '<div class="ng-modal-dialog-content" ng-transclude></div>' +
                '</div>' +
                '</div>'
        };
    }

    function tabs() {
        return {
            restrict: 'E',
            transclude: true,
            scope: {},
            controller: ["$scope", function ($scope) {
                var panes = $scope.panes = [];

                $scope.select = function (pane) {
                    angular.forEach(panes, function (pane) {
                        pane.selected = false;
                    });
                    pane.selected = true;
                }

                this.addPane = function (pane) {
                    if (panes.length == 0) $scope.select(pane);
                    panes.push(pane);
                }
            }],
            template:
                '<div class="cfx">' +
                '<div class="arrdep-filters__toggle">' +
                '<div class="radio-bar">' +
                '<span ng-repeat="pane in panes" ng-class="{active:pane.selected}">' +
                '<input name="option" id="{{pane.title}}" type="radio">' +
                '<label ng-click="select(pane)" for="{{pane.title}}" style="height: 44px;">{{pane.title}}</label>' +
                '</span>' +
                '</div>' +
                '</div>' +
                '<div class="tab-content" ng-transclude></div>' +
                '</div>',
            replace: true
        };
    }

    function pane() {
        return {
            require: '^tabs',
            restrict: 'E',
            transclude: true,
            scope: { title: '@' },
            link: function (scope, element, attrs, tabsCtrl) {
                tabsCtrl.addPane(scope);
            },
            template:
                '<div class="tab-pane" ng-class="{active: selected}" ng-transclude>' +
                '</div>',
            replace: true
        };
    }

    function tooltip() {
        return {
            restrict: 'A',
            controller: function ($scope, $element) {
                $scope.isShown = false;
                this.showHover = function () {
                    $scope.isShown = $scope.isShown == true ? false : true;
                }
            },
            transclude: true,
            link: function (scope, element, attrs, ctrl) {
                scope.copy = attrs.tooltipc;
                element.bind('click', function () {
                    scope.$apply(function () {
                        ctrl.showHover();
                    });
                });
            },
            template: '<div ng-transclude></div>' +
                '<p class="field-help tooltip" ng-show="isShown">' +
                '<span class="close modal__close"></span>' +
                '<span data-ng-bind-html="copy"></span>' +
                '</p>'
        }
    }

})();
