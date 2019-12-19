import {loadProgram, execute, createGridMap, toChar, toCharCode, visualizeGrid, Stream} from '../common';
import chalk from 'chalk';

const Direction = {
    north: 0,
    east: 1,
    south: 2,
    west: 3
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
const moveOne = (pos, direction) => {
    const offset = offsetOf(direction);
    return {x: pos.x + offset.x, y: pos.y + offset.y};
};

const createCamera = () => {
    const grid = createGrid();
    let pos = {x: 0, y: 0};

    let robotPos = undefined;
    let robotDirection = undefined;

    return {
        get grid() { return grid; },
        get robotPosition() { return robotPos; },
        get robotDirection() { return robotDirection; },
        get io() {
            return {
                write(value) {
                    if (value === 10) {
                        pos = {x: 0, y: pos.y + 1};
                        return;
                    }
                    const char = toChar(value);
                    grid.set(pos, char);

                    const direction = '^>v<'.indexOf(char);
                    if (direction !== -1) {
                        robotPos = pos;
                        robotDirection = direction;
                    }

                    pos = {x: pos.x + 1, y: pos.y};
                }
            };
        }
    };
};

const createGrid = () => {
    const grid = createGridMap(' ');

    return {
        get(pos) { return grid.get(pos.x, pos.y); },
        set(pos, value) {return grid.set(pos.x, pos.y, value); },

        canMove(pos) { return this.get(pos) === '#'; },

        entries() { return grid.entries(); },
        get bounds() { return grid.bounds; }
    };
};

async function part1() {
    const program = loadProgram('2019/17');

    const camera = createCamera();

    await execute(program, camera.io);
    printGrid(camera.grid);

    const alignment = calculateAlignmentParameters(camera.grid);

    console.log('\nPart I');
    console.log('Sum', alignment);
}

async function part2() {
    // const program = loadProgram('2019/17');

    // const camera = createCamera();

    // await execute(program, camera.io);

    // console.log();
    // for(let s of generateSequence(camera)) {
    //     process.stdout.write(String(s) + ',');
    // }
    // console.log();
    const seq = 'R,8,L,12,R,8,R,8,L,12,R,8,L,10,L,10,R,8,L,12,L,12,L,10,R,10,L,10,L,10,R,8,L,12,L,12,L,10,R,10,L,10,L,10,R,8,R,8,L,12,R,8,L,12,L,12,L,10,R,10,R,8,L,12,R,8';
    const A = 'R,8,L,12,R,8';
    const B = 'L,10,L,10,R,8';
    const C = 'L,12,L,12,L,10,R,10';

    const routine = replace(seq, A, B, C);
    console.log(seq);
    console.log(replace(seq, A, B, C));

    const input = createInputStream(routine, A, B, C);
    let output = '';
    let lastOutput = undefined;
    const io = {
        async read() {
            return input.read();
        }, write(value) {
            lastOutput = value;
            if (value === 10) {
                console.log(output);
                output = '';
                return;
            }
            if (value < 255) {
                output += toChar(value);
            }
        }
    };
    const program = loadProgram('2019/17');
    program[0] = 2;
    await execute(program, io);
    console.log('DONE', lastOutput);
}

function createInputStream(routine, subA, subB, subC) {
    const total = [routine, subA, subB, subC].join('\n');
    const stream = new Stream();
    for(let c of total) {
        stream.write(toCharCode(c));
    }
    stream.write(toCharCode('\n'));
    stream.write(toCharCode('n'));
    stream.write(toCharCode('\n'));
    return stream;
}

function replace(seq, a, b, c) {
    return seq
        .split(a).join('A')
        .split(b).join('B')
        .split(c).join('C');
}

function* generateSequence(camera) {
    let pos = camera.robotPosition;
    let direction = camera.robotDirection;
    const grid = camera.grid;

    while(true) {
        let forwardCount = 0;
        while(canMoveForward(grid, pos, direction)) {
            const move = squareAhead(grid, pos, direction);
            pos = move.pos;
            forwardCount += 1;
        }

        if (forwardCount > 0) {
            yield forwardCount + 1;
        }

        const turn = findTurn(grid, pos, direction);
        if (!turn) { break; }

        yield turn.code;
        pos = turn.pos;
        direction = turn.direction;
    }
}

function canMoveForward(grid, pos, direction) {
    const square = squareAhead(grid, pos, direction);
    return grid.canMove(square.pos);
}

function findTurn(grid, pos, direction) {
    const left = squareLeft(grid, pos, direction);
    const right =squareRight(grid, pos, direction);

    return grid.canMove(left.pos)
        ? left
        : grid.canMove(right.pos)
            ? right
            : null;
}

function squareAhead(grid, pos, direction) {
    const offset = offsetOf(direction);
    return {
        code: 'F',
        pos: {x: pos.x + offset.x, y: pos.y + offset.y},
        direction
    };
}

function squareLeft(grid, pos, direction) {
    const newDirection = (direction + 3) % 4;
    const left = offsetOf(newDirection);
    return {
        code: 'L',
        pos: {x: pos.x + left.x, y: pos.y + left.y},
        direction: newDirection
    };
}
function squareRight(grid, pos, direction) {
    const newDirection = (direction + 5) % 4;
    const left = offsetOf(newDirection);
    return {
        code: 'R',
        pos: {x: pos.x + left.x, y: pos.y + left.y},
        direction: newDirection
    };
}

function calculateAlignmentParameters(grid) {
    return Array.from(grid.entries())
        .filter(([p, v]) => {
            if (v !== '#') {
                return false;
            }
            const neighbors = [
                grid.get(moveOne(p, Direction.north)),
                grid.get(moveOne(p, Direction.east)),
                grid.get(moveOne(p, Direction.south)),
                grid.get(moveOne(p, Direction.west)),
            ];
            return neighbors.every(c => c === '#');
        })
        .map(([p]) => {
            return p.x * p.y;
        }).reduce((sum, value) => sum + value, 0);
}

const printGrid = grid => {
    const text = visualizeGrid(grid.bounds, (x, y) => {
        return grid.get({x, y});
    });
    console.log();
    console.log(text);
    console.log();
};

(async () => {
    // await part1();
    await part2();
})();