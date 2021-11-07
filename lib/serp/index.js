/**
 * Responses must have the following format
 *
 * {
 *   resultados: string,
 *   terminos: string,
 *   items: integer,
 *   start: integer,
 *   documents: array,
 *     [{
 *       title: string,
 *       link: string,
 *       snippet: string,
 *       image: string
 *     }]
 * }
 *
 */

module.exports = {
  bing: require('./bing'),
  ecosia: require('./ecosia'),
  google:  require('./google'),
  elasticsearch:  require('./elasticsearch'),
  searchcloud: require('./searchcloud'),
  baremo: require('./baremo')
};