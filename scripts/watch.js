const chokidar = require('chokidar');
const { fork } = require('child_process');
const { waitForKey } = require('../utils/io');
const { buildFilename } = require('./utils');

module.exports = {
  async watch(year, day) {

    const filename = buildFilename(year, day, 'index.js');

    let part = 1;
    let inputName = 'sample.txt';
    let debug = true;

    function launch(year, day, part, inputName) {
      let questionResult;
      let hasOutput = false;

      const child = fork('./scripts/launch.js', [year, day, part, inputName], {
        stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
      });

      child.on('spawn', () => {
        console.log(`\n${year} ${String(day).padStart(2, '0')} - ${inputName}\n${'='.repeat(30)}`);
      });

      child.on('message', result => {
        questionResult = result;
      });

      debug && child.stdout.on('data', data => {
        hasOutput = true;
        process.stdout.write(data);
      });

      child.stderr.on('data', data => process.stderr.write(data));
      child.on('close', () => {
        hasOutput && console.log('='.repeat(30));
        if (questionResult) {
          console.log(`${formatDuration(questionResult.duration)} Part ${'I'.repeat(part)}: ${questionResult.result}`);
        }
      });
    }

    const watcher = chokidar.watch(filename, {
      persistent: true,
    });

    watcher.on('change', () => {
      launch(year, day, part, inputName);
    });

    launch(year, day, part, inputName);

    console.log('s = sample, i = input, 1 = part1, 2 = part2, d = debug, q = quit');
    while (true) {      
      const key = (await waitForKey()).name;

      if (key === 'q') break;

      if (key === 's') {
        inputName = 'sample.txt';
      } else if (key === 'i') {
        inputName = 'input.txt';
      } else if (key === '1') {
        part = 1;
        inputName = 'sample.txt';
      } else if (key === '2') {
        part = 2;
        inputName = 'sample.txt';
      } else if (key === 'd') {
        debug = !debug;      
      } else {
        continue;
      }
      launch(year, day, part, inputName);
    }

    watcher.close();
  },
};

function formatDuration(ms) {
  return `[${String(ms).padStart(5)}]`;
}
