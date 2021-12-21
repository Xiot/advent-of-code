const chokidar = require('chokidar');
const { fork } = require('child_process');
const { debounce } = require('lodash');
const path = require('path');

const { waitForKey } = require('../utils/io');
const { buildFilename, solutionPath } = require('./utils');


module.exports = {
  async watch(year, day) {

    const filename = buildFilename(year, day, 'index.js');

    let part = 1;
    let inputName = 'sample.txt';
    let debug = true;

    let currentChild;

    process.on('beforeExit', () => {
      currentChild && currentChild.kill();
    });

    function launch(year, day, part, inputName) {
      
      if (currentChild) {
        if (currentChild.exitCode === null) {
          currentChild.kill();
        }
      }      
      
      let questionResult = null;
      let hasOutput = false;

      const child = fork('./scripts/launch.js', [year, day, part, inputName], {
        stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
        env: {
          ...process.env, 
          DEBUG: debug ? '1' : '0',
          SOLUTION_PATH: path.join(process.cwd(), solutionPath(year, day)),
          SOLUTION_OUTPUT_PATH: path.join(process.cwd(), solutionPath(year, day), 'output'),
          AOC_INPUT: path.join(process.cwd(), solutionPath(year, day), inputName)
        }
      });      

      child.on('spawn', () => {
        console.log(`\n${year} ${String(day).padStart(2, '0')} - ${inputName}\n${'='.repeat(30)}`);
      });

      child.on('message', result => {
        questionResult = result;
      });

      child.stdout.on('data', data => {
        if (!debug) return;
        hasOutput = true;
        process.stdout.write(data);
      });

      child.stderr.on('data', data => process.stderr.write(data));
      child.on('close', (code, signal) => {
        if (signal === 'SIGTERM') {
          console.log('SIGTERM');
          return;
        }
        hasOutput && console.log('='.repeat(30));
        if (questionResult) {
          console.log(`${formatDuration(questionResult.duration)} Part ${'I'.repeat(part)}: ${questionResult.result}`);
        } else {
          console.log('no output');
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
    }, 1000, {leading: false, trailing: true}));

    launch(year, day, part, inputName);

    console.log('s = sample, i = input, 1 = part1, 2 = part2, d = debug, k = kill, q = quit');
    while (true) {      
      const key = (await waitForKey()).name;

      if (currentChild) {
        currentChild.kill();
        currentChild = null;
      }

      if (key === 'q') break;
      if (key === 'k') continue;
      
      if (key === 's') {
        debug = true;
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
      } else if (key === '3') {
        part = 3;
        inputName = 'sample.txt';
      } else if (key === 'd') {
        debug = !debug;
      } else if (key === 'return') {
        // re-run
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
