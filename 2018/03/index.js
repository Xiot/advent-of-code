import fs from 'fs';
import {counterMap, combineMap, assert} from '../common';

const lineParserRegEx = /#(\d+) @ (\d+),(\d+): (\d+)x(\d+)/;
const input = fs.readFileSync('./2018/03/input.txt', 'utf-8')
    .split('\n')
    .map(parseLine);

function parseLine(text) {
    const [,id, left, top, width, height] = lineParserRegEx.exec(text);
    return {
        id,
        left: parseInt(left),
        top: parseInt(top),
        width: parseInt(width),
        height: parseInt(height),
        right: parseInt(left) + parseInt(width) - 1,
        bottom: parseInt(top) + parseInt(height) - 1
    };
}

const keyOf = (x, y) => `${x},${y}`;
function* squaresOf(item) {
    for(let x = item.left; x <= item.right; x++) {
        for(let y = item.top; y <= item.bottom; y++) {
            yield [x, y];
        }
    }
}
function part1() {
    const overlaps = counterMap();

    for(let item of input) {
        for(let [x, y] of squaresOf(item)) {
            overlaps.append(keyOf(x, y), 1);
        }
    }
    const overlapping = Array.from(overlaps.entries())
        .filter(([, value]) => value > 1)
        .length;
    console.log('Overlapping', overlapping);
    // assert(107663, overlapping, 'Overlapping');
}

function part2() {
    const overlaps = combineMap([], (acc, cur) => [...acc, cur]);
    const nonOverlapping = new Set(input);

    for(let item of input) {
        for(let [x, y] of squaresOf(item)) {
            const cellItems = overlaps.append(keyOf(x, y), item);
            if (cellItems.length > 1) {
                cellItems.forEach(x => nonOverlapping.delete(x));
            }
        }
    }
    assert(1, nonOverlapping.size, 'More than 1 overlap');
    const first = Array.from(nonOverlapping.values())[0];
    console.log('NonOverlapping ID:', first.id);
}

part1();
part2();