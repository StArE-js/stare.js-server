'use strict';

const rp = require('request-promise');
const cheerio = require('cheerio');
const validUrl = require('valid-url');
const _ = require('lodash');


/**
 * Gets the body tag text content for an HTML string code
 *
 * @param {string} htmlCode HTML file as a string.
 * @returns {string} The body text from the html code.
 */
function stripTags(htmlCode) {
  const $ = cheerio.load(htmlCode);
  // TODO: Remove <script> & <style> tags in between?
  return $('body').text().trim();
}

 /**
 * Get HTML code from an url and saves it in the temp folder
 *
 * @async
 * @param {string} url Documents url.
 * @returns {Promise<object>} Promise object with the html code 
 */
function html(stareDocument) {
  if (_.has(stareDocument, 'link') && validUrl.isUri(stareDocument.link)) {
    const url = _.get(stareDocument, 'link');

    return new Promise((resolve, reject) => {
      rp(url)
        .then(data => {
          const htmlCode = data.toString();
          resolve(htmlCode);
        })
        .catch(err => reject(new Error(err)));
    });
  }
  
  return Promise.resolve(_.get(stareDocument, 'body', ''));
};

 /**
 * Get text from an url.
 *
 * @async
 * @param {string} url Documents url.
 * @returns {Promise<object>} Promise object with the text
 */
function text(stareDocument) {
  if (_.has(stareDocument, 'link') && validUrl.isUri(stareDocument.link)) {
    const url = _.get(stareDocument, 'link', '');

    return new Promise((resolve, reject) => {
      html(url)
        .then(htmlCode => {
          const text = stripTags(htmlCode);
          resolve(text);
        })
        .catch(err => reject(new Error(err)));
    });
  }

  return Promise.resolve(_.get(stareDocument, 'body', ''));
};

module.exports = exports = {
  html,
  text
};
