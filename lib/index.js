'use strict';

const debug = require('debug')('stare.js:server');
const _ = require('lodash');
require('./config/defaultOptions');

/**
 * List supported engines.
 * Don't insta-import because some require configuration/API Keys
 * that are not necessary to run if the SERP is not required
 */
const SUPPORTED_ENGINES = [
  'bing',
  'ecosia',
  'elasticsearch',
  'google',
  'solr',
  'searchcloud',
  'baremo'
];

/* Engines to be imported */
let engines = {};

/* Will be used to load the metrics (default + user metrics). */
let getMetrics;

 /**
 * Makes a request to the specified search engine which returns (callback),
 * the SERP with the calculated metrics.
 *
 * @async
 * @function webSearch
 * @param {string} engine SERP to use [google|bing|ecosia|elasticsearch]
 * @param {string} query Search query
 * @param {number} numberOfResults Number of documents to get from the SERP.
 * @param {array} metrics Array with the name of the metrics to calculate
 * @return {Promise<Object>} An object with the standardized result page (SERP)
 */
function webSearch(engine, query, numberOfResults, metrics) {
  return new Promise((resolve, reject) => {

    if (! _.has(engines, engine)) {
      reject(`Search Engine '${engine}' not supported.`);
      return;
    }
    
    numberOfResults = Number(numberOfResults);
    metrics = metrics || [];
    
    let searchEngine = eval(engines[engine]);

    searchEngine(query, numberOfResults)
      .then(formattedResponse => {
        debug(`Getting metrics for formatted response: %O`, formattedResponse);
        getMetrics(formattedResponse, metrics)
          .then(values => {
            for (let response of values) {
              if (typeof formattedResponse.documents[response.index]['metrics'] === 'undefined') {
                formattedResponse.documents[response.index]['metrics'] = {};
              }
              formattedResponse.documents[response.index]['metrics'][response.name] = response.value;
            }
            resolve(formattedResponse);
          })
          .catch(err => reject(err));
      })
      .catch(err => reject(err));
    });
}

/**
 * Module exports a constructor with the optional StArE.js parameters
 * as an argument.
 * @param {Object} [opts = {}] - Optional configurations for StArE.js
 */
module.exports = exports = (opts) => {

  opts = opts || {};
  debug(`Optionals: %O`, opts);

  /* Override default settings */
  for (let key in global.stareOptions) {
    if (opts.hasOwnProperty(key)) {
      global.stareOptions[key] = opts[key];
    }
  }

  /* Import only the SERP engines required */
  for (const engine of global.stareOptions.engines) {
    if (SUPPORTED_ENGINES.indexOf(engine) > -1) {
      engines[engine] = require(`./serp/${engine}`);
    }
  }

  /* Import personal SERP, this will override the integrated ones if the key name is the name */
  for (const engine in global.stareOptions.personalSERPs) {
    engines[engine] = global.stareOptions.personalSERPs[engine];
  }

  /* StArE can't work without SERP engines configured */
  if (Object.keys(engines).length === 0) {
    debug("No valid SERP engines had been required.");
    return null;
  }

  /* Has to be imported after set the optional "personalMetrics" so all can be indexed */
  getMetrics = require('./metrics');

  return webSearch;
};