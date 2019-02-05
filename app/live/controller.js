(function () {
    'use strict';
    angular
        .module('timetablesApp.timetablesCtrl', [])
        .controller('TimetablesListingCtrl', ['$http', '$interval', '$location', '$window', '$filter', 'filterFilter', 'savedFilter', 'timetablesService', 'angularGridInstance', '$timeout', 'updatePageView', timetablesListingCtrl])
        // .filter('customFilter', '$filter', customFilter)
        .filter('timetableURL', [timetableURL])
        .directive('initialSearch', [initialSearch])
        .directive('searchResults', [searchResults])
        .directive('item', ['$timeout', 'angularGridInstance', item])
        .controller('TimetableCtrl', ['$http', '$routeParams', '$location', 'timetablesService', 'getUnique', 'getURL', '$interval', '$filter', '$timeout', '$window', 'updatePageView', timetableCtrl])
        .directive('topSection', [topSection])
        .directive('route', [route])
        .directive('sideBar', [sideBar])
        .directive('sidebarScroll', ['$window', '$timeout', sidebarScroll])
        .directive('scrollTop', [scrollTop])
        ;

    // CONTROLLERS
    // News Listing Controller
    function timetablesListingCtrl($http, $interval, $location, $window, $filter, filterFilter, savedFilter, timetablesService, angularGridInstance, $timeout, updatePageView) {
        var vm = this;

        vm.noResults = '<h4>Oops! Sorry, no results found.</h4>Please enter your service number again, or why not try our <a class="btn-link" href="https://journeyplanner.networkwestmidlands.com/">Journey Planner</a>?<br/><br/>';
        vm.clearFilter = clearFilter; //Function to reset filters
        vm.updateGrid = updateGrid; //Function to update results grid
        vm.update = update; //Do filtering logic in controller so sessions can be stored
        vm.submit = submit; //Function to submit inital search
        vm.trainSubmit = trainSubmit;
        vm.loadMore = loadMore; //function to load more results
        vm.save = save;

        //Set up the default Vars on page load, and so that they can be reset with 'reset filters' button
        function defaultVars() {
            vm.all = []; //Set results to blank array
            vm.filteredTimetables = []; //Define filtered results as blank array
            vm.timetablesStatus = ''; //Set results status to blank
            vm.modes = ''; //Declare modes as empty string
            vm.limit = parseInt($location.search().limit) || 6; //Set paging limit to what's in url or default to 6
            vm.postJSON = {
                "SearchString": '',
                "Modes": []
            }; //Define postJSON default values
            vm.postedJSON = {};
            vm.query = {
                Service: {
                    OperatorName: 'All'
                }
            }; //By default, the bus query defaults to All
            vm.update();
        }
        defaultVars(); //Call in the default variables

        //If location.search contains search criteria force the submit on page load 
        if (($location.search().mode == 'Bus' && $location.search().serviceNo) || ($location.search().mode == 'Tram' && $location.search().serviceNo == 'MM1')) {
            vm.postJSON.SearchString = $location.search().serviceNo;
            vm.modes = $location.search().mode;
            submit(vm.postJSON);
        } else if ($location.search().mode == 'Train') {
            vm.modes = $location.search().mode;
            trainSubmit();
        } else {
            $location.url('').replace();
        }

        function submit(data) {
            vm.timetablesStatus = 'Loading';
            vm.query = {
                Service: {
                    OperatorName: 'All'
                }
            }; //By default, the bus query defaults to All
            vm.postJSON.Modes = [vm.modes]; //push vm.modes into PostJSON
            $location.search({
                mode: vm.postJSON.Modes,
                serviceNo: vm.postJSON.SearchString,
                limit: vm.limit
            }); //set search url for sharing/tracking
            angular.copy(vm.postJSON, vm.postedJSON); //save initial search variables

            timetablesService.getAllTimetables(data).then(
                function (response) {
                    vm.all = response;
                    vm.update(); //When feed is loaded run it through the filters
                    vm.operators = ['All'];
                    angular.forEach(vm.all, function (item) {
                        if (vm.operators.indexOf(item.Service.OperatorName) === -1) {
                            vm.operators.push(item.Service.OperatorName);
                        }
                    });
                    updatePageView.update();//update google analytics page view
                    vm.timetablesStatus = 'Success';
                }
            );
        }

        function trainSubmit() {
            vm.timetablesStatus = 'Success';
            vm.postJSON.Modes = [vm.modes]; //push vm.modes into PostJSON
            $location.search({
                mode: vm.modes
            });
            angular.copy(vm.postJSON, vm.postedJSON); //save initial search variables
            updatePageView.update();//update google analytics page view

            // timetablesService.getTrainTimetables().then(
            //     function(response){
            //         response = angular.element(response);
            //         vm.trainTimes = response[3].children[2].innerText;
            //         vm.timetablesStatus = 'Success';
            //     }
            // );
        }

        function clearFilter() {
            $location.url('').replace();
            defaultVars();
        }

        function updateGrid() {
            $timeout(function () {
                if (vm.filteredTimetables.length) {
                    angularGridInstance.timetableResults.refresh();
                    savedFilter.set("url", $location.url()); //Set local storage with current url for back button
                }
            }, 0, false);
        }

        function update(data) {
            var filtered;
            if (vm.query.Service.OperatorName != 'All' && vm.modes == 'Bus') {
                filtered = $filter('filter')(vm.all, vm.query);
            } else {
                filtered = vm.all;
            }
            vm.filteredTimetables = vm.filteredTimetables = $filter('orderBy')(filtered, 'Service.ServiceNumber');
            vm.updateGrid();
        }

        function loadMore() {
            vm.limit += 6;
            $location.search('limit', vm.limit);
            vm.updateGrid();
        }

        function save(data) {
            savedFilter.set("stateless", data);
        }
    }
    // END CONTROLLER

    // FILTERS
    function timetableURL() {
        return function (value) {
            value = window.encodeURIComponent(value).replace(/%26/g, '_').replace(/%2F/g, '_').replace(/%2C/g, '_').replace(/%3A/g, '_').replace(/%40/g, '_');
            return value;
        };
    }

    // DIRECTIVES
    function initialSearch() {
        return {
            templateUrl: '//static.centro.org.uk/nwmAssets/apps/timetables/partials/search-results/initial-search.html',
            restrict: 'E'
        };
    }

    function searchResults() {
        return {
            templateUrl: '//static.centro.org.uk/nwmAssets/apps/timetables/partials/search-results/search-results.html',
            restrict: 'E'
        };
    }

    function item($timeout, angularGridInstance) {
        return {
            templateUrl: '//static.centro.org.uk/Staging/nwmAssets/apps/timetables/partials/search-results/item.html',
            restrict: 'E',
            //this fixes a bug where the cards weren't loading on initial load in slow loading browsers
            link: function (scope, element, attrs) {
                $timeout(function () {
                    if (scope.$last) {
                        angularGridInstance.timetableResults.refresh();
                    }
                }, 0);
            }
        };
    }

    function timetableCtrl($http, $routeParams, $location, timetablesService, getUnique, getURL, $interval, $filter, $timeout, $window, updatePageView) {
        var vm = this;

        vm.ttID = $routeParams.ttID;
        vm.loadingText = 'Loading...'; //default loading text
        vm.loadingStatus = 'Loading'; //default loading status
        vm.loadingArray = ['Well, what are you waiting for?', 'Are we there yet?', 'Warming up the processors...', 'Reconfiguring the office coffee machine...', 'Doing something useful...', 'Are you ready?', 'So, do you come here often?', 'This may take some time...', 'I know this is painful to watch, but I have to load this.', 'Oh, no! Loading time...', 'Still Waiting... huh', 'Waiting for something in the server.', 'Creating randomly generated feature.', "It's not you. It's me.", 'Eating your internet cookies...Yummy!']; //loading messages
        vm.loading = $interval(function () {
            vm.loadingText = vm.loadingArray[Math.round(Math.random() * (vm.loadingArray.length - 1))];
        }, 3500); //show random loading message based on milliseconds set
        vm.color = ''; //set color to blank string
        vm.updateURL = updateURL;
        vm.changeDir = changeDir;
        vm.activateTTRoute = activateTTRoute;
        vm.versionChange = versionChange;
        vm.otherVersions = [{
            label: 'Select Version',
            version: '',
            stateless: ''
        }]; //Set up array for other timetable Versions
        vm.versionSelect = {
            label: 'Select Version',
            version: '',
            stateless: ''
        }; //Set default version to this

        vm.mapStatus = 'View';
        vm.map = map;

        activateTTHeaders(); //active the Timetable headers

        function activateTTHeaders() {
            timetablesService.getTTHeaders($routeParams.ttID + '/' + $routeParams.version).then(
                function (response) {
                    if (response) { //if data comes back
                        vm.detail = response;
                        // For each version of the timetable populate the array with the needed data
                        angular.forEach(vm.detail.OtherVersions, function (item) {
                            if (vm.otherVersions.indexOf(item.Version) === -1) {
                                vm.otherVersions.push({
                                    label: item.ValidityString == 'Current' ? 'Up to date' : item.ValidityString,
                                    version: item.Version,
                                    stateless: item.Stateless
                                });
                            }
                        });
                        vm.currentVersion = $filter('filter')(vm.otherVersions, {label: "Up to date"})[0]; //Set current version to this variable, so the "current version" link in top section can be populated
                        // Get the timetable days from outbound or inbound(whichever exists) also check url to see if a valid value is there, if so use that.
                        if (response.OutboundTimetables !== null && response.InboundTimetables !== null) {
                            //if location search exists && is equal out/inbound use it, else default to outbound
                            vm.direction = $location.search().direction && ['Outbound', 'Inbound'].indexOf($location.search().direction) > -1 ? $location.search().direction : 'Outbound';
                        } else if (response.OutboundTimetables !== null) {
                            // If just outbound exists then the timetable
                            vm.direction = $location.search().direction === "Outbound" ? $location.search().direction : "Outbound";
                        } else {
                            // If just inbound exists then the timetable
                            vm.direction = $location.search().direction === "Inbound" ? $location.search().direction : "Inbound";
                        }
                        document.title = 'Route: ' + response.BaseRoute.ServiceNumber + ' - ' + response[vm.direction + 'Timetables'].RouteDescription + ' - Network West Midlands';
                        // For each composite of the timetable populate the array with the needed data
                        angular.forEach(vm.detail.CompositeRoutes, function (item) {
                            item.LineNameOutbound = item.LineName.replace('*', 'H');
                            item.LineNameInbound = item.LineName.replace('*', 'R');
                        });
                        getDirTimetable();
                        //if 'when' is defined in the URL then check the data object to see if it matches a valid value
                        if ($location.search().when) {
                            for (var i in vm.getDate) {
                                if (vm.getDate[i].IdValue == $location.search().when) { //if it matches then set when var to the url / also pull out the correct notes
                                    vm.when = $location.search().when;
                                }
                            }
                        }
                        determineColour(); //get the right colour for borders etc.
                        backButtonLogic(); //Determine back button logic
                        activateTTRoute(); //populate the route with new API
                    } else {
                        vm.loadingStatus = 'Error';
                    }
                }
            );

            function determineColour() {
                if (vm.detail.TransportMode === 2 || vm.detail.TransportMode == 4) {
                    vm.color = 'pink'; //if tram then color pink
                    vm.icon = "//static.centro.org.uk/img/nwm/modes/metro.png";
                } else {
                    vm.color = 'orange'; //if bus then color orange
                    vm.icon = "//static.centro.org.uk/img/nwm/modes/bus.png";
                }
            }

            function backButtonLogic() {
                if (getUnique !== null && getUnique.replace('%20', ' ') == $routeParams.ttID) { //if the ttID from the cache matches the ttID from current page
                    vm.backToSearch = getURL; //use session storage
                } else {
                    var mode = vm.detail.TransportMode == 5 ? 'Bus' : 'Tram'; //If transportMode is 5 then = Bus else = Tram
                    vm.backToSearch = '/?mode=' + mode + '&serviceNo=' + vm.detail.BaseRoute.ServiceNumber; //use default url 
                }
            }
        }

        function activateTTRoute() {
            timetablesService.getTTRoute($routeParams.ttID + '/' + $routeParams.version + '/' + vm.direction + '/' + vm.when).then(
                function (response) {
                    vm.route = response;
                    vm.loadingStatus = 'Success';
                    $interval.cancel(vm.loading);

                    for (var i in vm.getDate) {
                        if (vm.getDate[i].IdValue == $location.search().when) {
                            vm.notes = vm.getDate[i].Notes;
                        }
                    }
                    vm.notesStr = JSON.stringify(vm.notes); //Convert notes to string so it can be compared
                }
            );
        }

        function getDirTimetable() {
            vm.getTimetableDir = vm.detail[vm.direction + "Timetables"].Timetables; //get timetable set from the default direction
            vm.getDate = $filter('orderBy')(vm.getTimetableDir, 'IdValue'); // Filter the dates in id order(mon-fri/sat/sun)
            vm.when = vm.getDate[0].IdValue; // Then set vm.when to the first date in the array
            vm.notes = vm.getDate[0].Notes; //get notes for correct date
        }

        function updateURL() {
            $location.search({
                direction: vm.direction,
                when: vm.when
            });
            $location.replace(); //replace history so the user can go back to search results with one click
            document.title = 'Route: ' + vm.detail.BaseRoute.ServiceNumber + ' - ' + vm.detail[vm.direction + 'Timetables'].RouteDescription + ' - Network West Midlands';
            updatePageView.update();//update google analytics page view
        }

        function changeDir() {
            vm.direction = vm.direction == 'Outbound' ? 'Inbound' : 'Outbound'; //  If direction is outbound switch to inbound, else default to outbound
            getDirTimetable(); //reset the days of the timetable to first in array
            updateURL(); //update the URL with the new vars
        }
        // When the user changes version, navigate to the correct page
        function versionChange() {
            $location.path('/route/' + $filter('timetableURL')(vm.versionSelect.stateless) + '-' + vm.versionSelect.version);
        }

        function map(x) {
            // If the map status is view...
            if (x == 'View' || x == 'changeDir' && vm.mapStatus == 'Close') {
                vm.mapStatus = 'Loading';
                timetablesService.getRouteMap($routeParams.ttID + '/' + $routeParams.version + '/' + vm.direction).then(
                    function (response) {
                        vm.bounds = response.Bounds; //collect the bounds from response
                        vm.coords = response.Coordinates; //collect the coords from response
                        vm.markers = []; //set a blank array to collect markers

                        // For each array(created above) in vm.coords
                        angular.forEach(response.Coordinates, function (item, i) {
                            // For each object within each created array
                            angular.forEach(item, function (coords, ind) {
                                // If it is the first item, give it a marker
                                if (i == 0 && ind == 0) {
                                    vm.markers.push({
                                        lat: coords.lat,
                                        lng: coords.lng,
                                        marker: vm.icon
                                    });
                                } else if (i == 0 && ind == item.length - 1) {
                                    // if it is the last item give it a marker
                                    vm.markers.push({
                                        lat: coords.lat,
                                        lng: coords.lng,
                                        marker: vm.icon
                                    });
                                }
                            });
                        });
                        vm.markers.push({
                            lat: vm.bounds[0].lat,
                            lng: vm.bounds[0].lng,
                            marker: ""
                        }, {
                            lat: vm.bounds[1].lat,
                            lng: vm.bounds[1].lng,
                            marker: ""
                        }); //Push the bounds into the markers array so that the map scales to see whole route

                        if (x == 'View') {
                            vm.mapStatus = 'Close'; //make map status close again
                        } else {
                            vm.mapStatus = 'View';
                        }
                        //after everything is done, initialise the map
                        $timeout(function () {
                            if (x == 'View') {
                                nwm.map.init();
                            } else {
                                vm.map(vm.mapStatus);
                            }
                        }, 0);
                    }
                );
            } else {
                vm.mapStatus = 'View'; //otherwise change the map status
            }
        }
    }

    function topSection() {
        return {
            templateUrl: '//static.centro.org.uk/nwmAssets/apps/timetables/partials/timetable/top-section.html',
            restrict: 'E'
        };
    }

    function route() {
        return {
            templateUrl: '//static.centro.org.uk/nwmAssets/apps/timetables/partials/timetable/route.html',
            restrict: 'E'
        };
    }

    function sideBar() {
        return {
            templateUrl: '//static.centro.org.uk/nwmAssets/apps/timetables/partials/timetable/side-bar.html',
            restrict: 'E'
        };
    }

    function sidebarScroll($window,$timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                //double timeouts so that the directive waits until the template has been loaded
                $timeout(function () {
                    $timeout(function(){
                        
                        checkViewForSidebar();//check on page load

                        angular.element($window).bind("scroll", function () {//check when user scrolls
                            checkViewForSidebar();
                        });
                        
                        //function to check if the top buttons are in sight
                        function checkViewForSidebar() {
                            var outOfView = $window.pageYOffset > (angular.element(".block--main").offset().top -40) ? true : false; //if the scroll position is greater than the distance of the "route" container div then display side buttons ELSE hide side buttons(if true the original buttons are out of view)
                            if (outOfView) {//if the top buttons are out of view, show the side buttons(double if statements so the code only runs once when scrolling, not all the time)
                                if (!element.is(':visible')) {
                                    angular.element(element).removeClass('fieldset--hidden');
                                }
                            } else {//else hide the side buttons
                                if (element.is(':visible')) {
                                    angular.element(element).addClass('fieldset--hidden');
                                }
                            }
                        }
                    }, 0);
                }, 0);
            }
        };
    }
    //directive for scrolling to the top when the element is clicked
    function scrollTop(){
        return {
            restrict: 'A',
            link: function(scope, element, attrs){
                element.on('click', function (e) {
                    angular.element('html, body').animate({
                        scrollTop: angular.element(".breadcrumb").offset().top + 30
                    }, 500);
                });    
            }
        };
    }
})();