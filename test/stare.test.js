/**
 * Test have been written for jest.
 * Docs here: https://jestjs.io/docs/en/getting-started
 */
require('dotenv').config();
require('../lib/config/defaultOptions.js');

// global.stareOptions.google.apiKey = process.env.GOOGLE_API_KEY || '';
// global.stareOptions.google.apiCx = process.env.GOOGLE_API_CX || '';
// global.stareOptions.bing.serviceKey = process.env.BING_SERVICE_KEY || '';

require('./metrics.test');
require('./scrapper.test');
require('./serp.test');