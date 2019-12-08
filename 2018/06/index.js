import {loadInput, pointsWithin, counterMap, assert} from '../common';
import {minBy, maxBy, range} from 'lodash';

const input = loadInput('2018/06').split('\n').map(line => line.split(',').map(Number));

const maxOf = (arr, accessor) => accessor(maxBy(arr, accessor));
const minOf = (arr, accessor) => accessor(minBy(arr, accessor));

function findBounds(input) {
    return {
        left: minOf(input, x => x[0]),
        right: maxOf(input, x => x[0]),
        top: minOf(input, x => x[1]),
        bottom: maxOf(input, x => x[1])
    };
}

const keyOf = (x, y) => `${x},${y}`;
const distance = (x1, y1, x2, y2) => Math.abs(x1 - x2) + Math.abs(y1 - y2);

function shortestDistance(points, x, y) {

    let shortest = {
        value: Number.MAX_SAFE_INTEGER,
        indexes: []
    };

    for(let i = 0; i < points.length; i++) {
        const [px, py] = points[i];
        const value = distance(x, y, px, py);
        if (value < shortest.value) {
            shortest = {
                value,
                indexes: [i]
            };
        } else if (value === shortest.value) {
            shortest.indexes.push(i);
        }
    }
    return shortest.indexes.length === 1 ? shortest.indexes[0] : -1;
}

function indexesOnEdge(bounds, grid) {

    const indexes = new Set();
    for(let x of range(bounds.left, bounds.right +1)) {
        indexes.add(
            grid.get(keyOf(x, bounds.top))
        );
    }
    for(let x of range(bounds.left, bounds.right +1)) {
        indexes.add(
            grid.get(keyOf(x, bounds.bottom))
        );
    }

    for(let y of range(bounds.top, bounds.bottom +1)) {
        indexes.add(
            grid.get(keyOf(bounds.left, y))
        );
    }

    for(let y of range(bounds.top, bounds.bottom +1)) {
        indexes.add(
            grid.get(keyOf(bounds.right, y))
        );
    }
    return indexes;
}

function sumOfDistances(points, x, y) {
    return points.map(([px, py]) => distance(px, py, x, y)).reduce((sum, distance) => sum + distance);
}

function part1() {
    const points = [...input];
    const bounds = findBounds(points);

    const cache = counterMap();
    const grid = new Map();
    for(let [x, y] of pointsWithin(bounds)) {

        const closest = shortestDistance(points, x, y);
        grid.set(keyOf(x, y), closest);
        if (closest !== -1) {
            cache.append(closest, 1);
        }
    }

    // Anything on the edge will go to infinity
    const edges = indexesOnEdge(bounds, grid);
    const interior = Array.from(cache.entries())
        .filter(([index]) => !edges.has(index));

    const max = maxBy(interior, ([, count]) => count);

    console.log('\nPart I');
    console.log('Max', max[0], max[1]);
    assert(4166, max[1], 'Count');
}

function part2() {

    // 10000
    const points = [...input];
    const bounds = findBounds(points);

    let safeAreas = 0;

    for(let [x, y] of pointsWithin(bounds)) {
        const value = sumOfDistances(points, x, y);
        if (value < 10000) {
            safeAreas += 1;
        }
    }

    console.log('\nPart II');
    console.log('Safe Areas', safeAreas);
    assert(42250, safeAreas, 'Safe Areas');
}

part1();
part2();