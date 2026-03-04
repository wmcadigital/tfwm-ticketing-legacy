(function() {
  'use strict';

  angular.module('ticketingApp').run([
    '$document',
    '$timeout',
    function($document, $timeout) {
      function isFocusable(el) {
        var nodeName = ((el && el.nodeName) || '').toLowerCase();
        if (!nodeName) return false;
        if (
          nodeName === 'a' ||
          nodeName === 'button' ||
          nodeName === 'input' ||
          nodeName === 'textarea' ||
          nodeName === 'select'
        )
          return true;
        if (el.hasAttribute && el.hasAttribute('tabindex')) return true;
        return false;
      }

      function enhance(el) {
        if (!el || el.nodeType !== 1) return;
        if (el.__ngClickA11y) return;
        try {
          if (
            el.hasAttribute &&
            (el.hasAttribute('ng-click') || el.hasAttribute('data-ng-click'))
          ) {
            if (!isFocusable(el)) {
              el.setAttribute('tabindex', '0');
              if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
            }

            var handler = function(e) {
              var k = e.which || e.keyCode;
              if (k === 13 || k === 32) {
                e.preventDefault();
                // trigger the element's click handler in an Angular-friendly way
                angular.element(el).triggerHandler('click');
              }
            };

            angular.element(el).on('keydown', handler);
            // mark as enhanced to avoid duplicate handlers
            el.__ngClickA11y = true;
          }
        } catch (ignore) {}
      }

      // initial pass on existing elements
      $timeout(function() {
        var nodes =
          document.querySelectorAll && document.querySelectorAll('[ng-click],[data-ng-click]');
        nodes && Array.prototype.forEach.call(nodes, enhance);
      }, 0);

      // observe DOM for dynamically added ng-click elements
      if (window.MutationObserver) {
        var observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(m) {
            Array.prototype.forEach.call(m.addedNodes || [], function(n) {
              if (!n) return;
              if (n.nodeType === 1) {
                if (n.matches && (n.matches('[ng-click]') || n.matches('[data-ng-click]')))
                  enhance(n);
                var inner = n.querySelectorAll && n.querySelectorAll('[ng-click],[data-ng-click]');
                inner && Array.prototype.forEach.call(inner, enhance);
              }
            });
          });
        });
        observer.observe(document.body, { childList: true, subtree: true });
      }
    }
  ]);
})();
