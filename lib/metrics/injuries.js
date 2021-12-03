'use strict';

const { reject } = require('lodash');
const _ = require('lodash');


/**
 * Defines the ammount of money requested by a person on a Lawsuit on from First Instance Tribunals to Supreme Court from the stare-format document based
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
        let injuries = {};

        if (_.has(stareDocument, 'body') && stareDocument.body !== null && stareDocument.body !== '') {
            var body = JSON.parse(_.get(stareDocument, 'body'));
            if (_.has(body, 'listaDetalleTopografico') && body.listaDetalleTopografico !== null) {
                injuries.affectedBodyParts = body.listaDetalleTopografico.split(";");
                injuries.affectedBodyParts = injuries.affectedBodyParts.map(element => {
                    return element.trim();
                })
            } else {
                resolve({
                    name: 'injuries',
                    index: opts.index,
                    value: null
                });;
            }
            //Check if there was medical diagnosis
            if (_.has(body, 'diagnosticoMedico') && body.diagnosticoMedico !== null) {
                injuries.medicalDiagnosis = body.diagnosticoMedico.split(";");
                injuries.medicalDiagnosis = injuries.medicalDiagnosis.map(element => {
                    return element.trim();
                })
                //fechaDiagnostico
                if (_.has(body, 'fechaDiagnostico') && body.fechaDiagnostico !== null) {
                    injuries.dateMedicalDiagnosis = body.fechaDiagnostico.trim();
                } else {
                    resolve({
                        name: 'injuries',
                        index: opts.index,
                        value: null
                    });;
                }
            } else {
                injuries = null
            }

            //Check if there was a sequel 
            if (_.has(body, 'secuela') && body.secuela !== null) {
                if (body.secuela.trim().toLowerCase()=== "si" || body.secuela.trim().toLowerCase()  === "con secuela" ) {
                    injuries.sequel = {}
                    if (_.has(body, 'diagnosticoSecuela') && body.diagnosticoSecuela !== null) {
                        injuries.sequel.listSequels = body.diagnosticoSecuela.split(";");
                        injuries.sequel.listSequels = injuries.sequel.listSequels.map(element => {
                            return element.trim();
                        })
                    } else {
                        resolve({
                            name: 'injuries',
                            index: opts.index,
                            value: null
                        });
                    }
                    if (_.has(body, 'fechaDiagnostico') && body.fechaDiagnostico !== null) {
                        injuries.sequel.dateDiagnosis = body.fechaDiagnostico
                    } else {
                        resolve({
                            name: 'injuries',
                            index: opts.index,
                            value: null
                        });
                    }
                    if (_.has(body, 'origenDatoSecuela') && body.origenDatoSecuela !== null) {
                        injuries.sequel.source = body.origenDatoSecuela.trim();
                    } else {
                        resolve({
                            name: 'injuries',
                            index: opts.index,
                            value: null
                        });
                    }
                }
            }
        } else {
            resolve({
                name: 'injuries',
                index: opts.index,
                value: null
            });
        }

        resolve({
            name: 'injuries',
            index: opts.index,
            value: injuries
        });
    })
}

module.exports = exports = calculate;