# StArE.js (Node.js Server version)

![npm](https://img.shields.io/npm/v/@stare.js/stare.js-server)
![npm](https://img.shields.io/npm/dm/@stare.js/stare.js-server)
[![Build Status](https://travis-ci.com/StArE-js/stare.js-server.svg?branch=master)](https://travis-ci.com/StArE-js/stare.js-server)
[![Coverage Status](https://coveralls.io/repos/github/StArE-js/stare.js-server/badge.svg?branch=master)](https://coveralls.io/github/StArE-js/stare.js-server?branch=master)
![NPM](https://img.shields.io/npm/l/@stare.js/stare.js-server)

## Description
StArE.js is an open source project intended to facilitate developers the creation of alternative visualizations of search engine results page (SERP). StArE.js provides a modular and extensible processing pipeline capable of (1) transforming SERP, (2) extracting features from individual search results, and (3) visualizing SERP in multiple ways.

## Installation

```bash
npm i @stare.js/stare.js-server
```
## How to use

```js
const stare = require('@stare.js/stare.js-server')({...options});

stare('google', 'What is love?', 10, ['ranking', 'language'])
  .then(result => {
    console.log(result);
  })
  .catch(err => {
    console.error(err);
  });
```

Where the arguments of the funtction are:

| Argument | Type | Description |
| ----- | ----- | ----- |
| engine | <code>String</code> | Search Engine to use (requires previous configuration for some cases) |
| query |<code>String</code> | Search Query (self explanatory)
| number of results to show | <code>Number</code> | Maximun numbers of documents/results to get from the engine |
| metrics | <code>Array</code> | Metrics to get from each document |

You can find the most basic full example in the [examples folder](/examples/).

## Resources

* [npm package](https://www.npmjs.com/package/@stare.js/stare.js-server)
* [Documentation](/docs/)
* [Examples](/examples/)

## Extensions

StArE.js is currently extended with the following plugins:

### SERPs

| SERP | Function name | Description | Documentation |
| ------ | ------ | ------ | ------ |
| Google | <code>google</code> | Handler for SERPs obtained through the Google Custom Search JSON API | [See docs](/docs/SERP.md#google) |
| Bing | <code>bing</code> | Handler for SERPs obtained through the Bing web search API | [See docs](/docs/SERP.md#bing) |
| Ecosia | <code>ecosia</code> | Handler for SERPs obtained from ecosia through a web scrapper | [See docs](/docs/SERP.md#ecosia) |
| ElasticSearch | <code>elasticsearch</code> | Handler for SERPs obtained from ElasticSearch (only basic support) via request-promise | [See docs](/docs/SERP.md#elasticsearch) |
| Solr | <code>solr</code> | Handler for SERPs obtained from Solr (only basic support) via request-promise | [See docs](/docs/SERP.md#solr) |
| AWS Search Cloud | <code>searchcloud</code> | Handler for SERPs obtained from AWS Search Cloud (only basic support) via request-promise | [See docs](/docs/SERP.md#searchcloud) |

| Metrics | Metric name | Description | Documentation |
| ------ | ------ | ------ | ------ |
| Perspicuity | <code>perspicuity</code> | Reading Ease for English and Perspicuity for Spanish | [See docs](/docs/METRICS.md#perspicuity) |
| Language | <code>language</code> | Detect the most probable language for a document | [See docs](/docs/METRICS.md#language) |
| Length of Documents | <code>length</code> | Calculate the length in characters of a Document | [See docs](/docs/METRICS.md#length) |
| Ranking | <code>ranking</code> | Calculate the length in characters of a Document | [See docs](/docs/METRICS.md#ranking) |
| Keywords Position | <code>keywords-position</code> | Gets the position of the query terms (keywords) inside the text body of the document | [See docs](/docs/METRICS.md#keywords-position) |
| Links | <code>links</code> | Gets the relation between the documents based on the url that the text body contains. Only for HTML documents. | [See docs](/docs/METRICS.md#links) |
| Multimedia | <code>multimedia</code> | Gets the amount of multimedia data on the document (audio, video, images) that the text body contains. Only for HTML documents. | [See docs](/docs/METRICS.md#multimedia) |

As is explained in the docs you can create your own extensions for [SERP](/docs/SERP.md#create-your-own-extensions) and [metrics](/docs/METRICS.md#create-your-own-extensions) support.

Please read the full documentation [here](/docs/INDEX.md).

## Debug / Logging

StArE.js is powered by [debug](https://github.com/visionmedia/debug).
In order to see all the debug output, run your app with the environment variable
`DEBUG` including the desired scope.

To see the output from all of StArE.js's debugging scopes you can use:

```
DEBUG=stare.js
```

## Contributors

- [Roberto González-Ibáñez](https://github.com/rgonzal/)
- [Camila Márquez](https://github.com/bellyster/)
- [Daniel Gacitúa](https://github.com/dgacitua/)
- [Franz Farbinger](https://github.com/DarkAnimat/)
- [Diego Salazar S.](https://github.com/d-salazar-se/)

## License
[MIT](LICENSE)

