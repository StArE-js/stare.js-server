'use strict';

/**
 * @global
 */
global.stareOptions = {
  /* required SERP, each must fullfill a condition to be properly used */
  engines: [],
  /* Metrics modules/function created by the user */
  personalMetrics: {},
  /* SERPs modules/function created by the user */
  personalSERPs: {},
  /* Default number of results to get from the SERP */
  numberOfResults: 10,
  /* Google API */
  google: {
    apiKey: '',
    apiCx: ''
  },
  /* Bing API */
  bing: {
    serviceKey: ''
  },
  /* Ecosia */
  ecosia: {
    resultsPerPage: 10
  },
  /* ElasticSearch config */
  elasticsearch: {
    baseUrl: 'http://localhost:9200',
    _index: '_all',
    _source: '_source',
    titleProperty: 'title',
    bodyProperty: 'body',
    snippetProperty: 'snippet',
    imageProperty: 'image'
  },
  /* Solr config */
  solr: {
    baseUrl: 'http://localhost:8983',
    core: '',
    titleProperty: 'title',
    bodyProperty: 'body',
    snippetProperty: 'snippet',
    imageProperty: 'image'
  },
  searchcloud: {
    searchEndpoint: 'http://search-movies-y6gelr4lv3jeu4rvoelunxsl2e.us-east-1.cloudsearch.amazonaws.com/',
    apiVersion: '2013-01-01',
    titleProperty: 'fields.title',
    bodyProperty: 'fields.plot',
    snippetProperty: 'fields.plot',
    imageProperty: 'fields.image_url'
  },
  /* Baremo config */
  baremo: {
    baseUrl: 'http://localhost:9200',
    _index: 'jurisprudencia',
    _source: '_source',
    titleProperty: 'caratulado',
    bodyProperty: 'attachment.content',
    snippetProperty: 'hechosFundantes',
    imageProperty: 'data',
    linkProperty: 'corte'
  },
  /*  Catálogo Nacional de Planes Formativos (SENCE) config */
  sence: {
    headless: true
  }
};