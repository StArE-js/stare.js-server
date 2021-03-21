'use strict';

const debug = require('debug')('stare.js:server/serp/searchcloud');
const _ = require('lodash');

try {
  const stareOptions = global.stareOptions;

  if (! _.has(stareOptions, 'searchcloud')
      || ! _.has(stareOptions.searchcloud, 'searchEndpoint')
      || ! _.has(stareOptions.searchcloud, 'apiVersion')
      || ! _.has(stareOptions.searchcloud, 'titleProperty')
      || ! _.has(stareOptions.searchcloud, 'snippetProperty')
      || ! _.has(stareOptions.searchcloud, 'imageProperty')) {
    throw new Error("NO_SEACHCLOUD_OPTIONS");
  }
} catch(e) {
  debug("AWS Search Cloud options not correctly configurated");
  process.exit(e.code);
}

const rp = require('request-promise');
const qs = require('qs');

const SEARCH_ENDPOINT = global.stareOptions.searchcloud.searchEndpoint;
const API_VERSION = global.stareOptions.searchcloud.apiVersion;
const TITLE_PROPERTY = global.stareOptions.searchcloud.titleProperty;
const BODY_PROPERTY = global.stareOptions.searchcloud.bodyProperty;
const LINK_PROPERTY = global.stareOptions.searchcloud.linkProperty;
const SNIPPET_PROPERTY = global.stareOptions.searchcloud.snippetProperty;
const IMAGE_PROPERTY = global.stareOptions.searchcloud.imageProperty;

/**
 * Get the SERP from AWS Search Cloud and returns an object with the StArE.js standard format.
 *
 * The documentation for the search options can be found here:
 * https://docs.aws.amazon.com/cloudsearch/latest/developerguide/search-api.html
 *
 * @async
 * @param {string} query The search query.
 * @param {number} numberOfResults Number of documents to get from the SERP.
 * @returns {Promise} Promise object with the standarized StArE.js formatted SERP response from AWS Search Cloud.
 */
function getResultPages(query, numberOfResults) {

  if (!query || query.length === 0) {
    return Promise.reject(new Error('Query cannot be null.'));
  }

  const queryParams = {
    q: query,
    start: 0,
    size: numberOfResults || global.stareOptions.numberOfResults
  };

  const queryString = qs.stringify(queryParams);

  return new Promise((resolve, reject) => {
    const searchUrl = `${SEARCH_ENDPOINT}/${API_VERSION}/search?${queryString}`;
    
    debug(`AWS Search Cloud url [${searchUrl}]`);
    rp({
      uri: searchUrl,
      json: true
    })
      .then(
        awsSearchCloudResult => {
          let formattedResponse = {
            totalResults: awsSearchCloudResult.hits.found,
            searchTerms: query,
            numberOfItems: awsSearchCloudResult.hits.hit.length,
            startIndex: awsSearchCloudResult.hits.start + 1,
            documents: []
          };

          // Extract the documents relevant info for Stare.js
          formattedResponse.documents = awsSearchCloudResult.hits.hit.map(item => ({
            title: _.get(item, TITLE_PROPERTY),
            link: _.get(item, LINK_PROPERTY, null),
            body: _.get(item, BODY_PROPERTY, null),
            snippet: _.get(item, SNIPPET_PROPERTY),
            image: _.get(item, IMAGE_PROPERTY)
          }));

          resolve(formattedResponse);
        },
        err => reject(err))
      .catch(err => reject(err));
  });
}

module.exports = exports = getResultPages;
