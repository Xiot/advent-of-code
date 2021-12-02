require('@babel/register');
require('dotenv').config();

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
const result = fn?.(input);
const duration = Date.now() - startTime;

if (result) {
  clipboard.writeSync(String(result));

  process.send?.({ result, duration });
}
