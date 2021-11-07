'use strict';

const debug = require('debug')('stare.js:server/test/serp.test.js');
const _ = require('lodash');

const ecosia = require('../lib/serp/ecosia');
const elasticsearch = require('../lib/serp/elasticsearch');
const google = require('../lib/serp/google');
const solr = require('../lib/serp/solr');

function toBeStareDocument(data) {
  expect(data).toHaveProperty('totalResults', expect.any(String));
  expect(data).toHaveProperty('searchTerms', expect.any(String));
  expect(data).toHaveProperty('numberOfItems', expect.any(Number));
  expect(data).toHaveProperty('startIndex', expect.any(Number));
  expect(data).toHaveProperty('documents', expect.any(Array));

  if (data.documents.length > 0) {
    expect(data).toHaveProperty(['documents', 0, 'title']);
    expect(data).toHaveProperty(['documents', 0, 'link']);
    expect(data).toHaveProperty(['documents', 0, 'snippet']);
    expect(data).toHaveProperty(['documents', 0, 'image']);
  }
}

describe('SERP bing', () => {
  const bing = require('../lib/serp/bing');
  
  test(`Succesfully get 'bing' results for query=jest and numberOfResults=1`, () => {
    return bing('jest', 1).then(data => toBeStareDocument);
  });

  test(`Failed to get 'bing' results for query=null and numberOfResults=1`, () => {
    return expect(bing(null, 1)).rejects.toThrow();
  });

  // test(`No bing.serviceKey set`, () => {
  //   global.stareOptions.bing.serviceKey = null;
  //   return expect(bing('jest', 1)).rejects.toThrow();
  // });
});

describe('SERP ecosia', () => {
  test(`Succesfully get 'ecosia' results for query=jest and numberOfResults=1`, () => {
    return ecosia('jest', 1).then(data => toBeStareDocument);
  });

  test(`Failed to get 'ecosia' results for query=null and numberOfResults=1`, () => {
    return expect(ecosia(null, 1)).rejects.toThrow();
  });
});

describe('SERP elasticsearch', () => {
  test(`Failed to get 'elasticsearch' results for query=null and numberOfResults=1`, () => {
    return expect(elasticsearch(null, 1)).rejects.toThrow();

  });

  test(`No stareOptions.elasticsearch set`, () => {
    global.stareOptions.elasticsearch = null;
    return expect(require('../lib/serp/elasticsearch')).rejects.toThrow();
  });
});

describe('SERP google', () => {
  test(`Succesfully get 'google' results for query=jest and numberOfResults=1`, () => {
    return google('jest', 1).then(data => toBeStareDocument);
  });

  test(`Failed to get 'google' results for query=null and numberOfResults=1`, () => {
    return expect(google(null, 1)).rejects.toThrow();
  });

  test(`No google.apiKey set`, () => {
    global.stareOptions.google.apiKey = null;
    return expect(google('jest', 1)).rejects.toThrow();
  });

  test(`No google.apiCx set`, () => {
    global.stareOptions.google.apiCx = null;
    return expect(google('jest', 1)).rejects.toThrow();
  });
});

describe('SERP solr', () => {
  test(`Failed to get 'solr' results for query=null and numberOfResults=1`, () => {
    return expect(solr(null, 1)).rejects.toThrow();
  });


  test(`No stareOptions.solr set`, () => {
    global.stareOptions.solr = null;
    return expect(require('../lib/serp/solr')).rejects.toThrow();
  });
});

describe('SERP AWS Search cloud', () => {
  const defaultOptions = _.assign({}, global.stareOptions.searchcloud);
  global.stareOptions.searchcloud = null;

  test(`Failed to import 'searchcloud' stareOptions not set`, () => {
    return expect(require('../lib/serp/searchcloud')).rejects.toThrow();
  });

  global.stareOptions.searchcloud = defaultOptions;
  const searchcloud = require('../lib/serp/searchcloud');

  test(`Succesfully get 'searchcloud' results for query=wolverine and numberOfResults=1`, () => {
    return searchcloud('wolverine', 1).then(data => toBeStareDocument);
  });

  test(`Failed to get 'searchcloud' results for query=null and numberOfResults=1`, () => {
    return expect(searchcloud(null, 1)).rejects.toThrow();
  });

});

describe('SERP baremo', () => {
  test(`Failed to get 'baremo' results for query=null and numberOfResults=1`, () => {
    return expect(baremo(null, 1)).rejects.toThrow();
  });

  test(`No stareOptions.baremo set`, () => {
    global.stareOptions.baremo = null;
    return expect(require('../lib/serp/baremo')).rejects.toThrow();
  });
});
