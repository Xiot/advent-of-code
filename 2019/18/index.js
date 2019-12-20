import {loadInput, createGridMap, pointsWithin} from '../common';
import {isEqual} from 'lodash';

const sample1 = `########################
#f.D.E.e.C.b.A.@.a.B.c.#
######################.#
#d.....................#
########################`;
const sample2 = `#################
#i.G..c...e..H.p#
########.########
#j.A..b...f..D.o#
########@########
#k.E..a...g..B.n#
########.########
#l.F..d...h..C.m#
#################`;
const sample3 = `########################
#@..............ac.GI.b#
###d#e#f################
###A#B#C################
###g#h#i################
########################`;

const Direction = {
    north: 0,
    east: 1,
    south: 2,
    west: 3
};
const directions = [0, 1, 2, 3];

function offsetOf(direction) {
    switch(direction) {
    case Direction.north: return {x: 0, y: -1};
    case Direction.south: return {x: 0, y: 1};
    case Direction.west: return {x: -1, y: 0};
    case Direction.east: return {x: 1, y: 0};
    default:
        return {x: 0, y: 0};
    }
}
const moveOne = (pos, direction) => {
    const offset = offsetOf(direction);
    return {x: pos.x + offset.x, y: pos.y + offset.y};
};

function part1() {
    const input = loadInput(2019, 18);
    const grid = parseInput(input);

    // console.log(grid.keys);

    // const s = Date.now();
    // const k = findKeys(grid, grid.playerPosition, []);
    // console.log(k);
    // console.log(Date.now() - s);

    let pos = grid.playerPosition;

    // const cache = (() => {
    //     const store = Object.create(null);
    //     const keyOf = (from, to) => [from, to].sort().join(',');
    //     return {
    //         get(from, to, fn) {
    //             const stored = store[keyOf(from, to)];
    //             if (stored) { return stored; }
    //             if (!fn) { return undefined; }
    //             const value = fn();
    //             this.set(from, to, value);
    //             return value;
    //         },
    //         set(from, to, value) {
    //             // console.log(from, to, value);
    //             store[keyOf(from, to)] = value;
    //         }
    //     };
    // })();
    const cache = (() => {
        const store = Object.create(null);
        const keyOf = (from, keys) => `${from}|${keys.map(x => x.key).sort().join()}`;
        return {
            get(from, keys, fn) {
                const stored = store[keyOf(from, keys)];
                if (stored) { return stored; }
                if (!fn) { return undefined; }
                const value = fn();
                this.set(from, keys, value);
                return value;
            },
            set(from, keys, value) {
                // console.log(from, to, value);
                store[keyOf(from, keys)] = value;
            }
        };
    })();


    // cache.get(currentKey, key.key,() => findShortestPath(grid, key.pos, [...keys, key], cache))

    const totalDistance = findShortestPath(grid, pos, [], cache);

    console.log('Total', totalDistance);
}

function findShortestPath(grid, pos, keys, cache) {

    let shortestDistance = Number.MAX_SAFE_INTEGER;

    const currentKey = grid.keyAt(pos);
    const cached = cache.get(currentKey, keys);
    if (cached) {
        // console.log('cache hit');
        return cached;
    }

    const availableKeys = findKeys(grid, pos, keys);
    if (availableKeys.length === 0) {
        return 0;
    }

    for(let key of availableKeys) {

        // cache.set(currentKey, key.key, key.distance);

        // let distance = cache.get(currentKey, key.key);
        // if (distance) {
        //     console.log('cached', currentKey, key.key, distance);
        // } else {
        //     distance = key.distance + findShortestPath(grid, key.pos, [...keys, key], cache);
        //     console.log('compute', currentKey, key.key, distance);
        //     cache.set(currentKey, key.key, distance);
        // }
        const distance = key.distance + findShortestPath(grid, key.pos, [...keys, key], cache);
        // console.log(currentKey, key.key, distance);
        if (distance < shortestDistance) {
            shortestDistance = distance;
        }
    }
    cache.set(currentKey, keys, shortestDistance);
    return shortestDistance;
}


