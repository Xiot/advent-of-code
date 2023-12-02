// require('@babel/register');
require('dotenv').config();
const { isObject } = require('lodash');

const fs = require('fs');
const process = require('process');

const clipboard = require('clipboardy');
const { buildFilename, args } = require('./utils');

const [year, day, part, inputName] = args();

const filename = buildFilename(year, day, 'index.js');
const question = require('../' + filename);

const exportKeys = Object.keys(Object.getPrototypeOf(question));
// If there are no exports then just quit.
if (exportKeys.length === 0) {
  process.exit(1);
}

global.args = {
  year,
  day,
  part,
  inputName,
  isSample: inputName === 'sample.txt',
};

const rawInput = fs.readFileSync(buildFilename(year, day, inputName), 'utf-8');

const input = question.parse?.(rawInput) ?? rawInput;

const startTime = Date.now();
const fn = question[`part${part}`];
Promise.resolve(fn?.(input)).then(async result => {
  const duration = Date.now() - startTime;

  if (result != null) {
    const serialized = isObject(result) ? JSON.stringify(result, undefined, 2) : result;

    await copy(String(serialized));
    process.send?.({ result: serialized, duration });
  }
});

const isWsl = require('is-wsl');
function copy(value) {
  if (!isWsl) {
    return clipboard.write(value);
  }

  return new Promise((resolve, reject) => {
    const child = require('child_process').exec(`echo -n '${value}' | clip.exe`);
    child.on('close', (code, sig) => {
      if (code === 0) {
        resolve();
      } else {
        reject(sig);
      }
    });
  });
}
