import {loadInput, createGridMap, visualizeGrid, toChar, toCharCode} from '../common';
import {isEqual} from 'lodash';
import chalk from 'chalk';

const DOT = '·';

const Direction = {
    north: 0,
    east: 1,
    south: 2,
    west: 3
};
const directions = [0, 3, 1, 2];
const directionNames = ['N', 'W', 'E', 'S'];

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

const sample1 = `#######
#G..#E#
#E#E.E#
#G.##.#
#...#E#
#...E.#
#######`;
const sample2 = `#######
#.G...#
#...EG#
#.#.#G#
#..G#E#
#.....#
#######`;
const sample3 = `#######
#E..EG#
#.#G.E#
#E.##E#
#G..#.#
#..E#.#
#######`;
const sample4 = `#######
#E.G#.#
#.#G..#
#G.#.G#
#G..#.#
#...E.#
#######`;
const sample5 = `#########
#G......#
#.E.#...#
#..##..G#
#...##..#
#...#...#
#.G...G.#
#.....G.#
#########`;
const sample6 = `#######
#.E...#
#.#..G#
#.###.#
#E#G#G#
#...#G#
#######`;

const DEBUG = true;
function tick(game, DEBUG = DEBUG) {

    const attack = (player, target) => {

        target.hp -= player.attack;
        DEBUG && console.log('Attack', player.name,  target.name,  target.hp, );
        if (target.hp <= 0) {
            game.units.remove(target);
        }
    };

    const findEnemyToAttack = player => {
        let enemies = directions
            .map(d => {
                const pos = moveOne(player.pos, d);
                const unit = game.units.at(pos);
                return {direction: d, pos, unit};
            })
            .filter(x => x.unit && x.unit.type !== player.type)
            .sort((l, r) => {
                if (l.unit.hp !== r.unit.hp) { return l.unit.hp - r.unit.hp; }
                return (directions.indexOf(l.direction) - directions.indexOf(r.direction));
            })
            .map(x => x.unit);

        return enemies[0];
    };

    const units = game.units.all();
    for(const unit of units) {

        if (unit.hp <= 0) {
            DEBUG && console.log('Remove Dead', unit.name);
            continue;
        }
        if (game.isDone()) {
            return false;
        }

        let nearby = findEnemyToAttack(unit);
        if (nearby) {
            attack(unit, nearby);
            continue;
        }

        const results = findClosest(game, unit, enemyOf(unit));
        if (!results || results.length === 0) { continue; }

        const result = findTarget(results);
        const move = result.path.shift();

        unit.pos = move.pos;
        DEBUG && console.log('Move  ', unit.name, unit.pos);
        nearby = findEnemyToAttack(unit);
        if (nearby) {
            attack(unit, nearby);
            continue;
        }
    }
    return true;

}

function part1() {
    const game = initializeMap(loadInput(2018, 15));
    // const game = initializeMap(sample1);

    let turn = 0;
    // game.print();
    while(!game.isDone()) {
        turn += 1;
        // console.log('Turn', turn);
        const roundComplete = tick(game);
        if (!roundComplete) { turn -= 1; }

        // game.units.all().forEach(u => {
        //     console.log(u.name, u.hp, u.pos);
        // });
        // game.print();
        // break;
    }

    const remainingHp = game.units.all().reduce((hp, unit) => hp + unit.hp, 0);
    console.log(remainingHp);
    console.log(turn, remainingHp, turn * remainingHp);
    // game.units.all().forEach(u => {
    //     console.log(u.name, u.hp, u.pos);
    // });
    // 60 2987
}

const part2Sample1 = `#########
#G......#
#.E.#...#
#..##..G#
#...##..#
#...#...#
#.G...G.#
#.....G.#
#########`;
const part2Sample2 = `#######
#.E...#
#.#..G#
#.###.#
#E#G#G#
#...#G#
#######`;
function part2() {

    function runSimulation(elfAttack) {
        const game = initializeMap(loadInput(2018, 15), elfAttack);
        // const game = initializeMap(part2Sample2, elfAttack);

        const initialElves = game.units.elves().length;
        const initialGoblins = game.units.goblins().length;

        let turn = 0;
        DEBUG && game.print();

        let shouldDebug = turn => false; //turn >= 10 && turn < 12;

        while(!game.isDone()) {
            turn += 1;
            console.log('Turn', turn);
            const roundComplete = tick(game, shouldDebug(turn));
            if (!roundComplete) { turn -= 1; }

            if (shouldDebug(turn)) {
                game.units.all().forEach(u => {
                    console.log(u.name, u.hp, u.pos);
                });
                game.print();
            }
        }

        const remainingHp = game.units.all().reduce((hp, unit) => hp + unit.hp, 0);

        return {
            deaths: {
                elves: initialElves - game.units.elves().length,
                goblins: initialGoblins - game.units.goblins().length,
            },
            turn,
            remainingHp,
            score: turn * remainingHp
        };
    }

    function findNoDeaths() {
        for(let attack = 23; attack < 100; attack++) {
            const result = runSimulation(attack);
            console.log('Attack', attack, result);
            if (result.deaths.elves === 0) {
                return result;
            }
        }
        return undefined;
    }

    const result = findNoDeaths();
    console.log('\nPart II');
    console.log('Score', result.score);

}

