const path = require('path');
const { watch: nodeWatch, appendFileSync, existsSync, unlinkSync } = require('node:fs');
const stream = require('node:stream');

const { waitForKey } = require('../utils/io');
const { solutionPath } = require('./utils');

const OUTPUT_FILE = './recent_output.log';

module.exports = {
  async watch(year, day) {
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

      if (existsSync(OUTPUT_FILE)) {
        unlinkSync(OUTPUT_FILE);
      }

      const child = Bun.spawn({
        cmd: ['bun', './scripts/launch.js', year, day, part, inputName],
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
          ...process.env,
          DEBUG: debug ? '1' : '0',
          SOLUTION_PATH: path.join(process.cwd(), solutionPath(year, day)),
          SOLUTION_OUTPUT_PATH: path.join(process.cwd(), solutionPath(year, day), 'output'),
          AOC_INPUT: path.join(process.cwd(), solutionPath(year, day), inputName),
          IS_SAMPLE: inputName === 'sample.txt' ? 1 : 0,
          PART: String(part),
        },
        ipc(message, channel) {
          questionResult = message;
        },
        onExit(channel, code, signal) {
          if (signal === 'SIGTERM') {
            console.log('SIGTERM');
            return;
          }
          if (code !== 0) {
            console.log('exit', code, signal);
            return;
          }

          hasOutput && console.log('='.repeat(30));
          if (questionResult) {
            console.log(
              `${formatDuration(questionResult.duration)} Part ${'I'.repeat(part)}: ${questionResult.result}`,
            );
          } else {
            console.log(`Part ${'I'.repeat(part)}: no output`);
          }
        },
      });

      const os = new WritableStream({
        start() {
          console.log(`\n${year} ${String(day).padStart(2, '0')} - ${inputName}\n${'='.repeat(30)}`);
        },
        write(chunk) {
          if (!debug) return;
          hasOutput = true;
          process.stdout.write(chunk);
        },
      });

      const errorOut = new WritableStream({
        write(chunk) {
          process.stderr.write(chunk);
        },
      });
      child.stderr.pipeTo(errorOut);

      const fileOut = new WritableStream({
        write(chunk) {
          appendFileSync(OUTPUT_FILE, chunk, 'utf-8');
        },
      });

      // child.stdout.pipeTo(fileOut);
      child.stdout.pipeTo(os);

      currentChild = child;
      return child;
    }

    const watcher = nodeWatch(solutionPath(year, day), (event, filename) => {
      if (event !== 'change') return;
      launch(year, day, part, inputName);
    });

    console.log('s = sample, i = input, 1 = part1, 2 = part2, d = debug, k = kill, q = quit');
    launch(year, day, part, inputName);

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

    // something is preventing the process from exiting
    process.exit(0);
  },
};

function formatDuration(ms) {
  return `[${ms.toFixed(2).padStart(8)}]`;
}

function combineStreams(...streams) {
  return new WritableStream({
    start() {
      streams.forEach(s => s.start?.());
    },
    write(chunk) {
      streams.forEach(s => s.write?.(chunk));
    },
  });
}
