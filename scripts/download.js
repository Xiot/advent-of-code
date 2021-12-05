import { buildFilename } from './utils';
import { nextLine, showCursor, updateLine } from './terminal';

const process = require('process');
const fs = require('fs');
const fetch = require('node-fetch');

export const download = (year, day, timeText = "00:01") => {
  const time = parseTime(timeText);
  const unlockDate = new Date(year, 11, day, time.hour, time.minute, 5);

  showCursor(false);
  
  return waitUntil(unlockDate.valueOf(), remaining => {
    if (remaining >= 1000) {
      updateLine(`Launching in ${formatDuration(remaining)}`);          
    }
  })
    .then(() => updateLine('Launching ...'))
    .then(() => launch(year, day))
    .then(() => nextLine('Downloading ...'))
    .then(() => downloadInput(year, day))
    .then(result => writeInput(result))
    .then(() => nextLine('Recording Start Time ...'))
    .then(() => markStartTime(year, day, Date.now()))
    .finally(() => {
      nextLine('');
      showCursor(true);
    });
};
function parseTime(time) {
  const parts = time.split(':').map(x => parseInt(x));
  return {hour: parts[0] ?? 0, minute: parts[1] ?? 0};
}

function writeInput({ year, day, text }) {
  fs.writeFileSync(buildFilename(year, day, 'input.txt'), text);
}

function downloadInput(year, day) {    
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

function markStartTime(year, day, time) {
  return fetch(`https://portal.xiot.ca/aoc/${year}/overrides.json`, {
    method: 'PATCH',
    body: JSON.stringify({
      id: "682929",
      day,
      time
    }),
    headers: {
      'content-type': 'application/json'
    }
  });
}

function launch(year, day) {
  require('child_process').exec(`open https://adventofcode.com/${year}/day/${day}`);
}

function formatDuration(ms) {
    
  const units = [60, 60];
  let parts = [];

  let remaining = Math.floor(ms / 1000);  
  for(let unit of units) {
    const whole = Math.floor(remaining / unit);
    const fractional = remaining - whole * unit;

    parts.push(fractional);
    remaining = whole;
    if (remaining <= 0) break;
  }

  if (remaining > 0) {
    parts.push(remaining);
  }

  return parts.reverse().map((value, index) => {
    return(index === 0 ? String(value) : String(value).padStart(2, '0'));
  }).join(':');  
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
