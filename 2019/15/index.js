import {loadProgram, execute, executeIterator, visualizeGrid, createGridMap, waitForKey, Stream} from '../common';
import chalk from 'chalk';

const Tiles = {
    unknown: 0,
    open: 1,
    wall: 2,
    oxygen: 3
};
const Codes = {
    hitWall: 0,
    moved: 1,
    success: 2,
};
const Direction = {
    north: 1,
    south: 2,
    west: 3,
    east: 4
};
const nameOf = direction => {
    switch(direction) {
    case Direction.north: return 'up';
    case Direction.south: return 'down';
    case Direction.east: return 'right';
    case Direction.west: return 'left';
    }
};

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
function oppositeOf(direction) {
    switch(direction) {
    case Direction.north: return Direction.south;
    case Direction.south: return Direction.north;
    case Direction.east: return Direction.west;
    case Direction.west: return Direction.east;
    }
}

function keyToDirection(key) {
    switch(key.name) {
    case 'up': return Direction.north;
    case 'left': return Direction.west;
    case 'down': return Direction.south;
    case 'right': return Direction.east;
    default: return undefined;
    }
}

async function dfs(grid, pos, check) {
    const visited = createGridMap(false);
    visited.set(pos.x, pos.y, true);
    return dfsWorker(grid, pos, check, 1, visited);
}
async function dfsWorker(grid, pos, check, steps, visited) {

    let min = Number.MAX_SAFE_INTEGER;

    for(let d of Object.values(Direction)) {

        const offset = offsetOf(d);
        const nextPos = {x: pos.x + offset.x, y: pos.y + offset.y};

        if (visited.get(nextPos.x, nextPos.y)) { continue; }
        visited.set(nextPos.x, nextPos.y, true);

        grid.bounds.mark(nextPos.x, nextPos.y);

        const status = await check(d);

        if (status === Codes.hitWall) {
            grid.set(nextPos, Tiles.wall);
            continue;
        } else if (status === Codes.success) {
            grid.set(nextPos, Tiles.oxygen, true);
            min = steps;
        } else {
            grid.set(nextPos, Tiles.open, true);
        }

        const v = await dfsWorker(grid, nextPos, check, steps + 1, visited);
        if (v < min) {
            min = v;
        }

        grid.markPath(nextPos, false);

        await check(oppositeOf(d));
    }
    return min;
}

function createGrid() {
    const grid = createGridMap((x, y) => ({
        x, y, tile: Tiles.unknown, path: false
    }));

    return {
        get(pos) {
            return grid.get(pos.x, pos.y);
        },
        set(pos, tile, path) {

            const oldTile = this.tileAt(pos);
            if (oldTile === Tiles.wall && tile !== Tiles.wall) {
                throw Error('wall');
            }

            return grid.set(pos.x, pos.y, state => ({...state, tile, path}));
        },
        setState(pos, partialState) {
            return grid.set(pos.x, pos.y, state => ({...state, ...partialState}));
        },
        tileAt(pos) {
            return grid.get(pos.x, pos.y).tile;
        },
        markPath(pos, path = true) {
            return grid.set(pos.x, pos.y, state => ({...state, path}));
        },
        get bounds() { return grid.bounds; },
        values() { return grid.values(); }
    };
}

async function part1() {
    const program = loadProgram('2019/15');

    const grid = createGrid();

    let pos = {x: 0, y: 0};
    grid.set(pos, Tiles.open, true);


    const input = new Stream();
    const output = new Stream();

    const check = async value => {
        printGrid(grid,undefined, 40);
        await output.write(value);
        return await input.read();
    };

    const io = {
        async read() {
            return await output.read();
        }, write(status) {
            return input.write(status);
        }
    };

    execute(program, io);

    const value = await dfs(grid, pos, check);
    require('readline').cursorTo(process.stdout, 0, 45);
    console.log('\nPart I');
    console.log('Steps:', value);
}

async function part2() {
    const program = loadProgram('2019/15');

    const grid = createGrid();

    let pos = {x: 0, y: 0};
    grid.set(pos, Tiles.open, true);


    const input = new Stream();
    const output = new Stream();

    const check = async value => {
        await output.write(value);
        return await input.read();
    };

    const io = {
        async read() {
            return await output.read();
        }, write(status) {
            input.write(status);
        }
    };

    execute(program, io);

    // populates the grid
    await dfs(grid, pos, check);

    const oxygen = Array.from(grid.values()).find(p => p.tile === Tiles.oxygen);

    const timeToFill = await furthest(grid, oxygen);
    console.log('\nPart II');
    console.log(timeToFill);
}

function positionAt(pos, direction) {
    const offset = offsetOf(direction);
    return {x: pos.x +offset.x, y: pos.y + offset.y};
}

const delay = time => new Promise(resolve => setTimeout(resolve, time));

async function furthest(grid, initialPosition) {
    const visited = createGridMap(false);

    const queue = [];
    let maxDistance = 0;
    queue.push({pos: initialPosition, distance: 0});
    while(queue.length > 0) {
        const {pos, distance} = queue.shift();
        maxDistance = Math.max(maxDistance, distance);

        for(const direction of Object.values(Direction)) {
            const nextPos = positionAt(pos, direction);
            if (visited.get(nextPos.x, nextPos.y)) { continue; }

            if (grid.tileAt(nextPos) === Tiles.open) {
                grid.setState(nextPos, {filled: true});
                queue.push({pos: nextPos, distance: distance + 1});
            }

            visited.set(nextPos.x, nextPos.y, true);
        }
        await delay(50);
        printGrid(grid);
    }
    return maxDistance;
}

function printGrid(grid, pos, marginLeft) {
    const text = visualizeGrid(grid.bounds, (x, y) => {

        const {tile, path, filled} = grid.get({x,y});

        const char = x === 0 && y === 0
            ? '*'
            : tile === Tiles.open
                ? '.'
                : ' ';

        if (tile === Tiles.oxygen || filled) {
            return chalk.bgBlueBright(char);
        }

        if (pos && pos.x === x && pos.y === y) {
            return chalk.bgRed(char);
        }

        switch(tile) {
        case Tiles.open: return path ? chalk.bgGreenBright.black(char) : char;
        case Tiles.wall: return chalk.bgWhite(char);
        case Tiles.oxygen: return chalk.bgBlue(char);
        default: return ' ';
        }
    });
    require('readline').cursorTo(process.stdout, marginLeft || 0, 0);
    console.log();
    console.log(text);
    console.log();
    require('readline').cursorTo(process.stdout, 0, grid.bounds.height + 4);
}

(async() => {
    await part1();
    await part2();
})();