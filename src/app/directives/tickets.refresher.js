(function() {
  'use strict';

  angular.module('ticketingApp').directive('refresher', refresher);

  // function to display refresh the grid
  function refresher() {
    var directive = {
      transclude: true,
      controller: refresherController
    };

    return directive;
  }

  refresherController.$inject = ['$scope', '$transclude', '$attrs', '$element'];
  function refresherController($scope, $transclude, $attrs, $element) {
    var childScope;

    $scope.$watch($attrs.condition, function(value) {
      $element.empty();
      if (childScope) {
        childScope.$destroy();
        childScope = null;
      }

      $transclude(function(clone, newScope) {
        childScope = newScope;
        $element.append(clone);
      });
    });
  }
})();
