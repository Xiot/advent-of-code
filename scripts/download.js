require('dotenv').config();

const process = require('process');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const [year, day] = process.argv.slice(2).map(x => isNaN(x) ? x : parseInt(x));
if (!year || ! day) {
    console.log('Usage \'node init.js <year> <day>');
    process.exit(-1);
}
const folder = `./${year}/${String(day).padStart(2, '0')}`;

const unlockDate = new Date(year, 12, day, 0, 0, 5);
const timeToWait = Math.max(0, unlockDate.valueOf() - Date.now());
console.log(timeToWait);

// delay(timeToWait)
waitUntil(unlockDate.valueOf(), remaining => console.log(`T-${Math.ceil(remaining / 1000)}`))
    .then(() => download(year, day))
    .then(result => writeInput(result));

function writeInput({year, day, text}) {
    fs.writeFileSync(path.join(folder, 'input.txt'), text);
}

function download(year, day) {
    console.log('downloading');
    return fetch(`https://adventofcode.com/${year}/day/${day}/input`, {
        headers: {
            cookie: process.env.AOC_COOKIE
        }
    }).then(response => {
        return response.text();    
    })
        .then(text => {  
            if (text.endsWith('\n')) {
                text = text.slice(0, -1);
            }  
            return {year, day, text};      
        });
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
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