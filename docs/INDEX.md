# StArE.js Server version documentation.

## Stare web search

<a name="stare"></a>

Only public function exported from this package, follows this signature:

### stare(engine, query, numberOfResults, metrics) ⇒ <code>Promise</code>
Makes a request to the specified search engine which returns a <code>Promise</code> to the SERP with the specified metrics.

**Kind**: global function  
**Returns**: <code>Promise</code> - An object with the standardized result page (SERP)  

| Param | Type | Description |
| --- | --- | --- |
| engine | <code>String</code> | SERP to use [<code>google</code>\|<code>bing</code>\|<code>ecosia</code>\|<code>elasticsearch</code>\|<code>solr</code>\|<code>searchcloud</code>\|<code>baremo</code>\|<code>sence</code>] |
| query | <code>String</code> | Search query |
| numberOfResults | <code>Number</code> | Maximun number of documents to return (default: <code>10</code>) |
| metrics | <code>Array</code> | Array with the name (as <code>String</code>) of the metrics to calculate |

The way to call the function is as follows:

```js
stare(engine, query, numberOfResults, metrics);

/* Example */
stare('google', 'What is love?', 10, ['length', 'perspicuity']);
```

Which response will have the following format

```json
{
  "totalResults": "983,000,000",
  "searchTerms": "What is love?",
  "numberOfItems": 10,
  "startIndex": 1,
  "documents": [
    {
      "title": "What is love?",
      "link": "https://theconversation.com/what-is-love-139212",
      "snippet": "Jul 14, 2020 ... Love is an emotion that keeps people bonded and committed to one another. \nFrom an evolutionary psychology perspective, love evolved to keep ...",
      "image": "https://images.theconversation.com/files/344437/original/file-20200629-96659-1qzyyt0.jpg?ixlib=rb-1.1.0&rect=221%2C597%2C4691%2C2345&q=45&auto=format&w=1356&h=668&fit=crop",
      "metrics": {
        "keywords-position": {
          "documentLength": 1523,
          "keywords": {
            "What": [233, 544],
            "is": [239, 301, 322, 489],
            "love?": [242]
          }
        },
        "language": "english",
        "length": 1523,
        "links": [
          "theconversation.com",
          "google.com",
          "apple.news",
          "flipboard.com",
          "twitter.com",
          "facebook.com",
          "linkedin.com",
          "jstor.org",
          "wiley.com",
          "apa.org",
          "sciencedirect.com",
          "google.com.au",
          "unirioja.es",
          "ovid.com",
          "sagepub.com",
          "oup.com"
        ],
        "multimedia": {
          "video": 0,
          "img": 11,
          "audio": 0
        },
        "perspicuity": 187,
        "ranking": 1
      }
    },
  // ... 9 more items
  ]
}
```

## Options

```js
let stareOptions = {
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
    apiKey: '',  // process.env.GOOGLE_API_KEY
    apiCx: ''    // process.env.GOOGLE_API_CX
  },
  /* Bing API */
  bing: {
    serviceKey: ''   // process.env.BING_SERVICE_KEY
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
```

| Property | Type | Description |
| --- | --- | --- |
| engines | <code>Array</code> | Array of strings of the code name of the SERPs to load, each one requires some kind of configuration that must be specified in an object with its name [as says in the docs](/docs/SERP.md) |
| personalMetrics | <code>Object</code> | Object with the pair <code>key-value</code> format where the <code>key</code> is the name of the metric/feature and the value is a reference to a function which returns in the StArE.js format. |
| personalSERPs | <code>Object</code> | Object with the pair <code>key-value</code> format where the <code>key</code> is the name of the engine and the value is a reference to a function which returns the SERP in the StArE.js format. |
| numberOfResults | <code>Number</code> | Number of results that the SERPs will return (default: <code>10</code>).
| google | <code>Object</code> | Object with Google API Key/CX for Custom Search |
| bing | <code>Object</code> | Object with the Bing Service Key for Web Search |
| ecosia | <code>Object</code> | Object with the Ecosia configuration |
| elasticsearch | <code>Object</code> | Object with the ElasticSearch properties |
| solr | <code>Object</code> | Object with the Solr properties |
| searchcloud | <code>Object</code> | Object with the AWS Search Cloud properties |
| baremo | <code>Object</code> | Object with the Baremo Jurisprudencial properties |
| sence | <code>Object</code> | Object with the Catálogo Nacional de Planes Formativos (SENCE) properties |

