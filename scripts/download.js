import { buildFilename } from './utils';

const process = require('process');
const fs = require('fs');
const fetch = require('node-fetch');

export const download = (year, day) => {
  const unlockDate = new Date(year, 11, day, 0, 0, 5);

  waitUntil(unlockDate.valueOf(), remaining => {
    console.log(formatDuration(remaining));
  })
    .then(() => launch(year, day))
    .then(() => downloadInput(year, day))
    .then(result => writeInput(result));
};

function writeInput({ year, day, text }) {
  fs.writeFileSync(buildFilename(year, day, 'input.txt'), text);
}

function downloadInput(year, day) {
  console.log('downloading');
  return fetch(`https://adventofcode.com/${year}/day/${day}/input`, {
    headers: {
      cookie: process.env.AOC_COOKIE,
    },
  })
    .then(response => {
      return response.text();
    })
    .then(text => {
      if (text.endsWith('\n')) {
        text = text.slice(0, -1);
      }
      return { year, day, text };
    });
}

function launch(year, day) {
  require('child_process').exec(`open https://adventofcode.com/${year}/day/${day}`);
}

function formatDuration(ms) {
  switch (true) {
  case ms < 1000:
    return `${ms}ms`;
  case ms < 60 * 1000:
    return `${Math.floor(ms / 1000)}s`;
  case ms < 60 * 60 * 1000: {
    ms /= 1000;
    const min = Math.floor(ms / 60);
    const sec = Math.floor(ms - min * 60);
    return `${min}m ${String(sec).padStart(2, '0')}s`;
  }
  default:
    return `${ms / 1000 / 60}m`;
  }
}

function waitUntil(ms, onTick) {
  return new Promise(resolve => {
    const tick = () => {
      const remaining = ms - Date.now();
      if (remaining <= 0) {
        return resolve();
      }
      onTick?.(remaining);
      setTimeout(tick, 1000);
    };
    tick();
  });
}