function enemyOf(unit) {
    return unit.type === 'E' ? 'G' : 'E';
}

const findTarget = results => {
    if (results.length === 1) { return results[0]; }
    return results.sort((l, r) => {
        return byReadingDistance(
            l.path[l.path.length - 2],
            r.path[r.path.length - 2],
        );
    })[0];
};

function findClosest(map, source, unitType) {

    const visited = createVisited();
    visited.set(source.pos);
    const queue = [{pos: source.pos, path: []}];

    const results = [];
    let smallestDistance = -1;

    while(queue.length > 0) {
        const {pos, path} = queue.shift();
        const unit = map.units.at(pos);

        if (smallestDistance !== -1 && path.length > smallestDistance) {
            break;
        }

        if(unit && unit.type === unitType) {
            results.push({pos, path, unit});
            smallestDistance = path.length;
            continue;
        }

        directions
            .map(d => moveOne(pos, d))
            .filter(p => !visited.get(p) && !map.isWall(p))
            .forEach(p => {

                const unit = map.units.at(p);
                if (!unit || unit.type !== source.type) {
                    queue.push({pos: p, path: [...path, {pos: p, unit}]});
                }

                visited.set(p);
            });
    }
    return results;
}

function createVisited() {
    const grid = createGridMap(false);
    return {
        get(pos) {return grid.get(pos.x, pos.y); },
        set(pos) {return grid.set(pos.x, pos.y, true); }
    };
}

function createUnitMap() {

    let units = [];

    return {
        at(pos) {
            return units.find(u => isEqual(u.pos, pos));
        },
        remove(unit) {
            units = units.filter(u => u !== unit);
        },
        add(unit) { units.push(unit); },

        all() { return units.sort(byReadingDistance); },
        goblins() {
            return units.filter(u => u.type === 'G').sort(byReadingDistance);
        },
        elves() {
            return units.filter(u => u.type === 'E').sort(byReadingDistance);
        }
    };
}
function byReadingDistance(l, r) {
    return l.pos.y === r.pos.y
        ? l.pos.x - r.pos.x
        : l.pos.y - r.pos.y;
}

function initializeMap(input, elfAttack = 3) {
    const grid = createGridMap('#');
    const units = createUnitMap();

    let nextE = 0;
    let nextG = 0;
    const getId = cell => {
        if (cell === 'G') {
            nextG += 1;
            const c = toChar(toCharCode('A') + nextG - 1);
            return {name: `G-${c}`, id: c};
        }
        nextE += 1;
        const c = toChar(toCharCode('a') + nextE - 1);
        return {name: `E-${c}`, id: c};
    };

    function getAttack(unitType) {
        return unitType === 'E'
            ? elfAttack
            : 3;
    }

    input.split('\n').forEach((line, y) => {
        line.split('').forEach((cell, x) => {

            if (cell === 'G' || cell === 'E') {
                units.add({pos: {x, y}, hp: 200, attack: getAttack(cell), type: cell, ...getId(cell)});
                cell = '.';
            }

            grid.set(x, y, cell);
        });
    });

    return {
        grid,
        isWall(pos) { return grid.get(pos.x, pos.y) === '#';},
        units,
        isDone() {
            return units.elves().length === 0 || units.goblins().length === 0;
        },

        print(path) {
            const text = visualizeGrid(grid.bounds, (x, y) => {
                const pos = {x, y};
                const unit = units.at(pos);
                const cell = grid.get(x, y);

                if (unit) {
                    return colorizeUnit(unit);
                }

                if (path && path.path) {
                    // console.log(path.path);
                    const segment = path.path.find(p => p.x === x && p.y === y);
                    if (segment) {
                        return colorize(DOT);
                    }
                }

                return colorize(cell);
            });
            console.log();
            console.log(text);
            console.log();
        }
    };
}

const colors = {
    G: chalk.red,
    E: chalk.green,
    '#': chalk.dim.white,
    '.': chalk.gray,
    [DOT]: chalk.yellow,
};

function colorizeUnit(unit) {
    const color = colors[unit.type] ?? chalk.white;
    return color(unit.id);
}
function colorize(symbol) {
    const printer = colors[symbol] ?? chalk.white;
    return printer(symbol);
};


// part1();
part2();
