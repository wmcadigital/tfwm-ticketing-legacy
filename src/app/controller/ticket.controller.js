(function() {
  'use strict';

  angular
    .module('ticketingApp')
    .controller('TicketDetailCtrl', TicketDetailCtrl)
    .filter('removeHTMLTags', removeHTMLTags)
    .filter('escapeFilter', escapeFilter)
    .directive('modalDialog', modalDialog)
    .directive('tabs', tabs)
    .directive('pane', pane)
    .directive('tooltip', tooltip);

  TicketDetailCtrl.$inject = [
    'ticketingService',
    '$interval',
    'getURL',
    '$routeParams',
    '$scope',
    '$timeout',
    'deviceDetector'
  ];

  function TicketDetailCtrl(
    ticketingService,
    $interval,
    getURL,
    $routeParams,
    $scope,
    $timeout,
    deviceDetector
  ) {
    var vm = this;
    vm.loadingText = 'Loading...'; // default loading text
    vm.loadingStatus = 'loading'; // default loading status
    vm.loadingArray = [
      'Well, what are you waiting for?',
      'Are we there yet?',
      'Warming up the processors...',
      'Reconfiguring the office coffee machine...',
      'Doing something useful...',
      'Are you ready?',
      'So, do you come here often?',
      'This may take some time...',
      'I know this is painful to watch, but I have to load this.',
      'Oh, no! Loading time...',
      'Still Waiting... huh',
      'Waiting for something in the server.',
      'Creating randomly generated feature.',
      "It's not you. It's me.",
      'Eating your internet cookies...Yummy!'
    ]; // loading messages
    vm.loading = $interval(function() {
      vm.loadingText = vm.loadingArray[Math.round(Math.random() * (vm.loadingArray.length - 1))];
    }, 3500); // show random loading message based on milliseconds set
    vm.ticketID = $routeParams.ticket; // set Ticket ID to URL parameter
    vm.filterAccordions = {};
    vm.relatedTickets = {};
    vm.priceLevelsList = {};
    vm.toggleClick = toggleClick;
    vm.modalShown = false;
    vm.toggleModal = toggleModal;
    vm.toggleModalBus = toggleModalBus;
    vm.toggleModalTrain = toggleModalTrain;
    vm.toggleModalSwift = toggleModalSwift;
    vm.operatorList = []; // Define Operator list
    vm.limit = 4; // Set paging limit for Alt tickets
    vm.openFilters = openFilters;
    vm.closeFilters = closeFilters;
    vm.date = new Date();
    vm.deviceDetect = deviceDetect; // Function to detect device
    vm.buyButtonSwift = 'Buy on Swift';
    vm.gpay = false; // Default value for GPay products
    vm.paygButton = paygButton; // Function to update buy button if product is available on GPay

    // Function to get the ticket data with api call
    function initialise(data) {
      ticketingService.getTicket(data).then(function(response) {
        vm.all = response;
        if (vm.all.relatedTickets.length) {
          vm.related = [];
          angular.forEach(
            vm.all.relatedTickets,
            function(item) {
              ticketingService.getTicket(item.id).then(function(related) {
                vm.relatedTickets[item.id] = related;
                vm.relatedList = vm.relatedTickets[item.id];
                // push items into a single array
                vm.related.push(vm.relatedList);
              });
            },
            vm.related
          );
        }
        if (vm.all.documents.length) {
          ticketingService.getTerms(data).then(function(terms) {
            vm.relatedTerms = terms;
          });
        }
        ticketingService.getOperators().then(function(operator) {
          vm.operatorList = operator;
          // console.log(response);
        });
        backButtonLogic(); // Determine back button logic
      });
    }

    function initialiseFull(data) {
      ticketingService.getTicketFull(data).then(function(response) {
        vm.full = response;
        vm.priceLevels = response.priceLevels;
        vm.gpay = false;
        vm.priceLevelsList = vm.priceLevels.map(function(item) {
          if (item.type.includes('Google Pay')) {
            vm.gpay = true;
          }
        });
        paygButton();
      });
    }

    // detect device in use
    vm.deviceDetect();
    function deviceDetect() {
      vm.deviceDetector = deviceDetector.device;
    }

    // update buy button to Buy on Google Pay if available
    function paygButton() {
      if (vm.deviceDetector === 'android' && vm.gpay) {
        vm.buyButtonSwift = 'Buy on Google Pay';
      }
    }

    function openFilters() {
      document.getElementById('filterOverlay').style.display = 'block';
    }

    function closeFilters() {
      document.getElementById('filterOverlay').style.display = 'none';
    }

    function backButtonLogic() {
      vm.backToSearch = getURL; // use session storage
      // console.log(vm.backToSearch);
      vm.stationFromNameZone = '1';
    }

    initialise(vm.ticketID); // initialise API to get ticket
    initialiseFull(vm.ticketID); // initialise API to get ticket

    function toggleClick(type) {
      vm.filterAccordions[type] = !vm.filterAccordions[type];
    }

    // popup modals

    // bus
    vm.modalShownBus = false;
    function toggleModalBus() {
      vm.modalShownBus = !vm.modalShownBus;
    }

    // train
    vm.modalShownTrain = false;
    function toggleModalTrain() {
      vm.modalShownTrain = !vm.modalShownTrain;
    }

    // general
    vm.modalShown = false; // hide modal on page load
    function toggleModal() {
      vm.modalShown = !vm.modalShown;
    }

    // swift
    vm.modalShownSwift = false;
    function toggleModalSwift() {
      vm.modalShownSwift = !vm.modalShownSwift;
    }

    $timeout(function() {
      vm.loadingStatus = 'success';
    }, 0);
  }

  // FILTERS
  removeHTMLTags.$inject = [];
  function removeHTMLTags() {
    return function(text) {
      return text ? String(text).replace(/<[^>]+>/gm, '') : '';
    };
  }

  // escape filter for ticket t&c's
  escapeFilter.$inject = [];
  function escapeFilter() {
    return function(text) {
      return text ? String(text).replace(/\n/gm, '<br><br>') : '';
    };
  }

  // DIRECTIVES

  function modalDialog() {
    return {
      restrict: 'E',
      scope: {
        show: '='
      },
      replace: true, // Replace with the template below
      transclude: true, // we want to insert custom content inside the directive
      link: function(scope, element, attrs) {
        scope.dialogStyle = {};
        if (attrs.width) scope.dialogStyle.width = attrs.width;
        if (attrs.height) scope.dialogStyle.height = attrs.height;
        if (attrs.modalclass) scope.dialogStyle.class = attrs.modalclass;
        scope.hideModal = function() {
          scope.show = false;
        };
      },
      template:
        '<div ng-show="show" class="mod">' +
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
      controller: [
        '$scope',
        function($scope) {
          // eslint-disable-next-line no-multi-assign
          var panes = ($scope.panes = []);

          // eslint-disable-next-line no-shadow
          $scope.select = function(pane) {
            // eslint-disable-next-line no-shadow
            angular.forEach(panes, function(pane) {
              pane.selected = false;
            });
            pane.selected = true;
          };

          this.addPane = function(panel) {
            if (panes.length === 0) $scope.select(panel);
            panes.push(panel);
          };
        }
      ],
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
      link: function(scope, element, attrs, tabsCtrl) {
        tabsCtrl.addPane(scope);
      },
      template: '<div class="tab-pane" ng-class="{active: selected}" ng-transclude></div>',
      replace: true
    };
  }

  function tooltip() {
    return {
      restrict: 'A',
      controller: [
        '$scope',
        function($scope) {
          $scope.isShown = false;
          this.showHover = function() {
            $scope.isShown = $scope.isShown !== true;
          };
        }
      ],
      transclude: true,
      link: function(scope, element, attrs, ctrl) {
        scope.copy = attrs.tooltipc;
        element.bind('click', function() {
          scope.$apply(function() {
            ctrl.showHover();
          });
        });
      },
      template:
        '<div ng-transclude></div>' +
        '<p class="field-help tooltip" ng-show="isShown">' +
        '<span class="close modal__close"></span>' +
        '<span data-ng-bind-html="copy"></span>' +
        '</p>'
    };
  }
})();
