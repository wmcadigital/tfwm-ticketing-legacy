(function () {
    'use strict';
    angular
        .module('ticketingApp.Controller', ["angucomplete-alt"])
        .controller('TicketingSearchCtrl', ['$scope', '$timeout', '$filter', '$location', 'savedFilter', 'ticketingService', 'angularGridInstance', TicketingSearchCtrl])
        .filter('removeHTMLTags', [removeHTMLTags])
        .filter('modeFilter', [modeFilter])
        .filter('escapeFilter', [escapeFilter])
        .directive('initialSearch', [initialSearch])
        .directive('searchResults', [searchResults])
        .directive('filters', [filters])
        .directive('item', ['$timeout', 'angularGridInstance', item])
        .controller('TicketDetailCtrl', ['ticketingService', '$interval', 'getURL', '$routeParams', TicketDetailCtrl])
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
    function TicketingSearchCtrl($scope, $timeout, $filter, $location, savedFilter, ticketingService, angularGridInstance) {
        var vm = this;

        vm.submit = submit; //Function to submit inital search
        vm.clearFilter = clearFilter; //Function to reset filters
        vm.getStations = getStations; //Function to retreive stations
        vm.getoocStations = getoocStations; //Function to retreive out of county stations
        vm.getSwiftPAYG = getSwiftPAYG; //Function to retreive stations
        vm.updateGrid = updateGrid; //Function to update results grid
        vm.update = update; //Do filtering logic in controller so sessions can be stored
        vm.loadMore = loadMore; //function to load more results
        vm.filterButtons = {
            "Operator": [],
            "OperatorLength": 0,
            "BusTravelArea": [],
            "RailZoneFrom": [],
            "RailZoneTo": []
        }; //set an object for the filters show/hide toggle to fall into
        vm.toggleFilter = toggleFilter;
        vm.swiftPAYG = swiftPAYG; //Function for hiding fields if Swift PAYG is selected
        vm.ntrainOOC = ntrainOOC; //Function for setting out of county tickets
        //Set up the default Vars on page load, and so that they can be reset with 'reset filters' button
        function defaultVars() {
            vm.all = []; //Set results to blank array
            vm.filteredTickets = []; //Define filtered results as blank array
            vm.stationList = []; //Define Station list
            vm.stationoocList = []; //Define out of county Station list
            vm.swiftPaygTickets = []; //Define Swift PAYG tickets
            vm.loadingStatus = ''; //Set results status to blank
            vm.passValue = ''; //Set pass select value to blank
            vm.orderBy = "TicketCurrentAmount";
            vm.limit = parseInt($location.search().limit) || 6; //Set paging limit to what's in url or default to 6
            vm.postJSON = {
                "AllowBus": $location.search().AllowBus || null,
                "AllowMetro": $location.search().AllowMetro || null,
                "AllowTrain": $location.search().AllowTrain || null,
                "PassengerType": $location.search().PassengerType || '',
                "TimeBand": $location.search().TimeBand || '',
                "Brand": $location.search().Brand || null,
                "StationNames": [$location.search().StationNames || [[]]]
                
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

            }; //Define postJSON default values
            vm.clearModes = clearModes;
            vm.postedJSON = {}; //Define the object to hold the initial search criteria
        }

        defaultVars();

        //If location.search contains search criteria force the submit on page load 
        if (
            ($location.search().AllowBus ||
            $location.search().AllowMetro ||
            $location.search().AllowTrain) ||
            ($location.search().Brand) &&
            $location.search().PassengerType &&
            $location.search().TimeBand ||
            $location.search().StationNames
        ) {
            submit(vm.postJSON);
        } else {
            $location.url('').replace();
        }

        //if back button pressed or breadcrumb selected. If brand is Swift PAYG make sure relevent tickets are shown
        if($location.search().Brand == 'Swift PAYG'){
            getSwiftPAYG();
            swiftPAYG();
        }

        function submit(data) {
            vm.loadingStatus = 'loading';
            angular.copy(vm.postJSON, vm.postedJSON); //save initial search variables
            $location.search({
                AllowBus: vm.postedJSON.AllowBus,
                AllowTrain: vm.postedJSON.AllowTrain,
                AllowMetro: vm.postedJSON.AllowMetro,
                PassengerType: vm.postedJSON.PassengerType,
                TimeBand: vm.postedJSON.TimeBand,
                Brand: vm.postedJSON.Brand,
                StationNames: [vm.postedJSON.StationNames],
                limit: vm.limit
            }); //set search url for sharing/tracking
            vm.searchFilters = {};//set scope for search filters and reset on every search
            console.log('this is posted');
            console.log(vm.postedJSON);

            ticketingService.ticketSearch(data).then(
                function (response) {
                    vm.all = response;
                    console.log('ticket search');
                    console.log(response);
                    // For each item in the results
                    angular.forEach(vm.all, function (item) {
                        // Check the operator and push it to filters
                        if (vm.filterButtons.Operator.indexOf(item.Operator) == -1) {
                            vm.filterButtons.Operator.push(item.Operator);
                        }

                        // Check bus area
                        if (vm.filterButtons.BusTravelArea.indexOf(item.BusTravelArea) == -1) {
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

        function getStations() {
            ticketingService.getStations().then(
                function (response) {
                    vm.stationList = response;
                    console.log(response);
                }
            )
        }

        function getoocStations() {
            ticketingService.getStations().then(
                function (response) {
                    var OutOfCounty = $filter('filter')(response, { OutOfCounty: "true" });
                    vm.stationoocList = OutOfCounty;
                    console.log(OutOfCounty);
                }
            )
        }

        function clearFilter() {
            $location.url('').replace();
            defaultVars();
        }

        function clearModes() {
            vm.postJSON.AllowBus = null;
            vm.postJSON.AllowTrain = null;
            vm.postJSON.AllowMetro = null;
            vm.postJSON.StationNames = [];
        }


        $scope.stationFromName = {Name: ''};
        $scope.stationFrom = function(selected) {
          if (selected) {
            $scope.stationFromName = selected.originalObject.Name;
            console.log(selected);
                console.log("From station" + selected.originalObject.Name);
                vm.postJSON.StationNames[0] = selected.originalObject.Name;
          } else {
            $scope.stationFromName = null;
                vm.postJSON.StationNames[0] = null;
          }
        }


        //$scope.stationFrom = function (selected) {
        //    if (selected) {
        //        console.log(selected);
        //        console.log("From station" + selected.originalObject.Name);
        //        vm.postJSON.StationNames[0] = selected.originalObject.Name;
        //    }
        //};

        $scope.stationTo = function (selected) {
            if (selected) {
                console.log(selected);
                vm.postJSON.StationNames[1] = selected.originalObject.Name;
            }
        };

        function updateGrid() {
            $timeout(function () {
                $timeout(function () {
                    if (vm.filteredTickets.length) {
                        angularGridInstance.ticketResults.refresh();
                        savedFilter.set("url", $location.url()); //Set local storage with current url for back button
                    }
                }, 82, false);
            }, 82, false);
        }

        function update() {
            var filtered = vm.all;

            console.log(vm.searchFilters);
            // For each filter in the search filters loop through and delete any that state false, this is so it doesn't explicitly match false and shows everything.
            angular.forEach(vm.searchFilters, function (val, key) {
                // if Key/Property contains 'Allow" and the value is true || if Key/Property doesn't contain 'Allow' and val is false (this is to make sure the oppposite/exclude filter values are deleted as the trues will be falses and vice versa)
                if ((key.indexOf('Allow') !== -1 && val) || (val == false && key.indexOf('Allow') === -1)) {
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

        function swiftPAYG() {
            vm.passValue = vm.postJSON.Brand;

            if (vm.passValue == 'Swift PAYG') {
                vm.isHideCheck = !vm.isHideCheck;
                vm.postJSON.PassengerType = null;
                vm.postJSON.TimeBand = null;
                vm.postJSON.StationNames = [];
            }
        }

        function ntrainOOC() {
            vm.passValue = vm.postJSON.Brand;

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
                console.log(key, val);
                console.log(item[key]);
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
    function TicketDetailCtrl(ticketingService, $interval, getURL, $routeParams) {
        var vm = this;
        vm.loadingText = 'Loading...'; //default loading text
        vm.loadingStatus = 'Loading'; //default loading status
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
        vm.operatorList = []; //Define Operator list
        vm.limit = 4; //Set paging limit for Alt tickets


        // Function to get the ticket data with api call
        function initialise(data) {
            ticketingService.getTicket(data).then(
                function (response) {
                    vm.all = response;
                    console.log(response);
                    if (vm.all.RelatedTickets.length) {
                        angular.forEach(vm.all.RelatedTickets, function (item) {
                            ticketingService.getSimpleTicket(item.Id).then(
                                function (response) {
                                    vm.relatedTickets[item.Id] = response;
                                    console.log(vm.relatedTickets[item.Id]);
                                    vm.loadingStatus = "Success";
                                }
                            )
                        })
                    } else {
                        vm.loadingStatus = "Success";
                    }
                    if (vm.all.Documents.length) {
                        ticketingService.getTerms(data).then(
                            function (response) {
                                vm.relatedTerms = response;
                                vm.loadingStatus = "Success";
                            }
                        )
                    } else {
                        vm.loadingStatus = "Success";
                    }
                        ticketingService.getOperators().then(
                            function (response) {
                                vm.operatorList = response;
                                console.log(response);
                                vm.loadingStatus = "Success";
                            }
                        )
                    backButtonLogic(); //Determine back button logic
                }
            )
        }

        function backButtonLogic() {
            vm.backToSearch = getURL; //use session storage
            console.log(vm.backToSearch);
        }

        initialise(vm.ticketID); //initialise API to get ticket

        function toggleClick(type) {
            vm.filterAccordions[type] = !vm.filterAccordions[type];
        }

        function toggleModal() {
            vm.modalShown = !vm.modalShown;
        }

        function toggleHelp() {
            vm.helpShown = !vm.helpShown;
        }

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
                if (attrs.class)
                    scope.dialogStyle.class = attrs.class;
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
            '</div>'        };
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
            link: function (scope, element, attr, ctrl) {
                element.bind('click', function () {
                    scope.$apply(function () {
                        ctrl.showHover();
                    });
                });
            },
            template: '<div ng-transclude></div>' +
                '<p class="field-help tooltip" ng-class="field-help tooltip" ng-show="isShown">' +
                '<span data-ng-bind-html="features.Description">{{features.Description}}</span>' +
                '</p>'
        }
    }

})();