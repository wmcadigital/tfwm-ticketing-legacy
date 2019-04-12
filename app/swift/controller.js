(function () {
    'use strict';
    angular
        .module('ticketingApp.Controller', ["angucomplete-alt"])
        .controller('TicketingSearchCtrl', ['$scope', '$timeout', '$filter', '$location', 'savedFilter', 'ticketingService', 'angularGridInstance', '$httpParamSerializer', TicketingSearchCtrl])
        .filter('removeHTMLTags', [removeHTMLTags])
        .filter('escapeFilter', [escapeFilter])
        .filter('replace', [replace])
        .directive('initialSearch', [initialSearch])
        .directive('searchResults', [searchResults])
        .directive('filters', [filters])
        .directive('filtersMobile', [filtersMobile])
        .directive('item', ['$timeout', 'angularGridInstance', item])
        .controller('TicketDetailCtrl', ['ticketingService', '$interval', 'getURL', '$routeParams', '$scope', '$timeout', TicketDetailCtrl])
        .directive('detailDetails', [detailDetails])
        .directive('detailSidebar', [detailSidebar])
        .directive('detailAlternative', [detailAlternative])
        .directive('detailRelated', ['$timeout', 'angularGridInstance', detailRelated])
        .directive('detailWhere', [detailWhere])
        .directive('operators', [operators])
        .directive('modalDialog', [modalDialog])
        .directive('tabs', [tabs])
        .directive('pane', [pane])
        .directive('tooltip', [tooltip])
        ; 
        
    // CONTROLLER
    
    function TicketingSearchCtrl($scope, $timeout, $filter, $location, savedFilter, ticketingService, angularGridInstance, $httpParamSerializer) {
        var vm = this;
        $scope.assetPath = assetPath;//Assign asset URL. e.g. to CDN location
        $scope.ticketUrl = ticketUrl;//Assign ticket URL. to be used to direct link to tickets such as Swift PAYG
        vm.submit = submit; //Function to submit inital search
        vm.clearFilter = clearFilter; //Function to reset filters
        vm.getStations = getStations; //Function to retreive stations
        vm.getoocStations = getoocStations; //Function to retreive out of county stations
        vm.geticStations = geticStations; //Function to retreive in county stations
        vm.clearFromStation = clearFromStation; //Function to clear from station
        vm.clearToStation = clearToStation; //Function to clear to station
        vm.clearViaOneStation = clearViaOneStation; //Function to clear via one station
        vm.clearStation = clearStation; //Function to clear to from station if not in url - []
        vm.clearTime = clearTime; //Function to clear time selection
        vm.checkTimeAll = checkTimeAll;//Function to check time checkboxes
        vm.checkTime = checkTime;//Function to check time checkboxes
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
        vm.swiftPAYG = swiftPAYG; //Function for hiding fields if Swift PAYG is selected
        vm.ntrainOOC = ntrainOOC; //Function for setting out of county tickets
        vm.toggleModalSwift = toggleModalSwift;
        vm.toggleModalFilter = toggleModalFilter;
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
            vm.orderBy = "orderSequence";
            vm.limit = parseInt($location.search().limit) || 6; //Set paging limit to what's in url or default to 6
            vm.limitExact = parseInt($location.search().limitExact) || 6; //Set paging limit for exact results to what's in url or default to 6
            vm.postJSON = {
                "allowBus": $location.search().allowBus || null,
                "allowMetro": $location.search().allowMetro || null,
                "allowTrain": $location.search().allowTrain || null,
                "passengerType": $location.search().passengerType || '',
                "timeBand": $location.search().timeBand || '',
                "brand": $location.search().brand || null,
                "stationNames": $location.search().stationNames || [[]]
            }; //Define postJSON default values
            vm.stationFromName = null;// Clear Stations
            vm.stationToName = null;
            vm.stationFromTitle = null;
            vm.stationToTitle = null;
            vm.stationFromNameOocZ5 = null;
            vm.stationToNameOocZ5 = null;
            //vm.openFilters = openFilters;
           // vm.closeFilters = closeFilters;
            vm.fromStationInfo = null;

            //url parameters
            //direct debit
            $scope.buyOnDirectDebitParameter = $location.search().buyOnDirectDebit || null;

            //quick buy
            $scope.buyOnDirectPurchaseParameter = $location.search().buyOnDirectPurchase || null;

            //swift
            $scope.buyOnSwiftParameter = $location.search().buyOnSwift || null;

            //buy online
            $scope.hasOnlinePurchaseChannelParameter = $location.search().hasOnlinePurchaseChannel || null;

            //tic
            $scope.purchaseTicParameter = $location.search().purchaseTic || null;

            //rail station
            $scope.purchaseRailStationParameter = $location.search().purchaseRailStation || null;

            //payzone
            $scope.purchasePayzoneParameter = $location.search().purchasePayzone || null;

            //bus travel area
            $scope.busTravelAreaParameter = $location.search().busTravelArea || null;

            //bus operator
            $scope.operatorParameter = $location.search().operator || null;

            //rail from zone
            $scope.railZoneFromParameter = $location.search().railZoneFrom || null;

            //rail to zone
            $scope.railZoneToParameter = $location.search().railZoneTo || null;

            //anytime
            $scope.timePeriodAnytimeParameter = $location.search().timePeriodAll || null;

            //pre 9.30
            $scope.timePeriod1Parameter = $location.search().timePeriod1 || null;

            //9.30 - 3.30
            $scope.timePeriod2Parameter = $location.search().timePeriod2 || null;
            
            //3.30 - 6
            $scope.timePeriod3Parameter = $location.search().timePeriod3 || null;

            //after 6
            $scope.timePeriod4Parameter = $location.search().timePeriod4 || null;

            vm.clearModes = clearModes;
            vm.postedJSON = {}; //Define the object to hold the initial search criteria

            $scope.stationFromReq = false;//set from station to not required
            $scope.stationToReq = false;//set from station to not required
            $scope.stationToReqtwo = false;
            $scope.stationFromOOCReq = true;//if Train OOC pass selected make station required
            $scope.timePeriodAll = true;
            vm.fromZoneNumber = null;
            vm.toZoneNumber = null;
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
            vm.clearStation();
            //Set initial value of from & to stations if in Url
            if ($location.search().stationNames && vm.postJSON.allowTrain === true || vm.postJSON.brand === "nnetwork" || vm.postJSON.brand === "ntrain") {
                if ($location.search().stationNames != '[]') {
                    var stations = $location.search().stationNames;
                    var stationSel = stations.toString();
                    var stationSplit = stationSel.split(',');
                    vm.stationFromName = stationSplit[0];
                    vm.stationToName = stationSplit[1];
                    vm.stationViaOneName = stationSplit[2];
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

        $scope.showDetails = false;

        //if back button pressed or breadcrumb selected. If brand is Swift PAYG make sure relevent tickets are shown
        if($location.search().brand === 'Swift PAYG'){
            getSwiftPAYG();
            swiftPAYG();
        }

         // Get Rail stations for autocomplete
         function getStations() {
            //console.log("get stations");
            ticketingService.getStations().then(
                function (response) {
                    //console.log("rail stations");
                    //console.log(response);
                    vm.stationList = response;
                    //if going direct to page with stations work out zone information
                    if (vm.stationFromName !== null) {
                        var fromRail = vm.stationFromName || null;
                        var toRail = vm.stationToName || null;
                        var ViaOneRail = vm.stationViaOneName || null;
                        var dataFromRail = $filter('filter')(response, {name: fromRail});
                        var dataToRail = $filter('filter')(response, {name: toRail});
                        var dataViaOnRail = $filter('filter')(response, {name: ViaOneRail});
                        var dataFromRailData = dataFromRail[0];
                        var dataToRailData = dataToRail[0];
                        var dataViaOneRailData = dataViaOnRail[0];
                        vm.fromStationInfo = dataFromRailData;
                        vm.toStationInfo = dataToRailData;
                        vm.ViaOneStationInfo = dataViaOneRailData;

                        if (vm.fromStationInfo != null) {
                            vm.fromZoneNumber = vm.fromStationInfo.zone;
                            vm.toZoneNumber = vm.toStationInfo.zone;
                            if(vm.ViaOneStationInfo != null){
                                vm.ViaOneZoneNumber = vm.ViaOneStationInfo.zone;
                            }
                        }
                    }
                }
            );
        }

        function submit(data) {
            //console.log("submit");
            vm.loadingStatus = 'loading';
            angular.copy(vm.postJSON, vm.postedJSON); //save initial search variables

            $location.search({
                allowBus: vm.postedJSON.allowBus,
                allowTrain: vm.postedJSON.allowTrain,
                allowMetro: vm.postedJSON.allowMetro,
                passengerType: vm.postedJSON.passengerType,
                timeBand: vm.postedJSON.timeBand,
                brand: vm.postedJSON.brand,
                stationNames: vm.postedJSON.stationNames,
                buyOnDirectDebit: $scope.buyOnDirectDebitParameter,
                buyOnDirectPurchase: $scope.buyOnDirectPurchaseParameter,
                buyOnSwift: $scope.buyOnSwiftParameter,
                hasOnlinePurchaseChannel: $scope.hasOnlinePurchaseChannelParameter,
                purchaseTic: $scope.purchaseTicParameter,
                purchaseRailStation: $scope.purchaseRailStationParameter,
                purchasePayzone: $scope.purchasePayzoneParameter,
                busTravelArea: $scope.busTravelAreaParameter,
                operator: $scope.operatorParameter,
                railZoneFrom: $scope.railZoneFromParameter,
                railZoneTo: $scope.railZoneToParameter,
                timePeriodAll: $scope.timePeriodAnytimeParameter,
                timePeriod1: $scope.timePeriod1Parameter,
                timePeriod2: $scope.timePeriod2Parameter,
                timePeriod3: $scope.timePeriod3Parameter,
                timePeriod4: $scope.timePeriod4Parameter,
                limit: vm.limit,
                limitExact: vm.limitExact,
            }); //set search url for sharing/tracking

            vm.searchFilters = {};//set scope for search filters and reset on every search

            vm.origFilters = {};//set scope for original search filters and reset on every search
            //console.log('this is posted');
            //console.log(vm.postedJSON);

            //work out all tickets available
            ticketingService.ticketSearch(data).then(
                function (response) {
                    vm.all = response;
                    vm.original = response;
                    // For each item in the results
                    angular.forEach(vm.all, function (item) {
                        // Check the operator and push it to filters
                        if (vm.filterButtons.operator.indexOf(item.operator) === -1) {
                            vm.filterButtons.operator.push(item.operator);
                        }

                        // Check bus area
                        if (vm.filterButtons.busTravelArea.indexOf(item.busTravelArea) === -1) {
                            vm.filterButtons.busTravelArea.push(item.busTravelArea);
                        }

                        // Check rail zone from
                        if (vm.filterButtons.railZoneFrom.indexOf(item.railZoneFrom) === -1) {
                            vm.filterButtons.railZoneFrom.push(item.railZoneFrom);
                        }

                        // Check rail zone to
                        if (vm.filterButtons.railZoneTo.indexOf(item.railZoneTo) === -1) {
                            vm.filterButtons.railZoneTo.push(item.railZoneTo);
                        }
                    });

                    var fbus = vm.postedJSON.allowBus || false;
                    var ftrain = vm.postedJSON.allowTrain || false;
                    var fmetro = vm.postedJSON.allowMetro || false;

                    if (vm.postJSON.allowTrain === true || vm.postJSON.brand === "nnetwork" || vm.postJSON.brand === "ntrain") {
                   
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

                        if (vm.fromZoneNumber == 1) {
                            vm.ffromzone = 1;
                        } else if (vm.fromZoneNumber == 2) {
                            vm.ffromzone = 2;
                        } else if (vm.fromZoneNumber == 3) {
                            vm.ffromzone = 3;
                        } else if (vm.fromZoneNumber == 4) {
                            vm.ffromzone = 4;
                        } else if (vm.fromZoneNumber == 5) {
                            vm.ffromzone = 5;
                        } else {
                            vm.ffromzone = null;
                        }

                        if (vm.toZoneNumber == 1) {
                            vm.ftozone = 1;
                        } else if (vm.toZoneNumber == 2) {
                            vm.ftozone = 2;
                        } else if (vm.toZoneNumber == 3) {
                            vm.ftozone = 3;
                        } else if (vm.toZoneNumber == 4) {
                            vm.ftozone = 4;
                        } else if (vm.toZoneNumber == 5) {
                            vm.ftozone = 5;
                        } else {
                            vm.ftozone = null;
                        }

                        if (vm.ViaOneZoneNumber == 1) {
                            vm.fViaOnezone = 1;
                        } else if (vm.ViaOneZoneNumber == 2) {
                            vm.fViaOnezone = 2;
                        } else if (vm.ViaOneZoneNumber == 3) {
                            vm.fViaOnezone = 3;
                        } else if (vm.ViaOneZoneNumber == 4) {
                            vm.fViaOnezone = 4;
                        } else if (vm.ViaOneZoneNumber == 5) {
                            vm.fViaOnezone = 5;
                        } else {
                            vm.fViaOnezone = null;
                        }

                        if(vm.ViaOneZoneNumber != null){
                            if(vm.ViaOneZoneNumber <  vm.fromZoneNumber){
                                //console.log("via greater then from");
                                vm.ffromzone = vm.ViaOneZoneNumber;
                            }else if(vm.ViaOneZoneNumber > vm.toZoneNumber){
                                //console.log("via greater then to");
                                vm.ftozone = vm.ViaOneZoneNumber;
                            }
                        }
                    }
                    
                    if(vm.postJSON.allowTrain === true){
                        vm.exactMatch = [];
                        if(vm.fromZoneNumber !== null && vm.toZoneNumber !== null){
                            //exact results won't work if from zone is greater then the to zone so do a check
                            if(vm.ffromzone < vm.ftozone){
                                vm.exactMatch = $filter('filter')(response, { allowBus: fbus, allowTrain: ftrain, allowMetro: fmetro, railZoneFrom: vm.ffromzone, railZoneTo: vm.ftozone});
                            }else if (vm.ffromzone > vm.ftozone){
                                vm.exactMatch = $filter('filter')(response, { allowBus: fbus, allowTrain: ftrain, allowMetro: fmetro, railZoneFrom: vm.ftozone, railZoneTo: vm.ffromzone});
                            }else if(vm.ffromzone === vm.ftozone){
                                    vm.exactMatch = $filter('filter')(response, { allowBus: fbus, allowTrain: ftrain, allowMetro: fmetro, railZoneFrom: 1, railZoneTo: vm.ftozone});
                            }
                        }else{
                            vm.exactMatch = $filter('filter')(response, { allowBus: fbus, allowTrain: ftrain, allowMetro: fmetro});
                        }}else if(vm.postJSON.brand === "nnetwork" || vm.postJSON.brand === "ntrain"){
                            vm.exactMatch = [];
                            if(vm.fromZoneNumber !== null && vm.toZoneNumber !== null){
                                //exact results won't work if from zone is greater then the to zone so do a check
                                if(vm.ffromzone < vm.ftozone){
                                    vm.exactMatch = $filter('filter')(response, {railZoneFrom: vm.ffromzone, railZoneTo: vm.ftozone});
                                }else if (vm.ffromzone > vm.ftozone){
                                    vm.exactMatch = $filter('filter')(response, {railZoneFrom: vm.ftozone, railZoneTo: vm.ffromzone});
                                }else if(vm.ffromzone === vm.ftozone){
                                        vm.exactMatch = $filter('filter')(response, {railZoneFrom: 1, railZoneTo: vm.ftozone});
                                }
                            }else{
                                vm.exactMatch = $filter('filter')(response, { });
                            }
                        }else{
                        //console.log("Exact Search without rail");
                        vm.postedJSON.stationNames = null;//make sure no stations are included if train not checked. 
                        vm.exactMatch = $filter('filter')(response, { allowBus: fbus, allowTrain: ftrain, allowMetro: fmetro});
                    }

                    //compare search reults and exact search results and display difference
                    var searchAll = vm.all;
                    var searchExact = vm.exactMatch;
                    //console.log("all results");
                    //console.log(searchAll);
                    //console.log("search exact results");
                    //console.log(vm.exactMatch);

                    for (var i = 0; i < searchExact.length; i++) {
                        var arrlen = searchAll.length;
                        for (var j = 0; j < arrlen; j++) {
                            if (searchExact[i] === searchAll[j]) {
                                searchAll = searchAll.slice(0, j).concat(searchAll.slice(j + 1, arrlen));
                            }
                        }
                    }
                    vm.otherResults = searchAll;

                    var bus = vm.postedJSON.allowBus;
                    var train = vm.postedJSON.allowTrain;
                    var metro = vm.postedJSON.allowMetro;

                    //if 1 or 2 modes selected open up the exclude mode filter
                    if (bus !== null || bus !== null && train !== null || bus !== null && metro !== null || train !== null && metro !== null) {
                        vm.toggleFilter('mode');
                    }

                    //if all modes selected open up how to buy filter
                    if (bus !== null && train !==null && metro !== null) {
                        vm.toggleFilter('payment');
                    }

                    vm.update(); //When feed is loaded run it through the filters
                    vm.loadingStatus = 'success';
                }
            );
        }

        function update() {
            var filtered = vm.all;
            var filteredorg = vm.exactMatch;
            var filteredother = vm.otherResults;

            // For each filter in the search filters loop through and delete any that state false, this is so it doesn't explicitly match false and shows everything.
            angular.forEach(vm.searchFilters, function (val, key) {
                // if Key/Property contains 'Allow" and the value is true || if Key/Property doesn't contain 'Allow' and val is false (this is to make sure the oppposite/exclude filter values are deleted as the trues will be falses and vice versa)
                if ((key.indexOf('allow') !== -1 && val) || (val === false && key.indexOf('allow') === -1)) {
                    // Delete the filter and value
                    delete vm.searchFilters[key];
                }
                //if pre 9.30 is selected
                if (vm.searchFilters.timePeriod1) {
                    console.log("pre 930 test");
                    vm.searchFilters.timePeriod2 = false;
                    vm.searchFilters.timePeriod3 = false;
                    vm.searchFilters.timePeriod4 = false;
                }
                //if 9.30 - 3.30 is selected
                if (vm.searchFilters.timePeriod2) {
                    vm.searchFilters.timePeriod1 = false;
                    vm.searchFilters.timePeriod3 = false;
                    vm.searchFilters.timePeriod4 = false;
                }
                //if 3.30 - 6 is selected
                if (vm.searchFilters.timePeriod3) {
                    vm.searchFilters.timePeriod1 = false;
                    vm.searchFilters.timePeriod2 = false;
                    vm.searchFilters.timePeriod4 = false;
                }
                //if after 6 is selected
                if (vm.searchFilters.timePeriod4) {
                    vm.searchFilters.timePeriod1 = false;
                    vm.searchFilters.timePeriod2 = false;
                    vm.searchFilters.timePeriod3 = false;
                }
                //if anytime is selected
                if (vm.timePeriodAll == 'yes') {
                    console.log("time anytime selected");
                    //vm.searchFilters.timeLimited = false;
                    //vm.searchFilters.timePeriod1 = '';
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

        function updateGrid() {
            //console.log("update Grid");
            $timeout(function () {
                $timeout(function () {
                    if (vm.filteredTickets.length) {
                        if(vm.otherTickets.length){
                            angularGridInstance.origTicketResults.refresh();
                        }

                        if(vm.origTickets.length){
                            angularGridInstance.ticketResults.refresh();
                        }

                        // set storage url according to search filters
                        //set data to be displayed in serializer
                        var obj = {
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
                            limitExact: vm.limitExact
                        };
            
                        var urlstring = $httpParamSerializer(obj);

                        var abus;
                        if(vm.postedJSON.allowBus){
                            abus = "allowBus";
                        }

                        var atrain;
                        if(vm.postedJSON.allowTrain){
                            atrain = "allowTrain";
                        }

                        var ametro;
                        if(vm.postedJSON.allowMetro){
                            ametro = "allowMetro";
                        }

                        //work out time of day selection and update searchURL
                        var atime1;
                        if(vm.searchFilters.timePeriod1 == true){
                            atime1 = "&timePeriod1=true&timePeriod2=false&timePeriod3=false&timePeriod4=false";
                        }else if(vm.searchFilters.timePeriod2 == true){
                            atime1 = "&timePeriod1=false&timePeriod2=true&timePeriod3=false&timePeriod4=false";
                        }else if(vm.searchFilters.timePeriod3 == true){
                            atime1 = "&timePeriod1=false&timePeriod2=false&timePeriod3=true&timePeriod4=false";
                        }else if(vm.searchFilters.timePeriod4 == true){
                            atime1 = "&timePeriod1=false&timePeriod2=false&timePeriod3=false&timePeriod4=true";
                        }else if(vm.timePeriodAll == true){
                            atime1 = "&timePeriodAll=true";
                        }else{
                            atime1 = '';
                        }

                        var searchURL;

                        // bus only
                        if(vm.postedJSON.allowBus && !vm.postedJSON.allowTrain && !vm.postedJSON.allowMetro){
                            searchURL = "/?" + abus + "&" + urlstring + atime1;
                            //console.log("bus only - " + searchURL);
                            savedFilter.set("url", searchURL);
                        }

                         // bus and train
                         if(vm.postedJSON.allowBus && vm.postedJSON.allowTrain && !vm.postedJSON.allowMetro){
                            searchURL = "/?" + abus + "&" + atrain + "&" + urlstring + atime1;
                            //console.log(searchURL);
                            savedFilter.set("url", searchURL);
                        }
                        // bus and metro
                        if(vm.postedJSON.allowBus && !vm.postedJSON.allowTrain && vm.postedJSON.allowMetro){
                            searchURL = "/?" + abus + "&" + ametro + "&" + urlstring + atime1;
                            //console.log(searchURL);
                            savedFilter.set("url", searchURL);
                        }
                        // train only
                        if(!vm.postedJSON.allowBus && vm.postedJSON.allowTrain && !vm.postedJSON.allowMetro){
                            searchURL = "/?" + atrain + "&" + urlstring + atime1;
                            //console.log(searchURL);
                            savedFilter.set("url", searchURL);
                        }
                        // train and metro
                        if(!vm.postedJSON.allowBus && vm.postedJSON.allowTrain && vm.postedJSON.allowMetro){
                            searchURL = "/?" + atrain + "&" + ametro + "&" + urlstring + atime1;
                            //console.log(searchURL);
                            savedFilter.set("url", searchURL);
                        }
                        // metro only
                        if(!vm.postedJSON.allowBus && !vm.postedJSON.allowTrain && vm.postedJSON.allowMetro){
                            searchURL = "/?" + ametro + "&" + urlstring + atime1;
                            //console.log(searchURL);
                            savedFilter.set("url", searchURL);
                        }
                        // all modes selected
                        if(vm.postedJSON.allowBus && vm.postedJSON.allowTrain && vm.postedJSON.allowMetro){
                            searchURL = "/?" + abus + "&" + atrain + "&" + ametro + "&" + urlstring + atime1;
                            //console.log(searchURL);
                            savedFilter.set("url", searchURL);
                        }
                        // no modes selected
                        if(!vm.postedJSON.allowBus && !vm.postedJSON.allowTrain && !vm.postedJSON.allowMetro){
                            searchURL = "/?" + urlstring + atime1;
                            //console.log(searchURL);
                            savedFilter.set("url", searchURL);
                        }
                        //vm.loadingStatus = "success";

                        //console.log(searchURL);
                    }
                }, 0, false);
            }, 0, false);
        }

        // Get Out Of County Rail stations for autocomplete
        function getoocStations() {
            ticketingService.getStations().then(
                function (response) {
                    //console.log("out of county stations");
                    //console.log(response);
                    var OutOfCounty = $filter('filter')(response, { outOfCounty: "true" });
                    vm.stationoocList = OutOfCounty;
                }
            );
        }

        // Get In County Rail stations for autocomplete
        function geticStations() {
            ticketingService.getStations().then(
                function (response) {
                    var inCounty = $filter('filter')(response, { outOfCounty: "false" });
                    vm.stationicList = inCounty;
                }
            );
        }

        // Reset search
        function clearFilter() {
            $location.url('').replace();
            defaultVars();
            //clear filter checkboxes
            $scope.buyOnDirectDebitCheck=function() { return false;};
            $scope.buyOnDirectPurchaseCheck=function() { return false; };
            $scope.buyOnSwiftCheck=function() { return false; };
            $scope.hasOnlinePurchaseChannelCheck=function() { return false; };
            $scope.purchaseTicCheck=function() { return false; };
            $scope.purchaseRailStationCheck=function() { return false; };
            $scope.purchasePayzoneCheck=function() { return false; };
            $scope.timePeriod1CheckAll=function() { return false; };
            $scope.timePeriod1Check=function() { return false; };
            $scope.timePeriod2Check=function() { return false; };
            $scope.timePeriod3Check=function() { return false; };
            $scope.timePeriod4Check=function() { return false; };
            savedFilter.set("url", '');
            clearFromStation();
            clearToStation();
            clearViaOneStation();
        }

        // If a pass is selected deselect all modes
        function clearModes() {
            vm.postJSON.allowBus = null;
            vm.postJSON.allowTrain = null;
            vm.postJSON.allowMetro = null;
        }

         // if no stations set in url make sure from station is set to null. This is to fix back function adding [] in from station
         function clearStation() {
            if ($location.search().stationNames === "[]") {
                clearFromStation();
            }
        }

       

     //tick anytime checkbox on load
    //$scope.timePeriod1CheckAll=function() { 
    //    return true; 
    //};

    //clear time selections
    function clearTime() {
        //uncheck time of day checkboxes
        $scope.timePeriod1CheckAll = function () {
            return false;
        };
        $scope.timePeriod1Check = function () {
            return false;
        };
        $scope.timePeriod2Check = function () {
            return false;
        };
        $scope.timePeriod3Check = function () {
            return false;
        };
        $scope.timePeriod4Check = function () {
            return false;
        };
        //make time selections false to reset default search criteria
        vm.timePeriodAll = false;
        vm.searchFilters.timePeriod1 = false;
        vm.searchFilters.timePeriod2 = false;
        vm.searchFilters.timePeriod3 = false;
        vm.searchFilters.timePeriod4 = false;
        vm.update();
    }

    function checkTimeAll() {
        console.log("qwertyu");
        console.log(vm.timePeriodAll);
        if (vm.timePeriodAll == 'yes') {
            console.log("checktime true");
            vm.searchFilters.timePeriod1 = true;
            vm.searchFilters.timePeriod2 = true;
            vm.searchFilters.timePeriod3 = true;
            vm.searchFilters.timePeriod4 = true;

            $scope.timePeriod1CheckAll = function () {
                return true;
            };
            $scope.timePeriod1Check = function () {
                return false;
            };
            $scope.timePeriod2Check = function () {
                return false;
            };
            $scope.timePeriod3Check = function () {
                return false;
            };
            $scope.timePeriod4Check = function () {
                return false;
            };

        } else if (vm.timePeriodAll == 'no') {
            console.log("checktime false");
            vm.searchFilters.timePeriod1 = '';
            vm.searchFilters.timePeriod2 = '';
            vm.searchFilters.timePeriod3 = '';
            vm.searchFilters.timePeriod4 = '';
        }
    }

    //disable anytime if another time period is selected
    function checkTime() {
        $scope.timePeriodAll = false;
        if($scope.timePeriodAll == false){
            $scope.timePeriod1CheckAll=function() { 
                return false; 
            };
        }
    }

        //rail stations - at least 2 required for api to work
        
        // Set From Rail Station
        $scope.fromEmpty = 'none';

        $scope.fromStationInputChanged = function (str) {
            $scope.fromStationText = str;
        };

        $scope.fromfocusState = 'None';
        $scope.fromFocusIn = function () {
            $scope.fromfocusState = 'In';
            
        };
        $scope.fromFocusOut = function () {
            $scope.fromfocusState = 'Out';

            if(vm.stationToName != null){
                $scope.stationFromReq = true;
            }

            if($scope.fromStationText != null && vm.stationFromName == null){
                $scope.stationFromReq = true;
            }
        };


        $scope.stationFromReq = false;//set from station to not required
        $scope.stationFromReqOOC = true;//set ooc station to required
        $scope.stationFrom = function (selected) {
            if (selected) {
                vm.stationFromName = selected.originalObject.name; //Set From station
                vm.postJSON.stationNames[0] = selected.originalObject.name;
                $scope.stationFromNameZone = selected.originalObject.zone;
                $scope.stationFromNameOoc = selected.originalObject.outOfCounty;
                $scope.stationFromNameOocZ5 = selected.originalObject.zone5InCounty;
                vm.fromZoneNumber = selected.originalObject.zone;
                vm.fromStationInfoZone = selected.originalObject.zone;
                $scope.stationFromReq = false;//set from to required to ensure slection is made from list
                $scope.fromEmpty = true;
            } else {
                vm.stationFromName = null;
                vm.postJSON.stationNames[0] = null;
                $scope.stationFromReq = false;//set from to required to ensure slection is made from list
                $scope.fromEmpty = false;
            }
        };

         // Reset from station
         function clearFromStation() {
            $scope.$broadcast('angucomplete-alt:clearInput', 'stationFrom');
            vm.stationFromName = null;
            vm.postJSON.stationNames = [[]];
            $scope.stationFromReq = false;//set from station to not required
            $scope.stationFromNameOocZ5 = null;//clear zone 5 in county
            vm.fromStationInfoZone = null;
            $scope.fromStationText = null;
        }

        // Set To Rail Station
        $scope.toEmpty = 'none';

        $scope.toStationInputChanged = function (str) {
            $scope.toStationText = str;
        };

        $scope.tofocusState = 'None';
        $scope.toFocusIn = function () {
            $scope.tofocusState = 'In';


            if(vm.stationFromName != null){
                $scope.stationToReq = true;
            }

        };
        $scope.toFocusOut = function () {
            $scope.tofocusState = 'Out';

            if(vm.stationFromName != null){
                $scope.stationToReq = true;
            }

            if($scope.toStationText != null && vm.stationToName == null){
                $scope.stationToReq = true;
            }

        };

        $scope.stationToReq = false;//set to station to not required
        $scope.stationToReqOOC = true;
        $scope.stationTo = function (selected) {
            if (selected) {
                vm.stationToName = selected.originalObject.name; //Set To Station
                vm.postJSON.stationNames[1] = selected.originalObject.name;
                $scope.stationToTitle = selected.originalObject.name;
                $scope.stationToNameZone = selected.originalObject.zone;
                $scope.stationToNameOoc = selected.originalObject.outOfCounty;
                $scope.stationToNameOocZ5 = selected.originalObject.zone5InCounty;
                vm.toZoneNumber = selected.originalObject.zone;
                vm.toStationInfoZone = selected.originalObject.zone;
                $scope.stationToReq = false;//set to to required to ensure slection is made from list
                $scope.toEmpty = true;
            } else {
                vm.stationToName = null;
                vm.postJSON.stationNames[1] = null;
                $scope.stationToTitle = null;
                $scope.toEmpty = false;
              }
        };

         // Reset to station
         function clearToStation() {
            $scope.$broadcast('angucomplete-alt:clearInput', 'stationTo');
            vm.stationToName = null;
            vm.postJSON.stationNames = [[]];
            $scope.stationToReq = false;//set to station to not required
            $scope.stationToNameOocZ5 = null;//clear zone 5 in county
            vm.toStationInfoZone = null;
            $scope.toStationText = null;
        }

        // Via station
        $scope.viaOneStationInputChanged = function (str) {
            $scope.viaOneStationText = str;
        };

        $scope.viaOnefocusState = 'None';
        $scope.stationViaOneFocusIn = function () {
            $scope.viaOnefocusState = 'In';
            
        };
        $scope.stationViaOneFocusOut = function () {
            $scope.viaOnefocusState = 'Out';

            if(vm.stationViaOneName != null){
                $scope.stationviaOneReq = true;
            }

            if($scope.viaOneStationText != null || vm.stationViaOneName == null){
                $scope.stationViaOneReq = true;
                $scope.stationToReq = true;
                $scope.stationFromReq = true;
            }
        };

        $scope.stationViaOne = function (selected) {
            if (selected) {
                vm.stationViaOneName = selected.originalObject.name; //Set To Station
                vm.postJSON.stationNames[2] = selected.originalObject.name;
                $scope.stationViaOneTitle = selected.originalObject.name;
                $scope.stationViaOneNameZone = selected.originalObject.zone;
                $scope.stationViaOneNameOoc = selected.originalObject.outOfCounty;
                $scope.stationViaOneNameOocZ5 = selected.originalObject.zone5InCounty;
                vm.ViaOneZoneNumber = selected.originalObject.zone;
                vm.ViaOneStationInfoZone = selected.originalObject.zone;
            } else {
             
              }
        };

        //show via station if not null
        if(vm.stationViaOneName != null){
            $scope.stationVia = true;
        }

        // Reset via one station
        function clearViaOneStation() {
            $scope.$broadcast('angucomplete-alt:clearInput', 'stationViaOne');
            $scope.stationViaOneName = null;
            $scope.viaOneStationText = null;
            vm.stationViaOneName = null;
            vm.postJSON.stationNames = [[]];
        }

        // control filters according to url parameters
        //direct debit
        if ($scope.buyOnDirectDebitParameter) {
            //open how to buy filter
            vm.filterButtons.payment = !vm.filterButtons.payment;
            //set search filters to include DD
            vm.searchFilters.buyOnDirectDebit = true;
            //Make sure DD is ticked
            $scope.buyOnDirectDebitCheck=function() { 
                return true; 
            };
        }

        //quick buy
        if ($scope.buyOnDirectPurchaseParameter) {
            //open how to buy filter
            vm.filterButtons.payment = !vm.filterButtons.payment;
            //set search filters to include quick buy
            vm.searchFilters.buyOnDirectPurchase = true;
            //Make sure quick buy is ticked
            $scope.buyOnDirectPurchaseCheck=function() { 
                return true; 
            };
        }

        //buy on swift
        if ($scope.buyOnSwiftParameter) {
            //open how to buy filter
            vm.filterButtons.payment = !vm.filterButtons.payment;
            //set search filters to include swift
            vm.searchFilters.buyOnSwift = true;
            //Make sure swift is ticked
            $scope.buyOnSwiftCheck=function() { 
                return true; 
            };
        }

        //buy online
        if ($scope.hasOnlinePurchaseChannelParameter) {
            //open how to buy filter
            vm.filterButtons.payment = !vm.filterButtons.payment;
            //set search filters to include buy online
            vm.searchFilters.hasOnlinePurchaseChannel = true;
            //Make sure buy online is ticked
            $scope.hasOnlinePurchaseChannelCheck=function() { 
                return true; 
            };
        }

        //buy at tic
        if ($scope.purchaseTicParameter) {
            //open how to buy filter
            vm.filterButtons.payment = !vm.filterButtons.payment;
            //set search filters to include buy from tic
            vm.searchFilters.purchaseTic = true;
            //Make sure tic is ticked
            $scope.purchaseTicCheck=function() { 
                return true; 
            };
        }

        //buy rail station
        if ($scope.purchaseRailStationParameter) {
            //open how to buy filter
            vm.filterButtons.payment = !vm.filterButtons.payment;
            //set search filters to include rail station
            vm.searchFilters.purchaseRailStation = true;
            //Make sure rail stationis ticked
            $scope.purchaseRailStationCheck=function() { 
                return true; 
            };
        }

        //payzone
        if ($scope.purchasePayzoneParameter) {
            //open how to buy filter
            vm.filterButtons.payment = !vm.filterButtons.payment;
            //set search filters to include payzone
            vm.searchFilters.purchasePayzone = true;
            //Make sure payzone is ticked
            $scope.purchasePayzoneCheck=function() { 
                return true; 
            };
        }

        //bus travel area
        if ($scope.busTravelAreaParameter) {
            //open bus area filter
            vm.filterButtons.busTravelAreaBtn = !vm.filterButtons.busTravelAreaBtn;
            //set search filters to include bus area
            vm.searchFilters.busTravelArea = $scope.busTravelAreaParameter;
        }

        //bus operator
        if ($scope.operatorParameter) {
            //open bus operator filter
            vm.filterButtons.operatorBtn = !vm.filterButtons.operatorBtn;
            //set search filters to include bus operator
            vm.searchFilters.operator = $scope.operatorParameter;
        }

        //from rail zone
        if ($scope.railZoneFromParameter) {
            //open rail zones filter
            vm.filterButtons.railZoneBtn = !vm.filterButtons.railZoneBtn;
            //set search filters to include from rail zone
            vm.searchFilters.railZoneFrom = $scope.railZoneFromParameter;
        }

        //to rail zone
        if ($scope.railZoneToParameter) {
            //open rail zone filter
            vm.filterButtons.railZoneBtn = !vm.filterButtons.railZoneBtn;
            //set search filters to include to rail zone
            vm.searchFilters.railZoneTo = $scope.railZoneToParameter;
        }

        //anytime
        if ($location.search().timePeriodAll == 'true') {
            //update search filters
            vm.searchFilters.timeLimited = false;
            vm.searchFilters.timePeriod1 = '';
            //open time of day filter
            vm.filterButtons.time = !vm.filterButtons.time;
            //set search filters to include ptimePeriod1
            vm.timePeriodAll = true;
            //Make sure payzone is ticked
            $scope.timePeriod1CheckAll = function () {
                return true;
            };
        }

         //pre 9.30
         if ($location.search().timePeriod1 == 'true') {
            //open time of day filter
            vm.filterButtons.time = !vm.filterButtons.time;
            //set search filters to include ptimePeriod1
            vm.searchFilters.timePeriod1 = true;
            //Make sure payzone is ticked
            $scope.timePeriod1Check=function() { 
                return true; 
            };
        }

        //9.30 - 3.30
        if ($location.search().timePeriod2 == 'true') {
            //open time of day filter
            vm.filterButtons.time = !vm.filterButtons.time;
            //set search filters to include ptimePeriod1
            vm.searchFilters.timePeriod2 = true;
            //Make sure payzone is ticked
            $scope.timePeriod2Check=function() { 
                return true; 
            };
        }

        //3.30 - 6
        if ($location.search().timePeriod3 == 'true') {
            //open time of day filter
            vm.filterButtons.time = !vm.filterButtons.time;
            //set search filters to include ptimePeriod1
            vm.searchFilters.timePeriod3 = true;
            //Make sure payzone is ticked
            $scope.timePeriod3Check=function() { 
                return true; 
            };
        }

        //after 6
        if ($location.search().timePeriod4 == 'true') {
            //open time of day filter
            vm.filterButtons.time = !vm.filterButtons.time;
            //set search filters to include ptimePeriod1
            vm.searchFilters.timePeriod4 = true;
            //Make sure payzone is ticked
            $scope.timePeriod4Check=function() { 
                return true; 
            };
        }

        //toggle swift modal popup
        vm.modalShownSwift = false;
        function toggleModalSwift() {
            vm.modalShownSwift = !vm.modalShownSwift;
        }

         //filters
         vm.hideModalFilter = function () {
            vm.modalShownFilter = !vm.modalShownFilter;
        };
         vm.modalShownFilter = false;
         function toggleModalFilter() {
             vm.modalShownFilter = !vm.modalShownFilter;
         }

        //other matches and swift load more button
        function loadMore() {
            vm.limit += 6;
            $location.search('limit', vm.limit);
            vm.updateGrid();
        }

        //exact matches load more button
        function loadMoreExact() {
            vm.limitExact += 6;
            $location.search('limitExact', vm.limitExact);
            vm.updateGrid();
        }

        //toggle filter accordions
        function toggleFilter(type) {
            vm.filterButtons[type] = !vm.filterButtons[type];
        }

       // function openFilters() {
         //   document.getElementById("filterOverlay").style.display = "block";
       ///}
           
       // function closeFilters() {
       //     document.getElementById("filterOverlay").style.display = "none";
       // }

        //if pass is swift payg
        function swiftPAYG() {
            vm.passValue = vm.postJSON.brand;
            if (vm.passValue === 'Swift PAYG') {
                vm.isHideCheck = !vm.isHideCheck;
                vm.postJSON.passengerType = null;
                vm.postJSON.timeBand = null;
                vm.postJSON.stationNames = [];
            } else { // Clear stationNames list if non-rail pass selected
                if (vm.passValue === 'nbus' || vm.passValue === 'National Express' || vm.passValue === 'Diamond Bus' || vm.passValue === 'Stagecoach' || vm.passValue === 'Swift PAYG' || vm.passValue === 'West Midlands Metro') {
                    vm.postJSON.stationNames = [[]];
                }
            }
        }

        //if brand is ntrain out of county
        function ntrainOOC() {
            vm.passValue = vm.postJSON.brand;
            if (vm.passValue === 'ntrain - Out of County') {
                vm.isHideCheck = !vm.isHideCheck;
                $scope.stationFromReqOOC = true;//set from station to required
                $scope.stationToReqOOC = true;//set to station to required
                vm.stationFromName = null;
                vm.stationToName = null;
                vm.stationViaOneName = null;
            }else{
                $scope.stationFromReqOOC = false;//set from station to not required
                $scope.stationToReqOOC = false;//set to station to not required
                if($location.search().stationNames){//if station names in url assign station vars
                    var stations = $location.search().stationNames;
                    var stationSel = stations.toString();
                    var stationSplit = stationSel.split(',');
                    vm.stationFromName = stationSplit[0];
                    vm.stationToName = stationSplit[1];
                    vm.stationViaOneName = stationSplit[2];
                }
            }
        }

        //get tickets you can buy on swift
        function getSwiftPAYG() {
            ticketingService.getSwiftSearch().then(
                function (response) {
                    vm.swiftPaygTickets = response;
                    //console.log('swift search');
                    //console.log(response);
                }
            );
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

    //escape filter for ticket t&c's
    function escapeFilter() {
        return function (text) {
            return text ? String(text).replace(/\n/gm, '<br><br>') : '';
        };
    }

    //filter to replace text
    function replace() {
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
            templateUrl: assetPath + 'partials/swift/search-results/initial-search.html',
            restrict: 'E'
        };
    }

    function searchResults() {
        return {
            templateUrl: assetPath + 'partials/swift/search-results/search-results.html',
            restrict: 'E'
        };
    }

    function filters() {
        return {
            templateUrl: assetPath + 'partials/swift/search-results/filters.html',
            restrict: 'E'
        };
    }

    function filtersMobile() {
        return {
            templateUrl: assetPath + 'partials/swift/search-results/filters-mobile.html',
            restrict: 'E'
        };
    }

    function item($timeout, angularGridInstance) {
        return {
            templateUrl: assetPath + 'partials/swift/search-results/item.html',
            restrict: 'E',
            //this fixes a bug where the cards weren't loading on initial load in slow loading browsers
            link: function (scope, element, attrs) {
                scope.$$postDigest(function () {
                    // next we wait for the dom to be ready
                    angular.element(document).ready(function () {
                        // finally we apply a timeout with a value
                        // of 0 ms to allow any lingering js threads
                        // to catch up
                        $timeout(function () {
                            // your dom is ready and rendered
                            // if you have an ng-show wrapper
                            // hiding your view from the ugly
                            // render cycle, we can go ahead
                            // and unveil that now:
                            angularGridInstance.ticketResults.refresh();
                            angularGridInstance.origTicketResults.refresh();

                        }, 0)
                    });
                })
            }
        }
    }

    // TICKET DETAIL CONTROLLER
    function TicketDetailCtrl(ticketingService, $interval, getURL, $routeParams, $scope, $timeout) {
        var vm = this;
        $scope.assetPath = assetPath;
        $scope.ticketUrl = ticketUrl;
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
        vm.limit = 4; //Set paging limit for Alt tickets
        vm.openFilters = openFilters;
        vm.closeFilters = closeFilters;

        // Function to get the ticket data with api call
        function initialise(data) {
            ticketingService.getTicket(data).then(
                function (response) {
                    vm.all = response;
                    //console.log(response);
                    if (vm.all.relatedTickets.length) {
                        vm.related = [];
                        angular.forEach(vm.all.relatedTickets, function (item) {
                            ticketingService.getSimpleTicket(item.id).then(
                                function (response) {
                                     vm.relatedTickets[item.id] = response;
                                     vm.relatedList = vm.relatedTickets[item.id];
                                     //push items into a single array
                                     vm.related.push(vm.relatedList);
                                }
                            );
                        }, vm.related);
                    } else {

                    }
                    if (vm.all.documents.length) {
                        ticketingService.getTerms(data).then(
                            function (response) {
                                vm.relatedTerms = response;

                            }
                        );
                    } else {

                    }
                        ticketingService.getOperators().then(
                            function (response) {
                                vm.operatorList = response;
                                //console.log(response);

                            }
                        );
                    backButtonLogic(); //Determine back button logic
                }
            );
        }

        function openFilters() {
            document.getElementById("filterOverlay").style.display = "block";
        }

        function closeFilters() {
            document.getElementById("filterOverlay").style.display = "none";
        }

        function backButtonLogic() {
            vm.backToSearch = getURL; //use session storage
            //console.log(vm.backToSearch);
            $scope.stationFromNameZone = '1';
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

        $timeout(function () {
            vm.loadingStatus = "success";
        }, 0);

    }

    // DIRECTIVES

    function detailDetails() {
        return {
            templateUrl: assetPath + 'partials/swift/detail/details.html',
            restrict: 'E'
        };
    }

    function detailSidebar() {
        return {
            templateUrl: assetPath + 'partials/swift/detail/sidebar.html',
            restrict: 'E'
        };
    }

    function detailAlternative() {
        return {
            templateUrl: assetPath + 'partials/swift/detail/alternative.html',
            restrict: 'E'
        };
    }

    function detailRelated($timeout, angularGridInstance) {
        return {
            templateUrl: assetPath + 'partials/swift/detail/related-product.html',
            restrict: 'E',
            //this fixes a bug where the cards weren't loading on initial load in slow loading browsers
            link: function (scope, element, attrs) {
                scope.$$postDigest(function () {
                    angular.element(document).ready(function () {
                        $timeout(function () {
                            angularGridInstance.alternativeResults.refresh();
                        }, 0)
                    });
                })
            }
        };
    }

    function detailWhere() {
        return {
            templateUrl: assetPath + 'partials/swift/detail/where-can-i-use.html',
            restrict: 'E'
        };
    }

    function operators() { 
        return {
            templateUrl: assetPath + 'partials/swift/detail/operator.html',
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
            template: '<div ng-show="show" class="mod">' +
                '<div ng-show="show" class="modal" ng-click="hideModal()"></div>' +
                '<div class="overlay modal-content {{dialogStyle.class}}" ng-style="dialogStyle">' +
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
                };

                this.addPane = function (pane) {
                    if (panes.length === 0) $scope.select(pane);
                    panes.push(pane);
                };
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
            controller: ["$scope", function ($scope, $element) {
                $scope.isShown = false;
                this.showHover = function () {
                    $scope.isShown = $scope.isShown === true ? false : true;
                };
            }],
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
        };
    }
})();