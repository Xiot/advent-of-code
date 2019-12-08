import fs from 'fs';
import {minBy} from 'lodash';
import {assert} from '../common';

const input = fs.readFileSync('./2018/05/input.txt', 'utf-8');

function react(polymer) {
    let result = polymer[0];
    let index = 1;

    while(index < polymer.length) {
        const prev = result[result.length - 1];
        const current = polymer[index];
        if (destructs(prev, current)) {
            result = result.slice(0, -1);
            index += 1;
        } else {
            result += current;
            index += 1;
        }
    }
    return result;
}

function destructs(left, right) {
    if(!left) { return false; }
    return Math.abs(left.charCodeAt(0) - right.charCodeAt(0)) === 32;
}

function code(letter) {
    return letter.charCodeAt(0);
}
function char(ascii) {
    return String.fromCharCode(ascii);
}

function part1() {
    const result = react(input);
    console.log('\nPart I');
    console.log('Result',result.length);
    assert(11946, result.length, 'Length');
}

function part2() {
    const cache = Object.create(null);
    for(let i = code('a'); i <= code('z'); i++) {
        const letter = char(i);
        const polymer = input.replace(new RegExp(`${letter}`, 'ig'), '');
        const reacted = react(polymer);
        cache[letter] = reacted;
    }
    const max = minBy(Object.entries(cache), ([, polymer]) => polymer.length);

    console.log('\nPart II');
    console.log('Result', max[0], max[1].length);
    assert(4240, max[1].length, 'Length');
}

part1();
part2();