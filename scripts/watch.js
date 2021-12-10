const chokidar = require('chokidar');
const { fork } = require('child_process');
const { waitForKey } = require('../utils/io');
const { buildFilename } = require('./utils');
const { debounce } = require('lodash');

module.exports = {
  async watch(year, day) {

    const filename = buildFilename(year, day, 'index.js');

    let part = 1;
    let inputName = 'sample.txt';
    let debug = true;

    let currentChild;
    function launch(year, day, part, inputName) {
      
      if (currentChild) {
        if (currentChild.exitCode === null) {
          currentChild.kill();
        }
      }      
      
      let questionResult;
      let hasOutput = false;

      const child = fork('./scripts/launch.js', [year, day, part, inputName], {
        stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
        env: {...process.env, DEBUG: debug ? '1' : '0'}
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
      child.on('close', (code, signal) => {
        if (signal === 'SIGTERM') {         
          return;
        }
        hasOutput && console.log('='.repeat(30));
        if (questionResult) {
          console.log(`${formatDuration(questionResult.duration)} Part ${'I'.repeat(part)}: ${questionResult.result}`);
        }
      });
      currentChild = child;
      return child;
    }

    const watcher = chokidar.watch(filename, {
      persistent: true,
      atomic: true
    });
    
    watcher.on('change', debounce(() => {
      launch(year, day, part, inputName);
    }, 2000, {leading: true, trailing: false}));

    launch(year, day, part, inputName);

    console.log('s = sample, i = input, 1 = part1, 2 = part2, d = debug, q = quit');
    while (true) {      
      const key = (await waitForKey()).name;

      if (key === 'q') break;

      if (key === 's') {
        inputName = 'sample.txt';
      } else if (key === 'i') {
        debug = false;
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
