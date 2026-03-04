(function() {
  'use strict';

  angular.module('ticketingApp').directive('keyboardClick', keyboardClick);

  function keyboardClick() {
    return {
      restrict: 'A',
      link: function(scope, element) {
        // make element focusable if it isn't already
        if (!element.attr('tabindex')) element.attr('tabindex', '0');
        if (!element.attr('role')) element.attr('role', 'button');

        element.on('keydown', function(evt) {
          var key = evt.which || evt.keyCode;
          // Enter (13) or Space (32)
          if (key === 13 || key === 32) {
            evt.preventDefault();
            // trigger click handler on the element
            scope.$apply(function() {
              element.triggerHandler('click');
            });
          }
        });
      }
    };
  }
})();
