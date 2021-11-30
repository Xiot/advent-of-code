
const process = require('process');
const fs = require('fs');
const path = require('path');

const [year, day] = process.argv.slice(2).map(x => isNaN(x) ? x : parseInt(x));
if (!year || ! day) {
    console.log('Usage \'node init.js <year> <day>');
    process.exit(-1);
}
const folder = `./${year}/${String(day).padStart(2, '0')}`;

// Create the folder
fs.mkdirSync(folder, {recursive: true});

const templateFile = path.join(folder, 'index.js');
if (!fs.existsSync(templateFile)) {
    fs.writeFileSync(templateFile, createTemplate(year, day));
    fs.writeFileSync(path.join(folder, 'sample.txt'), '');
}

function createTemplate(year, day) {
    return trimLeading(`
    import {loadInput} from '../../utils';

    function part1(input) {
    
    }
    
    function part2(input) {
    
    }
    
    (function solve() {
        const input = loadInput(${year}, ${day}, 'sample');
        console.log('Part I :', part1(input));
        console.log('Part II:', part2(input));
    })();
    `);
}

function trimLeading(text) {
    const lines = text.split('\n');
    const amountToTrim = lines[1].match(/^\s+/)[0].length;

    return lines.map(line => line.replace(`^\s{${amountToTrim}}`, '')).join('\n');
}