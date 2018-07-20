(function () {
    'use strict';
    angular
        .module('ticketingApp.Controller', [])
        .controller('TicketingSearchCtrl', ['$timeout', '$filter', '$location', 'ticketingService', 'angularGridInstance',TicketingSearchCtrl])
        .filter('removeHTMLTags', [removeHTMLTags])
        .filter('modeFilter', [modeFilter])
        .directive('initialSearch', [initialSearch])
        .directive('searchResults', [searchResults])
        .directive('filters', [filters])
        .directive('item', ['$timeout', 'angularGridInstance', item])
        .controller('TicketDetailCtrl', ['ticketingService','$routeParams', TicketDetailCtrl
        ])
        .directive('detailDetails', [detailDetails])
        .directive('detailSidebar', [detailSidebar])
        .directive('detailAlternative', [detailAlternative])
        ;
        // CONTROLLER
        function TicketingSearchCtrl($timeout, $filter, $location, ticketingService, angularGridInstance) {
            var vm = this;

            vm.submit = submit; //Function to submit inital search
            vm.clearFilter = clearFilter; //Function to reset filters
            vm.updateGrid = updateGrid; //Function to update results grid
            vm.update = update; //Do filtering logic in controller so sessions can be stored
            vm.loadMore = loadMore; //function to load more results
            vm.filterButtons = {
                "Operator" : [],
                "OperatorLength": 0,
                "BusTravelArea": [],
                "RailZoneFrom": [],
                "RailZoneTo": []
            }; //set an object for the filters show/hide toggle to fall into
            vm.toggleFilter = toggleFilter;

            //Set up the default Vars on page load, and so that they can be reset with 'reset filters' button
            function defaultVars() {
                vm.all = []; //Set results to blank array
                vm.filteredTickets = []; //Define filtered results as blank array
                vm.loadingStatus = ''; //Set results status to blank
                vm.orderBy = "TicketCurrentAmount";
                vm.limit = parseInt($location.search().limit) || 6; //Set paging limit to what's in url or default to 6
                vm.postJSON = {
                    "AllowBus": null,
                    "AllowMetro" : null,
                    "AllowTrain" : null,
                    "PassengerType": '',
                    "Timeband":''

                    // "SwiftSearch": true,
                    // "FirstClass": true,
                    // "BuyOnDirectDebit": true,
                    // "BuyOnDirectPurchase": true,
                    // "BuyOnSwift": true,
                    // "PurchaseOnMetro": true,
                    // "PurchaseNatEx": true,
                    // "PurchasePayzone": true,
                    // "PurchaseRailStation": true,
                    // "PurchaseTic": true,
                    // "PurchaseOnBus": true,
                    // "PassengerType": "Adult",
                    // "BrandId": "43ab38e2-9cb6-e411-842f-0050568f6585",
                    // "Brand": "nbus",
                    // "OperatorId": "84b5d172-9cb6-e411-9265-0050568f6584",
                    // "Operator": "National Express Coventry",
                    // "BusTravelArea": "Coventry",
                    // "StationNames": ["Birmingham New Street", "Wolverhampton", "Alvechurch"]

                }; //Define postJSON default values
                
                vm.postedJSON = {}; //Define the object to hold the initial search criteria
            }

            defaultVars();

            function submit(data){
                vm.loadingStatus = 'loading';
                angular.copy(vm.postJSON, vm.postedJSON); //save initial search variables
                vm.searchFilters = {};//set scope for search filters and reset on every search
                console.log('this is posted');
                console.log(vm.postedJSON);

                ticketingService.ticketSearch(data).then(
                    function(response){
                        vm.all = response;
                        // For each item in the results
                        angular.forEach(vm.all, function(item){
                            // Check the operator and push it to filters
                            if(vm.filterButtons.Operator.indexOf(item.Operator) == -1){
                                vm.filterButtons.Operator.push(item.Operator);
                            }
                            
                            // Check bus area
                            if(vm.filterButtons.BusTravelArea.indexOf(item.BusTravelArea) == -1){
                                vm.filterButtons.BusTravelArea.push(item.BusTravelArea);
                            }

                            // Check bus area
                            if (vm.filterButtons.RailZoneFrom.indexOf(item.RailZoneFrom) == -1) {
                                vm.filterButtons.RailZoneFrom.push(item.RailZoneFrom);
                            }

                            // Check bus area
                            if (vm.filterButtons.RailZoneTo.indexOf(item.RailZoneTo) == -1) {
                                vm.filterButtons.RailZoneTo.push(item.RailZoneTo);
                            }
                        });
                        vm.update(); //When feed is loaded run it through the filters
                        vm.loadingStatus = 'success';
                    }
                )
            }

            function clearFilter() {
                $location.url('').replace();
                defaultVars();
            }

            function updateGrid() {
                $timeout(function () {
                    $timeout(function () {
                        if (vm.filteredTickets.length) {
                            angularGridInstance.ticketResults.refresh();
                            // savedFilter.set("url", $location.url()); //Set local storage with current url for back button
                        }
                    }, 82, false);
                }, 82, false);
            }

            function update() {
                var filtered = vm.all;
                console.log(vm.searchFilters);
                // For each filter in the search filters loop through and delete any that state false, this is so it doesn't explicitly match false and shows everything.
                angular.forEach(vm.searchFilters, function(val, key){
                    // if Key/Property contains 'Allow" and the value is true || if Key/Property doesn't contain 'Allow' and val is false (this is to make sure the oppposite/exclude filter values are deleted as the trues will be falses and vice versa)
                    if((key.indexOf('Allow') !== -1 && val) || (val == false && key.indexOf('Allow') === -1)){
                        // Delete the filter and value
                        delete vm.searchFilters[key];
                    }
                });
                
                

                // Filter results by the filters selected
                filtered = $filter('filter')(filtered, vm.searchFilters);
                

                // Sort results by selected option
                vm.filteredTickets = $filter('orderBy')(filtered, vm.orderBy);
                
                console.log(vm.filteredTickets);
                console.log(vm.searchFilters);

                vm.updateGrid();
            }
            
            function loadMore() {
                vm.limit += 6;
                $location.search('limit', vm.limit);
                vm.updateGrid();
            }

            function toggleFilter(type) {                
                vm.filterButtons[type] = !vm.filterButtons[type];
            }
        }

        // FILTERS
        function removeHTMLTags() {
            return function (text) {
                return text ? String(text).replace(/<[^>]+>/gm, '') : '';
            };
        }

        function modeFilter(){
            return function (items, filters) {
                var arr = [];
                var filters = {};
                
                //for every filter selected
                angular.forEach(filters, function(val, key){
                    console.log(key, val);
                    console.log(item[key]);
                    if(val){
                        
                        // if(angular.equals(item[key], val)){
                        //     arr.push(item);
                        // }
                    }
                })



                //for every item in array
                angular.forEach(items, function(item){

                })
                
                return arr;
            }
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
        function TicketDetailCtrl(ticketingService, $routeParams){
            var vm = this;

            vm.ticketID = $routeParams.ticket; //set Ticket ID to URL parameter

            // Function to get the ticket data with api call
            function initialise(data){
                ticketingService.getTicket(data).then(
                    function(response){
                        vm.all = response;
                        console.log(response);
                    }
                )
            }

            initialise(vm.ticketID); //initialise API to get ticket
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
    
})();