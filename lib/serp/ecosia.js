'use strict';

const cheerio = require('cheerio');
const rp = require('request-promise');

const SEARCH_URL = `https://ecosia.org/search`;

/**
 * Get the SERP from Ecosia and returns an object with the StArE.js standard format.
 *
 * @async
 * @param {string} query The search query.
 * @param {number} numberOfResults Number of documents to get from the SERP.
 * @returns {Promise} Promise object with the standarized StArE.js formatted SERP response from Ecosia.
 */
function getResultPages(query, numberOfResults) {
  if (!query || query.length === 0) {
    return Promise.reject(new Error('Query cannot be null.'));
  }
  
  return new Promise((resolve, reject) => {
    let searchUrl = `${SEARCH_URL}?q=${query}&p=${numberOfResults/global.stareOptions.ecosia.resultsPerPage}`;

    rp(searchUrl)
      .then(html => {
          try {
            const $ = cheerio.load(html);

            if ($('div.result-count').length === 0) {
              resolve({
                totalResults: 0,
                searchTerms: query,
                numberOfItems: 0,
                startIndex: 0,
                documents: []
              });
              return;
            }
            // Total results
            const totalResults = parseInt($('div.result-count').text().replace(/\\n|results|,/g,"").trim())

            // documents / webpages
            const resultDocuments = $('.card-web .result');
            let documents = [];

            resultDocuments.each((index, element) => {
              documents.push({
                title: $(element).find('a.result-title').text().replace("\n","").trim(),
                link: $(element).find('a.result-title').attr('href'),
                snippet: $(element).find('p.result-snippet').text().replace("\n","").trim(),
                image: ''
              });
            });

            resolve({
              totalResults: totalResults,
              searchTerms: query,
              numberOfItems: resultDocuments.length,
              startIndex: (numberOfResults - 1) * 10 + 1,
              documents: documents
            });
          } catch(err) {
            reject(err);
          }
        },
        err => reject(err)
      )
      .catch(err => reject(err));
  });
}

module.exports = exports = getResultPages;
