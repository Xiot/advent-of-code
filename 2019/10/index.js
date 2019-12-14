import {loadInput, pointsWithin, boundsOfGrid, gcd} from '../common';
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
    console.log('\nPart I');
    console.log(max);
}

function normalizedVector([x, y]) {
    const divisor = gcd(x, y);
    return [x / divisor, y / divisor];
}

function part2() {

    const {asteroids} = preProcess(input);
    const source = [23, 20];

    const normalizeAngle = angle => {
        if (angle < 0) { angle += 360; }
        return (Math.abs(-angle + 360) + 90) % 360;
    };

    let remaining = asteroids.map(([x,y]) => {

        const dx = x - source[0];
        const dy = source[1] - y;

        const degrees = Math.atan2(dy, dx) * 180 / Math.PI;
        const distance = Math.abs(dx) + Math.abs(dy);
        return {
            x,
            y,
            angle: normalizeAngle(degrees),
            distance
        };
    }).sort((l, r) => {
        if (l.angle === r.angle) {
            return l.distance - r.distance;
        }
        return l.angle - r.angle;
    });

    const order = [];
    let index = 0;
    let lastAngle = -1;
    while (remaining.length > 0) {

        const current = remaining[index];
        order.push(current);
        lastAngle = current.angle;
        remaining = [...remaining.slice(0, index), ...remaining.slice(index + 1)];
        while(index < remaining.length && lastAngle === remaining[index].angle) {
            index++;
        }

        if (index >= remaining.length) {
            index = 0;
        }
    }

    const formatP = x => String(x).padStart(4);
    const formatA = x => x.toFixed(2).padStart(6);
    const formatL = x => `(${x.x}, ${x.y})`;

    const printRow = (a, i) =>
        console.log(`${formatP(i)}] ${formatP(a.x - source[0])} ${formatP(a.y - source[1])}: ${formatA(a.angle)} ${formatL(a)} ${a.distance}`)

    const printRows = (arr, start = 0, end) =>
        arr.slice(start, end).forEach((x, i) => printRow(x, i + start));

    const target = order[199];
    console.log('\nPart II');
    console.log(target.x * 100 + target.y);
}

part1();
part2();