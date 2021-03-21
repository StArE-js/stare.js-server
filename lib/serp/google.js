'use strict';

const debug = require('debug')('stare.js:server/serp/google');
const _ = require('lodash');
const { reject } = require('lodash');

try {
  require.resolve(`${process.cwd()}/node_modules/googleapis`);
} catch(e) {
  debug("Package 'googleapis' is not installed");
  process.exit(e.code);
}

const { google } = require(`${process.cwd()}/node_modules/googleapis`);
const customsearch = google.customsearch('v1');

if (_.isEmpty(global.stareOptions.google.apiKey)) {
  throw `You must define your Google API KEY as 'google.apiKey' in the StArE.js options to continue.`;
}

if (_.isEmpty(global.stareOptions.google.apiCx)) {
  throw `You must define your Google API CX as 'google.apiCx' in the StArE.js options to continue.`;
}

/**
 * Make the request to the Google API.
 * 
 * @param {String} query 
 * @param {Number} start 
 * @param {Number} num Must be between 1 and 10 as per Google API rules.
 */
function searchWithGoogleApi(query, start, num) {
  /**
   * Documentation for the function customsearch.cse.list() in:
   * https://developers.google.com/custom-search/v1/cse/list
   */
  const opts = {
    cx: global.stareOptions.google.apiCx,
    q: query,
    auth: global.stareOptions.google.apiKey,
    start: start,
    num: num
  };

  return customsearch.cse.list(opts);
}

/**
 * Sort the responses from the Google API,
 * these are pushed to an array based on the 
 * arriving order.
 * @param {Array} responses 
 */
function sortApiResults(responses) {
  let finalItems = [];
  
  let totalItems = responses.reduce((a, b) => a + _.get(b, 'config.params.num', 0), 0);
  
  finalItems.length = totalItems;

  responses.forEach(r => {
    let start = _.get(r, 'config.params.start');
    let num = _.get(r, 'config.params.num');
    
    let responseItems = _.get(r, 'data.items');
    let item = null;
    for (let index = 0; index < num; index++) {
      item = responseItems[index];
  
      finalItems[start + index - 1] = {
        title: _.get(item, 'title'),
        link: _.get(item, 'link'),
        snippet: _.get(item, 'snippet'),
        image: (((_.get(item, 'pagemap') || {}).cse_image || {})[0] || {}).src
      }
    }
  });

  return finalItems;
}

/**
 * Get the SERP from Google and returns an object with the StArE.js standard format.
 *
 * @async
 * @param {string} query The search query.
 * @param {number} numberOfResults Number of documents to get from the SERP.
 * @returns {Promise} Promise object with the standarized StArE.js formatted SERP response from Google.
 */
function getResultPages(query, numberOfResults) {
  if (!query || query.length === 0) {
    return Promise.reject(new Error('Query cannot be null.'));
  }
  
  const MAX_GOOGLE_API_DOCUMENTS = 100;
  const MAX_PER_REQUEST = 10;
  
  numberOfResults = numberOfResults || global.stareOptions.numberOfResults;
  numberOfResults = numberOfResults > MAX_GOOGLE_API_DOCUMENTS ? MAX_GOOGLE_API_DOCUMENTS : numberOfResults;

  let searchRequests = [];
  let start = 1;
  let num = (numberOfResults > MAX_PER_REQUEST) ? MAX_PER_REQUEST : numberOfResults;
  let page = 1;

  while(numberOfResults > 0) {
    numberOfResults -= num;
    searchRequests.push(searchWithGoogleApi(query, start, num));
    start = (MAX_PER_REQUEST * page++) + 1;
    num = (numberOfResults > MAX_PER_REQUEST) ? MAX_PER_REQUEST : numberOfResults;
  }

  return new Promise((resolve, reject) => {
    // Wait for the multiples API calls to resolve.
    Promise.all(searchRequests)
      .then(responses => {
        const items = sortApiResults(responses);

        // All the request will resolve the same headers, so it doesn't
        // matter wich one we use.
        const googleResult = _.get(responses[0], 'data');

        let formattedResponse = {
          totalResults: googleResult.searchInformation.formattedTotalResults,
          searchTerms: googleResult.queries.request[0].searchTerms,
          numberOfItems: items.length,
          startIndex: googleResult.queries.request[0].startIndex,
          documents: items
        };

        resolve(formattedResponse);
      })
      .catch(err => reject(err));
  });
}

module.exports = exports = getResultPages;
