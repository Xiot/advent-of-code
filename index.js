require('@babel/register');
require('dotenv').config();

const { args } = require('./scripts/utils');

const { initialize } = require('./scripts/init');
const { download } = require('./scripts/download');
const { watch } = require('./scripts/watch');

const commands = {
  init: initialize,
  download,
  watch,
};

const [name, year, day] = args();

const cmd = commands[name];
if (!cmd) {
  process.exit(0);
}

cmd(year, day);
