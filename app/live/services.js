(function () {
    'use strict';
    angular
        .module('timetablesApp.timetablesServices', [])
        .factory('timetablesService', ['$http', timetablesService])
        .factory('savedFilter', [savedFilter])
        .factory('updatePageView', ['$location', updatePageView]);

    function timetablesService($http) {
        var uri = '//journeyplanner.networkwestmidlands.com/api/TimetableStopApi/';
        return {
            getAllTimetables: function (data){
                return getData($http.post(uri + 'Search/serviceQuery', data, {cache: 'true'}));
            },
            getTrainTimetables: function (){
                return getData($http.get('http://stagenwm.cenapps.org.uk/ways-to-travel/train/train-timetables/xmldump', {cache: 'true'}));
            },
            getTTHeaders: function (data){
                return getData($http.get(uri + 'GetTimetableHeader/' + data, {cache: false}));
            },
            getTTRoute: function(data){
                return getData($http.get(uri + 'GetStopsOnRoute/' + data, {cache: false}));
            },
            getRouteMap: function(data){
                return getData($http.get(uri + 'getRouteMap/' + data, {cache:true}));
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
                "Status: " + response.status +
                "\n\nHeaders: " + response.statusText +
                "\n\nData: " + JSON.stringify(response.data) +
                "\n\nConfig: " + JSON.stringify(response.config)
            );
        }
    }

    function savedFilter() {
        var savedData = [];

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

    function updatePageView($location){
        //set function for updating GA pageview count...this is here for reusablility across controllers
        function update() {
            dataLayer.push({
                event: 'ngRouteChange',
                attributes: {
                    route: $location.absUrl().split('https://www.networkwestmidlands.com')[1]
                }
            });
        }
        return{
            update: update
        };
    }

})();