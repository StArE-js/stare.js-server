'use strict';

require('dotenv').config();
const debug = require('debug')('simple-express-server');
const app = require('express')();
const cors = require('cors');
const figlet = require('figlet');

app.use(cors());
app.options('*', cors());
const myMetrics = {
  a: require('./my-metrics/a'),
  b: require('./my-metrics/b')
};

const mySERPs = {
  personalSERP: require('./my-serps/my-serp')
};

const stare = require('../..')({
  engines: ['elasticsearch', 'solr','searchcloud', 'bing'],
  // engines: ['bing', 'ecosia', 'google', 'searchcloud', 'personalSERP'],
  // personalMetrics: myMetrics,
  // personalSERPs: mySERPs,
  // google: {
  //   apiKey: process.env.GOOGLE_API_KEY,
  //   apiCx: process.env.GOOGLE_API_CX
  // },
   bing: {
     serviceKey: process.env.BING_SERVICE_KEY,

   },
  elasticsearch: {
    baseUrl: 'http://143.110.239.29',
    _index: 'movies',
    _source: '_source',
    titleProperty: 'fields.title',
    bodyProperty: 'fields.plot',
    snippetProperty: 'fields.plot',
    imageProperty: 'fields.image_url'
  },
  solr: {
    baseUrl: 'http://localhost:8983',
    core: 'movies',
    titleProperty: 'fields.title',
    bodyProperty: 'fields.plot',
    snippetProperty: 'fields.plot',
    imageProperty: 'fields.image_url'
  },
});

app.get('/:engine', (request, response) => {
  let engine = request.params.engine;
  let { query, numberOfResults, metrics } = request.query;

  // let metrics = [];
  //let metrics = ['keywords-position', 'language', 'length', 'links', 'multimedia', 'perspicuity', 'ranking'];
    if (metrics) {
    metrics = metrics.split(',');
  } else {
    // Default metrics if not provided
    metrics = ['keywords-position', 'language', 'length', 'links', 'multimedia', 'perspicuity', 'ranking'];
  }

  //Checked input metrics
  
  console.log("List of input metrics:");
  console.log("-------------------");
  metrics.forEach(element => {
  console.log(element);
  });
  console.log("==================");



  stare(engine, query, numberOfResults, metrics)
    .then(result => response.status(200).json(result))
    .catch(err => response.status(500).json(err));
});

app.listen(process.env.SERVER_PORT, () => {
  debug(figlet.textSync('StArE.js-server'));
  debug(`App running on [http://localhost:${process.env.SERVER_PORT}]!`);
});
