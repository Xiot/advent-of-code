import {loadInput, createGridMap, toChar, toCharCode} from '../common';
import {isEqual} from 'lodash';

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
function oppositeDirection(d) {
    return (d + 2) % 4;
}
const moveOne = (pos, direction) => {
    const offset = offsetOf(direction);
    return {x: pos.x + offset.x, y: pos.y + offset.y};
};

function isLetter(c) {
    if (!c) { return false; }
    const code = toCharCode(c);
    return code >= toCharCode('A') && code <= toCharCode('Z');
}

function loadMaze(input) {

    const rawGrid = createGridMap(' ');
    const raw = input.split('\n').map((line, y) =>
        line.split('').map((cell, x) => {
            rawGrid.set(x, y, cell);
            return cell;
        })
    );

    const grid = createGridMap(' ');
    const portalMap = createGridMap();

    function valueAt(pos) {
        return rawGrid.get(pos.x, pos.y);
        // console.log(pos);
        // if (pos.y < 0 || cells.length >= pos.y || pos.x < 0 || cells[0].length)
        // return cells[pos.y][pos.x];
    }

    function getLabel(cells, x, y) {
        const first = valueAt({x, y});
        return [Direction.east, Direction.south].map(d => {
            const pos = moveOne({x, y}, d);
            const cell = valueAt(pos);
            if (!isLetter(cell)) { return undefined; }
            const label = first + cell;
            if (valueAt(moveOne(pos, d)) === '.') {
                return {
                    label,
                    exit: moveOne(pos, d),
                    entrance: pos,
                };
            } else {
                return {
                    label,
                    exit: moveOne({x, y}, oppositeDirection(d)),
                    entrance: {x, y}
                };
            }
        }).filter(Boolean)[0];
    }

    raw.forEach((line, y) => {
        line.forEach((cell, x) => {
            if(cell === ' ') { return; }
            if (cell === '.' || cell === '#') {
                grid.set(x, y, cell);
                return;
            }

            const label = getLabel(raw, x, y);
            if (label) {
                portalMap.set(label.entrance.x, label.entrance.y, label);
            }

        });
    });

    function findExitPortal(label, pos) {
        const other = Array.from(portalMap.values())
            .find(x => x.label === label && !isEqual(x.entrance, pos));
        if (!other) { return undefined; }
        return other;
    }

    return {
        grid,
        portalAt(pos) {
            return portalMap.get(pos.x, pos.y);
        },
        startPosition() {
            return this.findLabel('AA').exit;
        },
        endPosition() {
            return this.findLabel('ZZ').entrance;
        },
        findLabel(label) {
            return Array.from(portalMap.values()).find(x => x.label === label);
        },
        resolve(pos) {
            const portal = portalMap.get(pos.x, pos.y);
            if (!portal) {
                return grid.get(pos.x, pos.y) === '.'
                    ? pos
                    : undefined;
            }
            return findExitPortal(portal.label, portal.entrance).exit;
        },
        isPortal(pos) {
            return !!portalMap.has(pos.x, pos.y);
        },
        isOpen(pos) {
            const cell = grid.get(pos.x, pos.y);
            return cell === '.';
        },
        findExitPortal(portal) {
            return findExitPortal(portal.label, portal.entrance);
        }
    };
}

function part1() {
    const map = loadMaze(loadInput(2019, 20));

    const AA = map.findLabel('AA');
    const ZZ = map.findLabel('ZZ');

    console.log('AA', AA);
    console.log('ZZ', ZZ);
    console.log();

    const result = bfs(map, AA, ZZ);
    console.log(result);

}

function bfs(map, startPortal, endPortal) {
    const visited = createGridMap(false);
    visited.set(startPortal.entrance.x, startPortal.entrance.y, true);

    const stack = [{pos: startPortal.exit, distance: 0}];
    while(stack.length > 0) {
        const {pos, distance} = stack.shift();

        if (isEqual(pos, endPortal.exit)) {
            return distance ;
        }

        if (visited.get(pos.x, pos.y)) { continue; }
        visited.set(pos.x, pos.y, true);

        directions.forEach(d => {

            const raw = moveOne(pos, d);
            if (visited.get(raw.x, raw.y)) { return; }

            const portal = map.portalAt(raw);
            if (portal) {
                const portalExit = map.findExitPortal(portal);
                console.log('PORTAL', portal.label, raw, portalExit);

                visited.set(portalExit.entrance.x, portalExit.entrance.y, true);
                stack.push({pos: portalExit.exit, distance: distance + 1});
            } else if(map.isOpen(raw)) {
                stack.push({pos: raw, distance: distance + 1});
            }
        });
    }
    return undefined;
}

part1();