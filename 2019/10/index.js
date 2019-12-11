import {loadInput, pointsWithin, boundsOfGrid} from '../common';
import {sortBy, isEqual} from 'lodash';
import chalk from 'chalk';

// midpoint circle drawing
// https://www.geeksforgeeks.org/mid-point-circle-drawing-algorithm/

const input = loadInput(2019,10)
    // loadInput('2019/10/tiny.txt')
    .split('\n')
    .map(line => line.split(''));

function* astroidGenerator(grid) {
    for(let [x, y] of pointsWithin(boundsOfGrid(grid))) {
        if(hasAsteroid(grid, x, y)) {
            yield [x, y];
        }
    }
}

function preProcess(grid) {
    return {
        grid,
        asteroids: Array.from(astroidGenerator(grid)),
        bounds: boundsOfGrid(grid),
    };
}

function hasAsteroid(grid, x, y) {
    return grid[y][x] === '#';
}

function createBlockedMap() {

    const keyOf = (x, y) => `${x},${y}`;
    const cache = new Map();

    return {
        isMarked(x, y) {
            return cache.get(keyOf(x, y)) ?? false;
        },
        mark(x, y) {
            cache.set(keyOf(x, y), true);
        }
    };
}
function sortByDistance(source, x, y) {
    return sortBy(source, ([x0, y0]) => squareDistance(x, y, x0, y0));
}
function squareDistance(x, y, x0, y0) {
    return Math.pow(x0 - x, 2) + Math.pow(y0 - y, 2);
}
function inBounds(bounds, point) {
    return bounds.left <= point[0] && point[0] <= bounds.right
        && bounds.top <= point[1] && point[1] <= bounds.bottom;
}
function part1() {
    const {asteroids, bounds} = preProcess(input);
    let max = {pos: undefined, count: 0};

    for(let source of asteroids) {
        let count = 0;
        const blocked = createBlockedMap();

        const blockAll = (from, vector) => {
            let p = [...from];
            while(inBounds(bounds, p)) {
                blocked.mark(p[0], p[1]);
                p = [p[0]+vector[0], p[1] + vector[1]];
            }
        };

        const sortedAsteroids = sortByDistance(asteroids, source[0], source[1]);

        const found = [];
        for(let [x,y] of sortedAsteroids) {
            if (x === source[0] && y === source[1]) { continue; }
            if (blocked.isMarked(x, y)) { continue; }

            count += 1;
            found.push([x,y]);

            const vector = normalizedVector( [x - source[0], y - source[1]]);

            blockAll(source, vector);
        }

        if (count > max.count) {
            max = {pos:source, count};
        }
    }
    console.log(max);
}

function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    if (a === 0 || b === 0) {
        return Math.max(a, b);
    }
    if (a === b) { return a; }
    if (a > b) { return gcd(a - b, b); }
    return gcd(a, b - a);
}

function normalizedVector([x, y]) {
    const divisor = gcd(x, y);
    return [x / divisor, y / divisor];
}

function render(grid, blocked, arr) {
    const lines = [];
    for(let y = 0; y < grid.length; y++) {
        let line = '';
        for(let x = 0; x < grid[0].length; x++) {
            const found = arr.find(p => isEqual(p,[x,y] ));
            line += found
                ? chalk.bgCyan.black(grid[y][x])
                : grid[y][x];
        }
        lines.push(line);
    }
    console.log(lines.join('\n'));
}

part1();