function findKeys(grid, startPos, currentKeys) {
    const visited = createVisited();
    visited.set(startPos);
    const queue = [{pos: startPos, distance: 0}];

    const availableKeys = [];
    while(queue.length > 0) {
        const {pos, distance} = queue.shift();

        const key = grid.keyAt(pos);
        if (key && !currentKeys.some(x => x.key === key)) {
            availableKeys.push({key, pos, distance});
        }

        directions
            .map(d => moveOne(pos, d))
            .filter(p => !visited.get(p) && grid.isOpen(p, currentKeys))
            .forEach(p => {
                queue.push({pos: p, distance: distance + 1});
                visited.set(p);
            });
    }
    return availableKeys;
}

function distanceBetween(grid, left, right) {

    const visited = createVisited();
    visited.set(left);
    const queue = [{pos: left, distance: 0}];

    while(queue.length > 0) {
        const {pos, distance} = queue.shift();
        if (isEqual(pos, right)) {
            return distance;
        }

        directions
            .map(d => moveOne(pos, d))
            .filter(p => !visited.get(p) && grid.isOpen(p))
            .forEach(p => {
                queue.push({pos: p, distance: distance + 1});
                visited.set(p);
            });
    }
    return -1;
}

function createVisited() {
    const grid = createGridMap(false);
    return {
        get(pos) {return grid.get(pos.x, pos.y); },
        set(pos) {return grid.set(pos.x, pos.y, true); }
    };
}

function valueIsKey(value) {
    return value >= 'a' && value <= 'z';
}
function valueIsDoor(value) {
    return value >= 'A' && value <= 'Z';
}

function parseInput(text) {
    const lines = text.split('\n');
    const grid = createGridMap((x, y) => {
        const v = lines[y][x];
        return v;
    });
    grid.bounds.mark(0, 0);
    grid.bounds.mark(lines[0].length - 1, lines.length - 1);

    const keys = {};
    const doors = {};
    let player = undefined;

    for(let [x, y] of pointsWithin(grid.bounds)) {
        const pos = {x, y};
        const value = grid.get(x, y);

        if (valueIsKey(value)) {
            keys[value] = pos;
        } else if (valueIsDoor(value)) {
            doors[value.toLowerCase()] = pos;
        } else if (value === '@') {
            player = pos;
        }
    }
    const originalKeys = {...keys};
    const originalDoors = {...doors};

    grid.set(player.x, player.y, '.');

    return {
        get playerPosition() {return player; },
        get bounds() { return grid.bounds; },

        get keys() {return keys; },
        get doors() { return doors; },

        get originalDoors() { return originalDoors; },
        get originalKeys() { return originalKeys; },

        set(pos, value) { return grid.set(pos.x, pos.y, value); },
        get(pos) { return grid.get(pos.x, pos.y); },

        keyLocation(name) { return keys[name]; },
        doorLocation(name) { return doors[name]; },
        isOpen(pos, keys) {
            const value = this.get(pos);

            // Check if we have the key
            if (keys && valueIsDoor(value)) {
                const x = keys.some(x => x.key === value.toLowerCase());
                return x;
            }

            return value === '.' || value === '@' || valueIsKey(value);
        },

        isKey(pos) {
            const value = this.get(pos);
            return valueIsKey(value);
        },
        keyAt(pos) {
            const value = this.get(pos);
            return valueIsKey(value) ? value : undefined;
        },

        // movePlayer(pos) {
        //     this.set(player, '.');
        //     const current = this.get(pos);
        //     player = pos;
        //     this.set(player, '@');
        //     if (valueIsKey(current)) {
        //         const doorPosition = doors[current];
        //         if (doorPosition) {
        //             this.set(doorPosition, '.');
        //         }
        //         delete keys[current];
        //         delete doors[current];
        //     }
        // }
    };
}


part1();