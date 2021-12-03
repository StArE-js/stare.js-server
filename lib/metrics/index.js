'use strict';

const keywordsPosition = require('./keywords-position');

var debug = require('debug')('stare.js:server/metrics/');

/* Sets all the available feature extractors/metrics, stare metrics + personal metrics  */
const availableMetrics = {
  'language': require('./language'),
  'length': require('./length'),
  'links': require('./links'),
  'multimedia': require('./multimedia'),
  'perspicuity': require('./perspicuity'),
  'ranking': require('./ranking'),
  'keywords-position': require('./keywords-position'),
  'category': require('./category'),
  'courts': require('./courts'),
  'injuries': require('./injuries'),
  'lawsuit-ammount': require('./lawsuit-ammount'),
  'personal-victim-data': require('./personal-victim-data'),
  'modules': require('./modules'),
  'sector': require('./sector'),
  'subsector': require('./subsector'),
};

for (const metric in global.stareOptions.personalMetrics) {
  availableMetrics[metric] = global.stareOptions.personalMetrics[metric];
}

/**
 * Gets the metrics specified in the 'metrics' array for each document in the serpResponse.
 *
 * @param {object} serpResponse JSON formatted response
 * @param {string} serpResponse.totalResults Total of the results for the query
 * @param {string} serpResponse.searchTerms Query that triggers the SERP response
 * @param {number} serpResponse.numberOfItems Number of documents in this SERP
 * @param {array} serpResponse.documents Array of the document objects
 * @param {array} metrics An array of strings with the names of the desired metrics.
 * @retuns {Promise} A promise with all the resolved metrics.
 */
function getMetrics(serpResponse, metrics) {
  let promises = [];
  // There is no metrics to calculate.
  if (metrics.length === 0) {
    return Promise.all(promises);
  }

  for (let index = 0; index < serpResponse.numberOfItems; index++) {
    // Either the metric uses serp or not is easier to load this info now than 
    // conditionally decide it after.
    let opts = {
      searchInfo: {
        totalResults: serpResponse.totalResults,
        searchTerms: serpResponse.searchTerms,
        numberOfItems: serpResponse.numberOfItems,
        startIndex: serpResponse.startIndex
      },
      index: index
    };
    // Define which info each metric will require
    for (let metric of metrics) {
      let metricAsFunction = eval(availableMetrics[metric]);
      
      if (typeof metricAsFunction === 'function') {
        promises.push(metricAsFunction(serpResponse.documents[index], opts));
      } else {
        debug(`Metric '${metric}' is not a function.`);
      }
    }
  }

  return Promise.all(promises);
};

module.exports = exports = getMetrics;