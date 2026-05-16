(function() {
  'use strict';

  angular.module('ticketingApp').factory('buyTicketUrlService', buyTicketUrlFactory);

  function buyTicketUrlFactory() {
    function normalize(originalUrl, setTicketFinderName, isSwiftCurrentAmount) {
      var url;
      var finder;
      var parts;
      var queryString;
      var baseUrl2;
      var baseUrl;
      var parts2;
      var queryString2;
      var matrixid;

      if (!originalUrl) return originalUrl;
      url = originalUrl;
      finder = setTicketFinderName || '';

      // Unicard / TfWM Ticket Finder rewrite
      if (finder.includes('TfWM Ticket Finder') || finder.includes('Unicard')) {
        try {
          if (
            !url.includes('ticketing.networkwestmidlands.com') &&
            !url.includes('ticketing.cenapps.org.uk')
          ) {
            parts = url.split('?');
            queryString = parts[1] || '';
            // remove square brackets and parentheses from query string
            try {
              queryString = queryString
                .replace('https://', '')
                .replace(/\[|\]|\(|\)/g, '')
                .replace(/[{}]/g, '')
                .replace(/:/g, '=')
                .replace(/'/g, '');
            } catch (e) {
              // eslint-disable-next-line no-empty
            }
            url = 'https://my.swiftcard.org.uk/?' + queryString;
          }
        } catch (e) {
          // noop
        }
      }

      // PAYG Smart Citizen override: if Swift PAYG and running inside Smart Citizen contexts
      if (isSwiftCurrentAmount && finder.includes('Smart Citizen')) {
        baseUrl2 = '';
        if (finder.includes('Smart Citizen Mobile Production'))
          baseUrl2 = 'https://m-public-tfwm.smartcitizen.net';
        else if (finder.includes('Smart Citizen Desktop Production'))
          baseUrl2 = 'https://public-tfwm.smartcitizen.net';
        else if (finder.includes('Smart Citizen Mobile Test'))
          baseUrl2 = 'https://m-public-tfwmtest.smartcitizen.net';
        else if (finder.includes('Smart Citizen Production'))
          baseUrl2 = 'https://my.swiftcard.org.uk';
        else if (finder.includes('Smart Citizen Test'))
          baseUrl2 = 'https://public-tfwmtest.smartcitizen.net';
        else if (finder.includes('Smart Citizen Desktop Test'))
          baseUrl2 = 'https://public-tfwmtest.smartcitizen.net';
        else if (finder.includes('Smart Citizen Dev'))
          baseUrl2 = 'https://public-tfwmdev.smartcitizen.net';
        else if (finder.includes('Swift Portal')) baseUrl2 = 'https://my.swiftcard.org.uk';
        else if (finder.includes('Swift Portal Mobile'))
          baseUrl2 = 'https://m-public-tfwm.smartcitizen.net';
        // else if (finder.includes('TfWM Ticket Finder')) baseUrl2 = 'https://my.swiftcard.org.uk';

        if (baseUrl2) {
          url = baseUrl2 + '/?matrixId=AAC001';
        }
      }

      // General matrixId formatting for Smart Citizen / Swift Portal contexts
      if (
        (url.includes('matrixId') && finder.includes('Smart Citizen')) ||
        (url.includes('matrixId') && finder.includes('Swift Portal'))
      ) {
        try {
          baseUrl = '';
          if (finder.includes('Smart Citizen Mobile Production'))
            baseUrl = 'https://m-public-tfwm.smartcitizen.net';
          else if (finder.includes('Smart Citizen Desktop Production'))
            baseUrl = 'https://public-tfwm.smartcitizen.net';
          else if (finder.includes('Smart Citizen Mobile Test'))
            baseUrl = 'https://m-public-tfwmtest.smartcitizen.net';
          else if (finder.includes('Smart Citizen Production'))
            baseUrl = 'https://my.swiftcard.org.uk';
          else if (finder.includes('Smart Citizen Test'))
            baseUrl = 'https://public-tfwmtest.smartcitizen.net';
          else if (finder.includes('Smart Citizen Desktop Test'))
            baseUrl = 'https://public-tfwmtest.smartcitizen.net';
          else if (finder.includes('Smart Citizen Dev'))
            baseUrl = 'https://public-tfwmdev.smartcitizen.net';
          else if (finder.includes('Swift Portal')) baseUrl = 'https://my.swiftcard.org.uk';
          else if (finder.includes('Swift Mobile Portal'))
            baseUrl = 'https://m-public-tfwm.smartcitizen.net';

          parts2 = url.split('?');
          queryString2 = parts2[1] || '';
          // strip square brackets and parentheses from the query string
          try {
            queryString2 = queryString2.replace(/\[|\]|\(|\)/g, '');
          } catch (e) {
            // eslint-disable-next-line no-empty
          }
          matrixid = queryString2
            .replace('https://', '')
            .replace(/\[|\]|\(|\)/g, '')
            .replace(/[{}]/g, '')
            .replace(/:/g, '=')
            .replace(/'/g, '');
          if (baseUrl) url = baseUrl + '?' + matrixid;
        } catch (e) {
          // noop
        }
      }

      return url;
    }

    return {
      normalize: normalize
    };
  }
})();
