'use strict';

const { reject, now } = require('lodash');
const debug = require('debug')('stare.js:server/metrics/lawsuit-ammount');
const _ = require('lodash');
const http = require('axios');
const URL_MI_INDICADOR = `https://mindicador.cl/api/{indicador}/{fecha}`;
const ipc_anuales_1990_2021 = [{ "ano": 2025, "ipc": 3.6 }, { "ano": 2024, "ipc": 3.6 }, { "ano": 2023, "ipc": 3.6 }, { "ano": 2022, "ipc": 3.6 }, { "ano": 2021, "ipc": 3.6 }, { "ano": 2020, "ipc": 3.05 }, { "ano": 2019, "ipc": 2.56 }, { "ano": 2018, "ipc": 2.43 }, { "ano": 2017, "ipc": 2.19 }, { "ano": 2016, "ipc": 3.8 }, { "ano": 2015, "ipc": 4.35 }, { "ano": 2014, "ipc": 4.39 }, { "ano": 2013, "ipc": 1.93 }, { "ano": 2012, "ipc": 3.02 }, { "ano": 2011, "ipc": 3.34 }, { "ano": 2010, "ipc": 1.42 }, { "ano": 2009, "ipc": 0.45 }, { "ano": 2008, "ipc": 8.71 }, { "ano": 2007, "ipc": 4.39 }, { "ano": 2006, "ipc": 3.4 }, { "ano": 2005, "ipc": 3.05 }, { "ano": 2004, "ipc": 1.06 }, { "ano": 2003, "ipc": 2.82 }, { "ano": 2002, "ipc": 2.49 }, { "ano": 2001, "ipc": 3.57 }, { "ano": 2000, "ipc": 3.84 }, { "ano": 1999, "ipc": 3.34 }, { "ano": 1998, "ipc": 5.12 }, { "ano": 1997, "ipc": 6.14 }, { "ano": 1996, "ipc": 7.38 }, { "ano": 1995, "ipc": 8.23 }, { "ano": 1994, "ipc": 11.52 }, { "ano": 1993, "ipc": 12.73 }, { "ano": 1992, "ipc": 15.54 }, { "ano": 1991, "ipc": 21.98 }, { "ano": 1990, "ipc": 25.91 }];
const uf_anuales_1990_2021 =  [ { ano: 1990, uf: 4896.194657534247 },
    { ano: 1991, uf: 6119.216767123289 },
    { ano: 1992, uf: 7535.737150684933 },
    { ano: 1993, uf: 8745.650191256831 },
    { ano: 1994, uf: 9876.334246575347 },
    { ano: 1995, uf: 11057.22495890411 },
    { ano: 1996, uf: 11965.120438356167 },
    { ano: 1997, uf: 12865.904808743164 },
    { ano: 1998, uf: 13648.340465753416 },
    { ano: 1999, uf: 14352.765287671224 },
    { ano: 2000, uf: 14868.622383561633 },
    { ano: 2001, uf: 15408.869480874328 },
    { ano: 2002, uf: 15990.696493150692 },
    { ano: 2003, uf: 16380.1553150685 },
    { ano: 2004, uf: 16892.21252054794 },
    { ano: 2005, uf: 17030.37568306014 },
    { ano: 2006, uf: 17526.019342465766 },
    { ano: 2007, uf: 18162.396465753423 },
    { ano: 2008, uf: 18789.29800000001 },
    { ano: 2009, uf: 20429.08800546449 },
    { ano: 2010, uf: 21007.399479452044 },
    { ano: 2011, uf: 21171.79761643834 },
    { ano: 2012, uf: 21846.379616438357 },
    { ano: 2013, uf: 22598.8479781421 },
    { ano: 2014, uf: 22980.898931506843 },
    { ano: 2015, uf: 23828.988821917792 },
    { ano: 2016, uf: 25018.513460490467 },
    { ano: 2017, uf: 26022.674754098334 },
    { ano: 2018, uf: 26571.92610958904 },
    { ano: 2019, uf: 27165.746301369843 },
    { ano: 2020, uf: 27854.39186301364 },
    { ano: 2021, uf: 28678.814453551877 } ]
  
  

