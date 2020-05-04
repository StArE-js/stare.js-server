'use strict';

require('dotenv').config();
const debug = require('debug')('simple-express-server');
const app = require('express')();
const cors = require('cors');

app.use(cors());
app.options('*', cors());

const myMetrics = {
  a: require('./my-metrics/a'),
  b: require('./my-metrics/b')
};

const stare = require('../..')({
  engines: ['google'],
  personalMetrics: myMetrics,
  googleApiKey: process.env.GOOGLE_API_KEY,
  googleApiCx: process.env.GOOGLE_API_CX
});

app.get('/:engine', (request, response) => {
  let engine = request.params.engine;
  let { query, pageNumber } = request.query;

  let metrics = ['ranking', 'links'];

  stare(engine, query, pageNumber, metrics)
    .then(result => {
      response.json(result);
    })
    .catch(err => {
      debug(`Error: %O`, err);
      response.status(500).json(err);
    });
});

app.listen(process.env.SERVER_PORT, () => {
  debug(`app listening on [http://localhost:${process.env.SERVER_PORT}]!`);
});