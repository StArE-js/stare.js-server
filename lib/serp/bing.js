'use strict';

const debug = require('debug')('stare.js:server/serp/bing');
const _ = require('lodash');
const axios = require('axios');

if (_.isEmpty(global.stareOptions.bing.serviceKey)) {
  throw `You must define your Azure Cognitive Services for WebSearch key (BING_SERVICE_KEY) in the property 'bing.serviceKey' in the StArE.js options.`;
}


//Update API Bing Search
const BING_API_BASE_URL = 'https://api.bing.microsoft.com/v7.0/search';
/**
 * Make the request to the Bing API.
 *
 * @param {String} query
 * @param {Number} start
 * @param {Number} num Must be between 1 and 10 as per Bing API rules.
 */

function searchWithBingApi(query, start, num) {
  const opts = {
    headers: {
      'Ocp-Apim-Subscription-Key': global.stareOptions.bing.serviceKey
    },
    params: {
      q: query,
      count: num,
      offset: start,
      responseFilter: 'WebPages'
    }
  };

  return axios.get(BING_API_BASE_URL, opts);
}
/**
 * Sort the responses from the Bing API,
 * these are pushed to an array based on the
 * arriving order.
 * @param {Array} responses
 */
function sortApiResults(responses) {
  let finalItems = [];

  responses.forEach(r => {
    const responseItems = _.get(r, 'webPages.value', []);

    responseItems.map(item => {
      finalItems.push({
        link: _.get(item, 'url'),
        title: _.get(item, 'name'),
        snippet: _.get(item, 'snippet'),
        image: _.get(item, 'image')
      });
    });
  });

  return finalItems;
}

/**
 * Get the SERP from Bing and returns an object with the StArE.js standard format.
 *
 * @async
 * @param {string} query The search query.
 * @param {number} numberOfResults Number of documents to get from the SERP.
 * @returns {Promise} Promise object with the standarized StArE.js formatted SERP response from Bing.
 */
function getResultPages(query, numberOfResults) {
  if (!query || query.length === 0) {
    return Promise.reject(new Error('Query cannot be null.'));
  }

  const MAX_BING_API_DOCUMENTS = 100;
  const MAX_PER_REQUEST = 50;

  numberOfResults = numberOfResults || global.stareOptions.numberOfResults;
  numberOfResults = numberOfResults > MAX_BING_API_DOCUMENTS ? MAX_BING_API_DOCUMENTS : numberOfResults;

  let searchRequests = [];
  let start = 1;
  let num = (numberOfResults > MAX_PER_REQUEST) ? MAX_PER_REQUEST : numberOfResults;
  let page = 1;

  while(numberOfResults > 0) {
    numberOfResults -= num;
    searchRequests.push(searchWithBingApi(query, start, num));
    start = (MAX_PER_REQUEST * page++) + 1;
    num = (numberOfResults > MAX_PER_REQUEST) ? MAX_PER_REQUEST : numberOfResults;
  }

  return new Promise((resolve, reject) => {
    Promise.all(searchRequests)
      .then(responses => {
        const items = sortApiResults(responses.map(response => response.data));

        const formattedResponse = {
          totalResults: Number(responses[0].data.webPages.totalEstimatedMatches).toLocaleString().replace(/,/g, '.'),
          searchTerms: responses[0].data.queryContext.originalQuery,
          numberOfItems: items.length,
          startIndex: 1,
          documents: items
        };

        resolve(formattedResponse);
      })
      .catch(err => reject(err));
  });
}

module.exports = exports = getResultPages;
