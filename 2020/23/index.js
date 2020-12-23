import { find } from 'lodash';
import {loadInput,range} from '../../utils';

function part1(input) {
    let {cups, moves} = parseInput(input);

    const MOVES = 100;
    const LENGTH = cups.length;

    let currentIndex = 0;

    console.log(at(cups, 2));

    for(let i = 0; i < MOVES; i++) {
        // console.group('turn', i+1);
        let current = cups[currentIndex];
        console.log(i, 'cups', print(cups, current));

        const m = pick3(cups, currentIndex);
        // console.log('current', current);
        // console.log('picked', m.values);
        const dest = findDestination(m.remaining, current);
        // console.log('dest', dest);
        const destIndex = m.remaining.indexOf(dest);
        // console.log('destIndex', destIndex);

        m.remaining.splice(
            Math.min(destIndex + 1, m.remaining.length),
            0,
            ...m.values
        );
        cups = m.remaining;

        currentIndex = (cups.indexOf(current) + 1) % LENGTH;
    }
    console.log(print(cups));

    const offset = cups.indexOf(1) + 1;
    const result = range(0, LENGTH - 2).map(i => at(cups, i + offset)).join('');
    return result;
}

function findDestination(cups, value, exclude = []) {
    while(true) {
        value -=1;
        if (exclude.indexOf(value) >= 0) continue;
        if (value <= 0) value = 10;
        if (cups.includes(value)) return value;
    }
}

function print(arr, current) {
    return arr.map(m => m === current ? `(${m})` : `${m}`).join(' ');
}

function pick3(cups, index) {
    const values = range(1,3).map(i => at(cups, index + i));
    const remaining = cups.filter(c => !values.includes(c));
    return {
        values,
        remaining
    };
}

function at(arr, index) {
    return arr[index % arr.length];
}

function part2(input) {

    // const {cups: starting} = parseInput(input);
    // let cups = Array.from(new Array(1_000_000), (x, i) => {
    //     return i < starting.length ? starting[i] : 10 + i - starting.length;
    // });
    const cups = [3,8,9,1,2,5,4,6,7];

    const MOVES = 10;
    const LENGTH = cups.length;

    let currentIndex = 0;

    // console.clear();

    let lastTime = Date.now();
    for(let i = 0; i < MOVES; i++) {
        let current = cups[currentIndex];

        console.log(print(cups, current));
        if (i % 1_000 === 0) {
            console.log(i, Date.now() - lastTime);
            lastTime = Date.now();
        }

        const next3 = range(1,3).map(i => at(cups, currentIndex + i));

        const destination = findDestination(cups, current, next3);
        const destinationIndex = cups.indexOf(destination);

        const cache = slice(cups, currentIndex + 1, destinationIndex + 1);

        for(let o = 0; o < cache.length; o++) {
            set(cups, currentIndex + 1 + o, at(cache, o+3));
        }

        currentIndex = (cups.indexOf(current) + 1) % LENGTH;

    }
    console.log(print(cups));
    console.log();

    const offset = cups.indexOf(1);
    return at(cups, offset+1) * at(cups, offset+2);
}
function set(arr, index, value) {
    arr[index % arr.length] = value;
}
function slice(arr, start, end) {
    const length = end < start
        ? (arr.length + end) - start
        : end - start;
    // console.log('slice', start, end, length);
    const data = new Array(length);
    for(let i =0; i < length; i++) {
        data[i] = at(arr, start+i);
    }
    return data;
    // if(end < start) {
    //     return [...arr.slice(start), ...arr.slice(0, end - arr.length)];
    // }
    // return arr.slice(start, end);
}
function shiftLeft(arr, offset, index, length) {
    console.log('shiftLeft', offset, index, length);

    const start = index - offset;
    const cache = range(index - offset, index + length - 1)
        .map(i => at(arr, i));
    console.log(' cache', cache);
    for(let i = 0; i < cache.length; i++) {

        const newValue = at(cache, i + offset);
        console.log(' set', start +i, newValue);
        arr[start + i] = newValue;
    }
}
// function shiftLeft(arr, offset, index, length) {
//     console.log('shiftLeft', index, offset, length);
//     if (offset === 0) return;
//     const start = (index - offset) % arr.length;
//     // const cache = arr.slice(index - length, index);
//     for(let i = 0; i < length; i++) {
//         swap(arr, start+i, index+i);
//     }
//     // for(let i = 0; i < cache.length; i++) {
//     //     arr[index+i] = cache[i];
//     // }
// }

function indexDiff(arr, i1, i2) {
    if (i2 < i1) {
        i2+= arr.length;
    }
    return i2 - i1;
}
function swap(arr, i1, i2) {
    i1 = i1 % arr.length;
    i2 = i2 % arr.length;
    const tmp = arr[i1];
    arr[i1] = arr[i2];
    arr[i2] = tmp;
}

function parseInput(input) {
    const parts = input.split(',');
    return {
        cups: parts[0].split('').map(x => parseInt(x, 10)),
        moves: parseInt(parts[1], 10),
    };
}

(function solve() {
    const input = loadInput(2020, 23);
    // console.log('Part I :', part1(input));
    console.log('Part II:', part2(input));
})();