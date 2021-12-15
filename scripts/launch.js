require('@babel/register');
require('dotenv').config();
const {isObject} = require('lodash');

const fs = require('fs');
const process = require('process');

const clipboard = require('clipboardy');
const { buildFilename, args } = require('./utils');

const [year, day, part, inputName] = args();

const filename = buildFilename(year, day, 'index.js');
const question = require('../' + filename);

// If there are no exports then just quit.
if (Object.keys(question).length === 0) {
  process.exit(0);
}

const rawInput = fs.readFileSync(buildFilename(year, day, inputName), 'utf-8');

const input = question.parse?.(rawInput) ?? rawInput;

const startTime = Date.now();
const fn = question[`part${part}`];
Promise.resolve(fn?.(input)).then(result => {
  const duration = Date.now() - startTime;

  if (result) {
    const serialized = isObject(result) ? JSON.stringify(result, undefined, 2) : result;
    clipboard.writeSync(String(serialized));

    process.send?.({ result: serialized, duration });
  }
});