'use strict';

const debug = require('debug')('stare.js:server/serp/sence');
const _ = require('lodash');
const rp = require('request-promise');
const qs = require('qs');
const puppeteer = require('puppeteer');
const pdf2base64 = require('pdf-to-base64');


var headless = true;

const SEARCH_URL = 'https://sistemas.sence.cl/sipfor/Planes/Catalogo.aspx';

const camposAbrv = ['CodigoPlan', 'Sector', 'Subsector', 'PerfilesACodigoPlansociados', 'NivelCualificacion', 'Area', 'Subarea', 'Especialidad', 'Nombre', 'Duracion', 'DesOcupacionCampoLaboralAsociado', 'PerfilesOcupacionalesChileValora', 'RequisitosOTEC', 'InstrumentoHabilitanteParticipante', 'RequisitosIngreso', 'Competencia', 'Version', 'Estado']
const campoLink = "Link"
const campoBase64 = "DataPdf"
const campoModulos = "Modulos"
// const campoThumbnail = "Thumbnail"

var page = null;

async function Search(params) {
  return await (async () => {
    var docs = [];
    var totalResults = 0;
    var pageNumbers = 0;
    var browser = null;
    try {
      debug("Lanzando browser")
      browser = await puppeteer.launch({
        headless: headless,
        devtools: true
      });
      const LOADING_SELECTOR = '#loading';
      page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 })
      await page.goto(SEARCH_URL);
      var loaded = await page.waitForSelector(LOADING_SELECTOR, {
        hidden: true
      });
      if (loaded) {
        debug('Página cargada')
        // ActivateFields(params);
        debug("Activando todos los campos para los resultados");
        await page.evaluate(() => {
          //clicking Campos a Visualizar
          document.querySelector('a[href="#collapseOne"]').click();

          //Seleccionando campos cabecera
          var btnCampos = document.querySelectorAll('div#div_campos_cabecera  div');
          let camp_cabecera = []
          btnCampos.forEach((elem) => {
            if (!elem.classList.contains('active')) elem.click();
            camp_cabecera.push(elem.innerText.trim())
          })

          btnCampos = document.querySelectorAll('div#div_campos_informacion  div');
          let camp_info = []
          btnCampos.forEach((elem) => {
            if (!elem.classList.contains('active')) elem.click();
            camp_info.push(elem.innerText.trim())
          })
        });

        debug("Escribiendo parámetros de búsqueda")
        const SELECTOR_INPUT_NOMBRE = 'input#txtNombrePlan';
        await page.focus(SELECTOR_INPUT_NOMBRE);
        await page.keyboard.type(params.query);


        debug("Click en buscar");
        //Clicking Buscar
        await page.evaluate(() => {
          const BOTON_BUSCAR_SELECTOR = 'a[href="javascript:buscar();"]';
          const buttonBuscar = document.querySelector(BOTON_BUSCAR_SELECTOR);
          buttonBuscar.click();
        })

        //Waiting for loading
        debug("Esperando que se termine la carga")
        loaded = await page.waitForSelector(LOADING_SELECTOR, {
          hidden: true
        });

        if (loaded) {
          //Check if results exists
          let table_empty = '.dataTables_empty';
          let td = await page.$(table_empty);
          let isThereResults = td === null;
          if (isThereResults) {
            //Getting resultsNumber, resultsPerPage and pageNumber
            //Mostrando registros del 1 al 10 de un total de 601 registros
            const pageNumber = await page.evaluate(() => {
              const STATUS_SELECTOR = "#tbSearch_info";
              const divStatus = document.querySelector(STATUS_SELECTOR);
              const textStatus = divStatus.innerText.trim();
              const splitedTextStatus = textStatus.split(' ');
              const resultsNumber = parseInt(splitedTextStatus[10], 10);
              const resultsPerPage = parseInt(splitedTextStatus[5], 10);

              const pageNumber = Math.ceil(resultsNumber / resultsPerPage);
              return {pageNumber: pageNumber, totalResults: resultsNumber};
            })

            pageNumbers = pageNumber.pageNumber;
            totalResults = pageNumber.totalResults;

            debug("Total de páginas: " + pageNumbers);
            debug("Total de resultados: " + totalResults);

            const PLAN_ROW_SELECTOR = '#tbSearch tbody tr';
            //looping until theres no more pages
            for (let k = pageNumbers; k > 0; k--) {

              const filas = await page.evaluate((selector) => {
                const rows = document.querySelectorAll(selector);
                return Array.from(rows, row => {
                  const columns = row.querySelectorAll('td');
                  return Array.from(columns, column => column.innerText);
                });
              }, PLAN_ROW_SELECTOR);

              const linksPdf = await page.evaluate((selector) => {
                const rows = document.querySelectorAll(selector);
                const planPdfs = Array.from(rows, row => {
                  const columns = row.querySelectorAll('td');
                  const last = columns[columns.length - 1];
                  return last.children[0].href;
                })
                return planPdfs;
              }, PLAN_ROW_SELECTOR)

              debug('Parseando resultados...');
              for (let r = 0; r < filas.length; r++) {
                var doc = {};

                for (let i = 0; i < filas[r].length - 1; i++) {
                  var fieldName = camposAbrv[i];
                  doc[fieldName] = filas[r][i];
                }
                //Accion añadiendo link a propiedad de documento
                doc[campoBase64] = await pdf2base64(linksPdf[r]);
                doc[campoLink] = linksPdf[r];

                //Rescatar thumbnail (miniatura de paǵina 1 de pdf) para guardar en image
                // var b64string = doc[campoBase64];
                // var options = {
                //   width: 255,
                //   height: 330,
                //   density: 330
                // }
                // const convert = fromBase64(b64string, options);
                // var img = await convert(1, true);
                // doc[campoThumbnail] = img.base64;

                debug('Parseando módulos...');
                await page.evaluate((selector, rowNumber) => {
                  const rows = document.querySelectorAll(selector);
                  const tds = rows[rowNumber].querySelectorAll('td');
                  const last = tds[tds.length - 1];
                  last.children[1].click();
                }, PLAN_ROW_SELECTOR, r);

                const MODAL_SELECTOR = '#select_modulo'
                await page.waitForSelector(MODAL_SELECTOR, {
                  visible: true
                });

                const DIV_MODULOS_SELECTOR = '.modal-body #div_campos_modulo div.input-group-btn';
                var mods = await page.evaluate((selectorDivs) => {
                  const divs = document.querySelectorAll(selectorDivs);
                  const MODULOS_URL = 'https://sistemas.sence.cl/sipfor/Planes/';
                  const modulos = Array.from(divs, div => {
                    const buttons = div.querySelectorAll('button');
                    const enlace = buttons[0].outerHTML.split('\'')[1].trim();
                    const codModulo = enlace.split('id=')[1];
                    return {
                      CodigoModulo: codModulo,
                      Link: MODULOS_URL + buttons[0].outerHTML.split('\'')[1].trim(),
                      Duracion: parseInt(buttons[1].innerText.trim(), 10),
                      Nombre: buttons[2].innerText.trim()
                    };
                  })
                  return modulos;
                }, DIV_MODULOS_SELECTOR);

                for (let m = 0; m < mods.length; m++) {
                  mods[m][campoBase64] = await pdf2base64(mods[m].Link);
                }
                doc[campoModulos] = mods;


                await page.evaluate(() => {
                  const CLOSE_MODAL_BUTTON_SELECTOR = '.modal-footer button';
                  const buttonCerrar = document.querySelector(CLOSE_MODAL_BUTTON_SELECTOR);
                  buttonCerrar.click();
                });

                await page.waitForSelector(MODAL_SELECTOR, {
                  hidden: true
                });
                await page.waitForSelector('.modal-backdrop.fade', {
                  hidden: true
                })
                
                docs.push(doc);
                //Check if results size was reached
                if(params.size === docs.length){
                  await browser.close();
                  return {
                    docs: docs, 
                    totalResults: totalResults
                  };
                }
              }


              debug('Siguiente página')
              await page.evaluate(() => {
                const NEXT_BUTTON_SELECTOR = 'li#tbSearch_next';
                const buttonSiguiente = document.querySelector(NEXT_BUTTON_SELECTOR);
                buttonSiguiente.click();
              })

              var loadedNextResults = await page.waitForSelector(LOADING_SELECTOR, {
                hidden: true
              });

            }
          }
        }
      }
      await browser.close();
      return {
        docs: docs, 
        totalResults: totalResults
      };
    } catch (err) {
      debug(err);
      if (browser !== null) await browser.close();
      return {docs:[],totalResults:0};
    }
  })();
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
  
  try {
    const stareOptions = global.stareOptions;
    if (!_.has(stareOptions, 'sence')
      || !_.has(stareOptions.sence, 'headless')
    ) {
      throw new Error("NO_SENCE_OPTIONS");
    }
  } catch (e) {
    debug("Sence options not correctly configurated");
    process.exit(e.code);
  }

  var headless = _.get(stareOptions.sence, 'headless');

  return new Promise((resolve, reject) => {
    let searchUrl = `${SEARCH_URL}`;

    debug(`SENCE Search url [${searchUrl}]`);

    rp({
      uri: searchUrl
    })
      .then(
        async () => {
          let formattedResponse = {
            totalResults: 0,
            searchTerms: query,
            numberOfItems: 0,
            startIndex: queryParams.from + 1,
            documents: []
          };

          var results = await Search({
            query: queryParams.q,
            size: queryParams.size,
            from: queryParams.from
          })

          formattedResponse.documents = results.docs.map((item) => {
            return {
              title: `${_.get(item, 'CodigoPlan')}-${_.get(item, 'Nombre')}`,
              link: _.get(item, campoLink),
              body: JSON.stringify(item),
              snippet: _.get(item, 'DesOcupacionCampoLaboralAsociado'),
              image: _.get(item, campoBase64)
            }
          });

          formattedResponse.totalResults = results.totalResults;
          formattedResponse.numberOfItems = results.docs.length;
          formattedResponse.startIndex = queryParams.from;

          resolve(formattedResponse);
        },
        err => reject(err))
      .catch(err => reject(err));
  });
}

module.exports = exports = getResultPages;
