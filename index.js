require('dotenv').config();

const { args } = require('./scripts/utils');

const { initialize } = require('./scripts/init');
const { download } = require('./scripts/download');
const { watch } = require('./scripts/watch');

const commands = {
  init: initialize,
  download,
  watch,
  ready: async (year, day) => {
    await initialize(year, day);
    await download(year, day);
    await watch(year, day);
  },
};

const [name, year, day, ...rest] = args();

const cmd = commands[name];
if (!cmd) {
  process.exit(0);
}

cmd(year, day, ...rest);
