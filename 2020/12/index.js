import {createGridMap, loadInput} from '../../utils';

const EAST = 0;
const SOUTH = 1;
const WEST = 2;
const NORTH = 3;

const DIRECTIONS = [
    EAST, SOUTH, WEST, NORTH
];
const MOVE = [
    {x: 1, y: 0},
    {x: 0, y: -1},
    {x: -1, y: 0},
    {x: 0, y: 1}
];

function part1(input) {
    let direction = EAST;
    let pos = {x:0, y:0};

    function move(direction, distance) {
        pos.x += MOVE[direction].x * distance;
        pos.y += MOVE[direction].y * distance;
    }

    for(let op of input) {
        switch(op.op) {
        case 'N': {
            move(NORTH, op.value);
            break;
        }
        case 'S': {
            move(SOUTH, op.value);
            break;
        }
        case 'E': {
            move(EAST, op.value);
            break;
        }
        case 'W': {
            move(WEST, op.value);
            break;
        }
        case 'F': {
            move(direction, op.value);
            break;
        }
        case 'L': {
            const offset = op.value === 90
                ? 1
                : op.value === 180
                    ? 2
                    : 3;
            direction = (4 + direction - offset) % 4;
            break;
        }
        case 'R': {
            const offset = op.value === 90
                ? 1
                : op.value === 180
                    ? 2
                    : 3;
            direction = (direction + offset) % 4;
            break;
        }
        }
    }

    return Math.abs(pos.x) + Math.abs(pos.y);
}

function part2(input) {

    let pos = {x:0, y: 0};
    let wp = {x: 10, y: 1};

    function move(wp, distance) {
        pos.x += distance * wp.x;
        pos.y += distance * wp.y;
    }
    function moveW(direction, distance) {
        wp.x += MOVE[direction].x * distance;
        wp.y += MOVE[direction].y * distance;
    }

    let i = 0;
    for(let op of input) {

        switch(op.op) {
        case 'N': {
            moveW(NORTH, op.value);
            break;
        }
        case 'S': {
            moveW(SOUTH, op.value);
            break;
        }
        case 'E': {
            moveW(EAST, op.value);
            break;
        }
        case 'W': {
            moveW(WEST, op.value);
            break;
        }
        case 'F': {
            move(wp, op.value);
            break;
        }
        case 'L': {
            wp = rotate(wp, op.value);
            break;
        }
        case 'R': {
            wp = rotate(wp, -op.value);
            break;
        }
        }
    }
    return Math.abs(pos.x) + Math.abs(pos.y);
}

function degToRag(deg) {
    return deg / 180 * Math.PI;
}

function rotate(p, deg) {
    const rad = degToRag(deg);
    return {
        x: Math.round(p.x * Math.cos(rad) - p.y * Math.sin(rad)),
        y: Math.round(p.x * Math.sin(rad) + p.y * Math.cos(rad)),
    };
}

function solve() {
    const input = parse(loadInput(2020,12));
    console.log('Part I :', part1(input));
    console.log('Part II:', part2(input));
}

function parse(input) {
    return input.split('\n').map(x => {
        return {
            op: x[0],
            value: parseInt(x.slice(1), 10)
        };
    });
}

solve();