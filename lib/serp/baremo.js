'use strict';

const debug = require('debug')('stare.js:server/serp/baremo');
const _ = require('lodash');
const rp = require('request-promise');
const qs = require('qs');

try {
  const stareOptions = global.stareOptions;
  if (!_.has(stareOptions, 'baremo')
    || !_.has(stareOptions.baremo, 'baseUrl')
    || !_.has(stareOptions.baremo, '_index')){
    throw new Error("NO_BAREMO_OPTIONS");
  }
} catch (e) {
  debug("Baremo options not correctly configurated");
  process.exit(e.code);
}

/**
 * Get the SERP from ElasticSearch and returns an object with the StArE.js standard format.
 *
 * @async
 * @param {string} query The search query.
 * @param {number} numberOfResults Number of documents to get from the SERP.
 * @returns {Promise} Promise object with the standarized StArE.js formatted SERP response from ElasticSearch.
 */
function getResultPages(query, numberOfResults) {
  if (!query || query.length === 0) {
    return Promise.reject(new Error('Query cannot be null.'));
  }

  let queryParams = {
    q: query,
    from: 0,
    rest_total_hits_as_int: true,
    size: numberOfResults || global.stareOptions.numberOfResults,
    track_scores: true,
    track_total_hits: true
  };

  
  
  
  const BASE_URL = global.stareOptions.baremo.baseUrl;
  const _INDEX = global.stareOptions.baremo._index;
  const _SOURCE ='_source';
  const TITLE_PROPERTY = 'caratulado';
  const LINK_PROPERTY = 'data';
  const SNIPPET_PROPERTY = 'hechosFundantes';
  const IMAGE_PROPERTY = 'data'
  
  let queryString = qs.stringify(queryParams);

  return new Promise((resolve, reject) => {
    let searchUrl = `${BASE_URL}/${_INDEX}/_search?${queryString}`;

    debug(`Baremo Search url [${searchUrl}]`);
    rp({
      uri: searchUrl,
      json: true
    })
      .then(
        baremoResult => {
          let formattedResponse = {
            totalResults: baremoResult.hits.total,
            searchTerms: query,
            numberOfItems: baremoResult.hits.hits.length,
            startIndex: queryParams.from + 1,
            documents: []
          };

          // Extract the documents relevant info for Stare.js
          formattedResponse.documents = baremoResult.hits.hits.map(item => {
            return ({
              title: _.get(item[_SOURCE], TITLE_PROPERTY, ''),
              link:  `data:application/pdf;base64,${_.get(item[_SOURCE], LINK_PROPERTY)}`,
              body: _.get(item, _SOURCE) ? JSON.stringify(_.get(item, _SOURCE))  :  null,
              snippet: _.get(item[_SOURCE], SNIPPET_PROPERTY, null),
              image: _.get(item[_SOURCE], IMAGE_PROPERTY,null)
            })
          });

          resolve(formattedResponse);
        },
        err => reject(err))
      .catch(err => reject(err));
  });
}

module.exports = exports = getResultPages;
