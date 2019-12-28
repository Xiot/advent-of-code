import {loadInput, createGridMap, visualizeGrid} from '../common';
import chalk from 'chalk';
const Direction = {
    north: 0,
    east: 1,
    south: 2,
    west: 3
};

const Turns = {
    left: 0,
    straight: 1,
    right: 2,
};

const CellIntersection = '+';
const CellTurnTokens = '/\\';

const cartTokens = '^>v<';

function rotateLeft(current) {
    return (current + 3) % 4;
}
function rotateRight(current) {
    return (current + 1) % 4;
}

function handleIntersection(cart) {
    if (cart.nextTurn === Turns.left) {
        cart.direction = rotateLeft(cart.direction);
    } else if (cart.nextTurn === Turns.right) {
        cart.direction = rotateRight(cart.direction);
    }
    cart.nextTurn = (cart.nextTurn + 1) % 3;
}
function handleTurn(cart, cell) {
    switch(cart.direction) {
    case Direction.north: return cell === '/' ? Direction.east : Direction.west;
    case Direction.south: return cell === '/' ? Direction.west : Direction.east;
    case Direction.east: return cell === '/' ? Direction.north : Direction.south;
    case Direction.west: return cell === '/' ? Direction.south : Direction.north;
    default: return cart.direction;
    }
}

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

    const map = loadMap(loadInput(2018, 13));
    let collision;
    while(true) {
        collision = map.tick();

        if (collision) { break; }
    }
    console.log('\nPart I');
    console.log(`Collision @${collision.x}, ${collision.y}`);
}

function part2() {
    const map = loadMap(loadInput(2018, 13));
    while(true) {
        map.tick(true);
        if (map.carts.length === 1) {
            break;
        }

    }

    const remaining = map.carts[0];
    console.log('\nPart II');
    console.log(`Cart @${remaining.pos.x}, ${remaining.pos.y}`);

}

part1();
part2();

function loadMap(raw) {
    const grid = createGridMap(' ');

    let carts = [];

    raw.split('\n').forEach( (line, y) => {
        line.split('').forEach((cell, x) => {
            const tokenIndex = cartTokens.indexOf(cell);
            if (tokenIndex !== -1) {
                carts.push({
                    pos: {x, y},
                    direction: tokenIndex,
                    nextTurn: Turns.left,
                });
                cell = tokenIndex % 2 === 0 ? '|' : '-';
            }
            grid.set(x, y, cell);
        });
    });

    function tick(removeCrashedCarts = false) {
        let cartIndex = 0;

        // for(let cart of carts) {
        while(cartIndex < carts.length) {
            const cart = carts[cartIndex];

            // Move Forward
            const newPos = moveOne(cart.pos, cart.direction);

            // Detect Crash
            const otherCart = carts.find(c => c !== cart && c.pos.x === newPos.x && c.pos.y === newPos.y);
            if (otherCart) {
                // Crash
                if (!removeCrashedCarts) {
                    return newPos;
                }
                // remove the carts;

                const otherIndex = carts.indexOf(otherCart);
                let offset = otherIndex < cartIndex
                    ? -1
                    : 0;

                cartIndex += offset;

                carts = carts.filter(c => c !== cart && c !== otherCart);

            } else {
                cartIndex++;
            }
            cart.pos = newPos;

            // Handle Cell
            const cell = grid.get(cart.pos.x, cart.pos.y);
            if (cell === CellIntersection) {
                handleIntersection(cart);
            } else if (CellTurnTokens.includes(cell)) {
                cart.direction = handleTurn(cart, cell);
            }
        }

        // Resort the carts
        carts.sort((l,r) => {
            return l.pos.y === r.pos.y
                ? l.pos.x - r.pos.x
                : l.pos.y - r.pos.y;
        });
    }

    function visualize() {
        const text = visualizeGrid(grid.bounds, (x, y) => {
            const cart = carts.find(c => c.pos.x === x && c.pos.y === y);
            if (cart) {
                return chalk.red(cartTokens[cart.direction]);
            }
            return grid.get(x, y);
        });
        console.log();
        console.log(text);
        console.log();
    }

    return {
        get carts() { return carts; },
        get bounds() { return grid.bounds; },

        get(pos) {return grid.get(pos.x, pos.y); },

        tick,
        visualize,
    };
}