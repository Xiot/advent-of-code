import {range} from 'lodash';
import {pointsWithin, assert, time} from '../common';

const SerialNo = 1718;

// Find the fuel cell's rack ID, which is its X coordinate plus 10.
// Begin with a power level of the rack ID times the Y coordinate.
// Increase the power level by the value of the grid serial number (your puzzle input).
// Set the power level to itself multiplied by the rack ID.
// Keep only the hundreds digit of the power level (so 12345 becomes 3; numbers with no hundreds digit become 0).
// Subtract 5 from the power level.

function calculatePowerLevel(x, y) {
    const rackId = x + 10;
    const level = Math.floor(((rackId * y + SerialNo) * rackId) / 100) % 10 - 5;
    return level;
}

function part1() {
    const grid = range(0, 300).map(y => {
        return range(0, 300).map(x => calculatePowerLevel(x+1,y+1));
    });

    const blockValue = (x, y) =>
        grid[y+0][x+0] + grid[y+0][x+1] + grid[y+0][x+2] +
        grid[y+1][x+0] + grid[y+1][x+1] + grid[y+1][x+2] +
        grid[y+2][x+0] + grid[y+2][x+1] + grid[y+2][x+2];

    let max = {x:0, y:0, value: -5000};

    for(let x = 0; x < 300-3; x++) {
        for(let y = 0; y < 300-3; y++) {
            const value = blockValue(x, y);
            if (value > max.value) {
                max = {x: x+1, y: y+1, value};
            }
        }
    }
    console.log('Max', max);
    assert('243,34', `${max.x},${max.y}`, 'Cell');
}

function createCache(grid) {
    const cache = new Map();
    const keyOf = (x, y, size) => `${x},${y},${size}`;

    return {
        get(x, y, size, fn) {
            const key = keyOf(x, y, size);
            if (cache.has(key)) {
                return cache.get(key);
            }
            const value = fn(grid);
            cache.set(key, value);
            return value;
        }
    };
}

function createGrid(size) {
    return range(0, size).map(y => {
        return range(0, size).map(x => calculatePowerLevel(x+1,y+1));
    });
}

function get(grid, x, y) {
    return grid[y][x];
}

function part2() {

    const grid = createGrid(300);
    const cache = createCache(grid);

    const sumBlock = (x, y, size) => {
        if (size === 1) {
            const value = cache.get(x, y, size, g => get(g, x, y));
            return value;
        }

        return cache.get(x, y, size, g => {
            let sum = sumBlock(x, y, size - 1);
            for(let x1 of range(x, x+size)) {
                sum += get(g, x1, y+size-1);
            }
            for(let y1 of range(y, y + size - 1)) {
                sum += get(g, x + size - 1, y1);
            }
            return sum;
        });
    };

    let max = {x:0, y:0, value: Number.MIN_SAFE_INTEGER, size: 0};

    for(let size = 1; size <= 300; size++) {
        for(let [x, y] of pointsWithin({left: 0, top: 0, right: 300 - size-1, bottom: 300 - size-1})) {
            const value = sumBlock(x, y, size);
            if (value > max.value) {
                max = {x: x+1, y: y+1, size, value};
            }
        }
    }

    console.log(`Result: ${max.x},${max.y},${max.size} = ${max.value}`);
}

time('part 1',() => part1());
time('part 2',() => part2());