## Metrics Extensions

| Metric | Description | Docs |
| --- | --- | --- |
| <code>language</code> | The language of the document | [See docs](/docs/METRICS.md#language) |
| <code>length</code> | Length of the document which considers only the number of characters in the text of the document. | [See docs](/docs/METRICS.md#length) |
| <code>perspicuity</code> | Perspicuity or Reading Ease (English) the document based on Flesh 1984 (en) and Szigriszt 1992 (es). | [See docs](/docs/METRICS.md#perspicuity) |
| <code>ranking</code> | Ranking of the document in the query results pages (SERP), considering all the documents. | [See docs](/docs/METRICS.md#ranking) |
| <code>keywords-position</code> | Gets the position of the query terms (keywords) inside the text body of the document | [See docs](/docs/METRICS.md#keywords-position) |
| <code>links</code> | Gets the relation between the documents based on the url that the text body contains. Only for HTML documents. | [See docs](/docs/METRICS.md#links) |
| <code>multimedia</code> | Gets the amount of multimedia data on the document (audio, video, images) that the text body contains. Only for HTML documents. | [See docs](/docs/METRICS.md#multimedia) |
| <code>category</code> | Gets the category associated within a sentence (Accidente del trabajo o Enfermedad profesional). Only for Baremo Jurisprudencial. | [See docs](/docs/METRICS.md#category) |
| <code>courts</code> | Gets the three possible courts where the sentece about work-related accident or sickness was passed and the data associated like date and identification number (Tribunal de primera instancia, Corte de apelaciones, Corte suprema). Only for Baremo Jurisprudencial. | [See docs](/docs/METRICS.md#courts) |
| <code>Injuries</code> | Gets the injuries that a victim suffered due the work-related accident or sickness. Based on WHO ICD-10  classification (English) or OMS CIE-10 classification (Spanish). Only for Baremo Jurisprudencial. | [See docs](/docs/METRICS.md#injuries) |
| <code>lawsuit-ammount</code> | Gets the amounts related to the lawsuit according to the sentence of work-related accident or sickness. Only for Baremo Jurisprudencial. | [See docs](/docs/METRICS.md#lawsuit-amount) |
| <code>personal-victim-data</code> | Gets the personal data from the victim of the work-related accident or sickness. Only for Baremo Jurisprudencial. | [See docs](/docs/METRICS.md#persona-victim-data) |
| <code>modules</code> | Gets the modules associated (ID and name) to a training plan. Only for Catálogo Nacional de Planes Formativos | [See docs](/docs/METRICS.md#modules) |
| <code>sector</code> | Gets the sector category associated to a training plan. Only for Catálogo Nacional de Planes Formativos (SENCE). | [See docs](/docs/METRICS.md#sector) |
| <code>subsector</code> | Gets the subsector category associated to a training plan. Only for Catálogo Nacional de Planes Formativos (SENCE). | [See docs](/docs/METRICS.md#subsector) |

As is explained in the docs you can create your own extensions for [SERP](/docs/SERP.md#create-your-own-extensions) and [metrics](/docs/METRICS.md#create-your-own-extensions) support.


For details on currently supported feature extractor/metrics extensions or how to create you own, [see the docs for metrics](/docs/METRICS.md).

## SERP Extensions

| SERP | Name | Requires API key | Requires Object Config | Docs |
| --- | --- | --- | --- | --- |
| Google | <code>google</code> | Yes | No | [See docs](/docs/SERP.md#google) |
| Bing | <code>bing</code> | Yes | No | [See docs](/docs/SERP.md#bing) |
| Ecosia | <code>ecosia</code> | No | No | [See docs](/docs/SERP.md#ecosia) |
| ElasticSearch | <code>elasticsearch</code> | No | Yes | [See docs](/docs/SERP.md#elasticsearch) |
| Solr | <code>solr</code> | No | Yes | [See docs](/docs/SERP.md#solr) |
| AWS Search Cloud | <code>searchcloud</code> | No | Yes | [See docs](/docs/SERP.md#searchcloud) |
| Baremo | <code>baremo</code> | No | Yes | [See docs](/docs/SERP.md#baremo) |
| Catálogo Nacional de Planes Formativos (SENCE) | <code>sence</code> | No | Yes | [See docs](/docs/SERP.md#sence) |

For details on currently supported SERP extensions or how to create you own, [see the docs for SERP](/docs/SERP.md).

---
Powered by [jsdoc](https://jsdoc.app/)
