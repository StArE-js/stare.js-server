'use strict';

const { reject } = require('lodash');
const _ = require('lodash');
const debug = require('debug')('stare.js:server/metrics/courts');

/**
 * Defines the courts (first instance, appellate and Supreme) and the data assoicated with every step in the Lawsuit process from the stare-format document based
 * on the body.
 *
 * @async
 * @param {Object} stareDocument  The Document data with stare format
 * @param {string} stareDocument.title  Document title
 * @param {string} stareDocument.link  Document link
 * @param {string} stareDocument.snippet  Document snippet
 * @param {string} stareDocument.image  Document image
 * @param {Object} opts  Optional parameters to calculate the metric 
 * @param {Object} opts.searchInfo  Search info for the query associated to the document
 * @param {string} opts.searchInfo.totalResults  Total documents that generates the query (formatted with dots '.' in the thousands)
 * @param {string} opts.searchInfo.searchTerms  Query string
 * @param {integer} opts.searchInfo.numberOfItems  Number of documents that contains this page result
 * @param {integer} opts.searchInfo.startIndex  Start document ranking for this page result.
 * @returns {Promise}
 */
function calculate(stareDocument, opts) {
    return new Promise((resolve, reject) => {
        let courts = {court:{},appelateCourt:{},supreme:{}};

        if (_.has(stareDocument, 'body') && stareDocument.body !== null && stareDocument.body !== '') {
           var body = JSON.parse(_.get(stareDocument, 'body'));
            if (_.has(body, 'tribunal') && body.tribunal !== null) {
                courts.court = {
                        entranceDate: body.fechaIngresoPimera,
                        rol: body.ritCausaPrimera,
                        name: body.tribunal.trim(),
                        sentenceDate: body.fechaDicSentenciaPrimera,
                        result: body.resultadoPrimera
                    }
                if (_.has(body, 'corte') && body.corte !== null) {
                    courts.appelateCourt = {
                        entranceDate: body.fechaIngresoApe,
                        rol: body.rolApelacion,
                        resource: body.recursoApelacion,
                        name: body.corte,
                        result: body.resultadoApe
                    }
                    if (_.has(body, 'rolSuprema') && body.rolSuprema !== null) {
                        courts.supreme = {
                            entranceDate: body.fechaIngSuprema,
                            rol: body.rolSuprema,
                            resource: body.recursoSuprema,
                            name: 'Corte Suprema',
                            result: body.resultadoSuprema
                        }
                    }
                    else {
                        resolve({
                            name: 'courts',
                            index: opts.index,
                            value: null
                        });
                    }
                }
                else {
                    resolve({
                        name: 'courts',
                        index: opts.index,
                        value: null
                    });
                }
            } else {
                resolve({
                    name: 'courts',
                    index: opts.index,
                    value: null
                });
            }
        } else {
            resolve({
                name: 'courts',
                index: opts.index,
                value: null
            });
        }

        resolve({
            name: 'courts',
            index: opts.index,
            value: courts
        });
    })
}

module.exports = exports = calculate;