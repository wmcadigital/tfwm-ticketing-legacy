(function() {
  'use strict';

  angular
    .module('ticketingApp')
    .run(['$document', '$timeout', function($document, $timeout) {
      function enhance(node) {
        if (!node || node.nodeType !== 1) return;
        if (node.classList && node.classList.contains('angucomplete-row')) {
          var el = angular.element(node);
          if (!node.hasAttribute('tabindex')) node.setAttribute('tabindex', '0');
          if (!node.getAttribute('role')) node.setAttribute('role', 'option');
          el.on('keydown', function(e) {
            var k = e.which || e.keyCode;
            if (k === 13 || k === 32) {
              e.preventDefault();
              el.triggerHandler('click');
            }
          });
        }
      }

      // Observe DOM changes to enhance dynamically added result rows
      if (window.MutationObserver) {
        var observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(m) {
            Array.prototype.forEach.call(m.addedNodes || [], function(n) {
              if (n.nodeType === 1) {
                if (n.matches && n.matches('.angucomplete-row')) enhance(n);
                var rows = n.querySelectorAll && n.querySelectorAll('.angucomplete-row');
                rows && Array.prototype.forEach.call(rows, enhance);
              }
            });
          });
        });
        observer.observe(document.body, { childList: true, subtree: true });
      }

      // Enhance any existing rows on load
      $timeout(function() {
        var rows = document.querySelectorAll && document.querySelectorAll('.angucomplete-row');
        rows && Array.prototype.forEach.call(rows, enhance);
      }, 0);
    }]);
})();