/**
 *  Retrieves the Unidad de Fomento value from mindicador.cl REST API for the given specific date dd-mm-yyyy
 * @param {String} date 
 * @returns 
 */
function getUF(date) {
    let fecha = new Date(date);
    let year = fecha.getFullYear();
    return uf_anuales_1990_2021.find(element =>  element.ano === year).uf;
}

/**
 *  Calculates the Average Inflation rate and periods since a past year to today's year
 * @param {Number} pastDate Past  date (year YYYY
 * @returns 
 */
function getAverageInflationSince(pastDate) {
    let today = new Date().getFullYear();
    let ipcs = [];
    for (let i = pastDate + 1; i <= today; i++) {
        const element = i;
        let ipc = ipc_anuales_1990_2021.find(ind => { return ind.ano === element });
        ipcs.push(ipc);
    }
    let sum = 0;
    ipcs.forEach(i => {
        sum = sum + i.ipc
    })
    return {
        periods: ipcs.length,
        rate: sum / ipcs.length
    };
}


/**
 *  Calculates the present value of a value registered on the past using a fixed table of annual inflation(IPC) indicator from Chile.
 * @param {string} value Value in the past
 * @param {Number} pastDate Past  date (year YYYY)
 */
function getPresentValue(value, pastDate) {
    let past = new Date(pastDate);
    let inflation = getAverageInflationSince(past.getFullYear());
    let decimalInflation = inflation.rate / 100
    return value * ((1 + decimalInflation) ** inflation.periods);
}

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
        let ammount = null;
        if (_.has(stareDocument, 'body') && stareDocument.body !== null && stareDocument.body !== '') {
           var body = JSON.parse(_.get(stareDocument, 'body'));
            if (_.has(body, 'montoPrimeraDm') && body.montoPrimeraDm !== null) {
                ammount = {
                    otorgado: {
                        primera: body.montoPrimeraDm,
                        primeraPresente: Math.trunc(
                            getPresentValue(
                                parseInt(body.montoPrimeraDm),
                                body.fechaDicSentenciaPrimera
                            )
                        ).toString()
                    }
                }



                if (_.has(body, 'montoDemandadoDm') && body.montoDemandadoDm !== null) {
                    ammount.demandado = {
                        demandado: body.montoDemandadoDm,
                        demandadoPresente: Math.trunc(
                            getPresentValue(
                                parseInt(body.montoDemandadoDm),
                                body.fechaIngresoPimera
                            )
                        ).toString()
                    };
                }else{
                    resolve({
                        name: 'lawsuit-ammount',
                        index: opts.index,
                        value: null
                    });
                }
            }else{
                resolve({
                    name: 'lawsuit-ammount',
                    index: opts.index,
                    value: null
                });
            }
            _.extend(ammount.otorgado, {
                primeraUF: (parseInt(body.montoPrimeraDm) / getUF(body.fechaDicSentenciaPrimera) ).toFixed(2).toString()
            })
            _.extend(ammount.otorgado, {
                primeraPresenteUF: (parseInt(ammount.otorgado.primeraPresente) / getUF(new Date())).toFixed(2).toString()
            });
            _.extend(ammount.demandado, {
                demandadoUF:( parseInt(body.montoDemandadoDm) / getUF(body.fechaDicSentenciaPrimera) ).toFixed(2).toString()
            });
            _.extend(ammount.demandado, {
                demandadoPresenteUF: ( parseInt(ammount.demandado.demandadoPresente) / getUF(new Date())).toFixed(2).toString()
            });
            resolve({
                name: 'lawsuit-ammount',
                index: opts.index,
                value: ammount
            });
        } else {
            resolve({
                name: 'lawsuit-ammount',
                index: opts.index,
                value: null
            });
        }
    })
}

module.exports = exports = calculate;