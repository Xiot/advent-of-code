import {loadInput, range, loadGrid, createGridMap, createBounds, pointsWithin, visualizeGrid, extendBounds} from '../../utils';

const SIZE = 10;
const LAST_INDEX = SIZE - 1;

const SIDES = {
    top: 0,
    right: 1,
    bottom: 2,
    left: 3,
};

const ROTATIONS = {
    none: 0,
    one: 1,
    two: 2,
    three: 3
};

const FLIPS = {
    none: 0,
    x: 1,
    y: 2,
    xy: 3
};
const identity = (x, y) => ({x, y});
const getValue = accessor => tile => (x, y) => {
    const p = accessor(x, y);
    if (!p) {
        console.log('no p', x, y);
    }
    if (!tile.lines[p.y]) {
        console.log('no line', p, tile.lines);
    }
    return tile.lines[p.y][p.x];
};

const states = cleanStates(
    range(0, 3) // rotations
        .flatMap(r => {
            return range(0, 3) // flips
                .map(f => ({
                    rotate: r,
                    flip: f
                }));
        })
);

function cleanStates(states) {
    const sample = `#.##...##.
#.####...#
.....#..##
#...######
.##.#....#
.###.#####
###.##.##.
.###....#.
..#.#..#.#
#...##.#..`.split('\n');
    const cache = new Map();
    return states.reduce((acc, state) => {
        const image = printTile({lines: sample}, state);
        if (!cache.has(image)) {
            cache.set(image, state);
            acc.push(state);
        }
        return acc;
    }, []);
};

function part1(input) {
    const tiles = parseTiles(input);

    const ret = findGrid(tiles);

    const length = Math.sqrt(tiles.length);

    const idOf = (x,y) => ret.get(x,y).tile.id;
    const ids = [
        idOf(0, 0),
        idOf(length -1, 0),
        idOf(length -1, length -1),
        idOf(0, length - 1)
    ];
    return ids.reduce((mul, id) => mul * id);
}

const monster = loadInput(2020, 20, 'monster').split('\n');
function part2(input) {
    const tiles = parseTiles(input);
    const length = Math.sqrt(tiles.length);

    const gridTiles = findGrid(tiles);
    const picture = createGridMap();

    const CELL_LENGTH = 10;
    const imageBounds = createBounds({left: 1, top: 1, right: CELL_LENGTH - 2, bottom: CELL_LENGTH - 2});

    for(let iy = 0; iy < length; iy++) {
        for(let ix = 0; ix < length; ix++) {
            const image = gridTiles.get(ix, iy);
            const accessor = getValue(stateAccessor(image.state))(image.tile);

            for(let [x, y] of pointsWithin(imageBounds)) {
                picture.set(
                    x + ix * imageBounds.width,
                    y + iy * imageBounds.height,
                    accessor(x, y)
                );
            }
        }
    }
    console.log(picture.bounds.toJSON());

    const pictureImage = visualizeGrid(picture.bounds, (x,y) => picture.get(x, y))
        .split('\n').reverse().join('\n');

    console.log(pictureImage);
    console.log();

    const pictureTiles = {lines: pictureImage.split('\n')};
    console.log(pictureTiles.lines.length, pictureTiles.lines[0].length);
    const b = extendBounds(picture.bounds, 0, 0, -monster[0].length, -monster.length);

    for(let state of states) {
        console.log(state);
        const accessor = getValue(stateAccessor(state))(pictureTiles); //stateAccessor(state)()
        const monsters = [];
        for(let [x,y] of pointsWithin(b)) {
            const m = findMonster(accessor, x, y);
            if (m)
                monsters.push(m);
        }
        if (monsters.length > 0) {
            console.log(state, monsters);
            return monsters.reduce((sum, m) => sum + m.chop);
        }
    }
    return undefined;
}

function findMonster(accessor, x, y) {
    // console.log('findMonster', x, y);
    let chop = 0;
    for(let my = 0; my < monster.length; my++) {
        for(let mx = 0; mx < monster[0].length; mx++) {

            const monsterValue = monster[my][mx];
            const value = accessor(x + mx, y + my);
            if (monsterValue === '#' && value !== '#') return undefined;

            if (value === '#')
                chop++;
        }
    }
    return {
        chop,
        x,
        y
    };
}

function printTile(tile, state) {
    const length = tile.lines.length;
    const l = [];
    const valueAccessor = getValue(stateAccessor(state))(tile);
    for(let y = 0; y < length; y++) {
        l[y] = '';
        for(let x = 0; x < length; x++) {
            l[y] += valueAccessor(x, y);
        }
    }
    return l.join('\n');
};

function findGrid(tiles) {
    const length = Math.sqrt(tiles.length);
    for (let state of states) {
        for(let t = 0; t < tiles.length; t++) {
            const tile = tiles[t];
            const ret = createGridMap();
            ret.set(0, 0, {tile, state});
            const r = recurse(ret, removeAt(tiles, t), 1, length);
            if (r.length > 0) {
                return r[0];
            }
        }
    }
    return undefined;
}

function positionOf(cell, size) {
    const y = Math.floor(cell / size);
    const x = cell % size;
    return {x, y};
}

const removeAt = (arr, index) => arr.filter((v,i) => i !== index);
const removeTile = (arr, tile) => arr.filter(x => x !== tile);

function recurse(ret, tiles, cell, size) {

    if (tiles.length === 0) {
        return [ret];
    }

    const pos = positionOf(cell, size);
    const possibles = tiles.flatMap(t => canFit(ret, t, cell, size));

    const r = [];
    for(let p of possibles) {
        const mret = ret.clone();
        mret.set(pos.x, pos.y, p);
        r.push(...recurse(
            mret,
            removeTile(tiles, p.tile),
            cell+1,
            size
        ));
    }

    return r;
}

function canFit(ret, tile, cell, size) {
    const r = [];
    const checkLeft = (tile, state, x, y) => {
        if (x <= 0) return true;
        const leftTile = ret.get(x-1, y);
        const expected = total(leftTile.state, SIDES.right)(leftTile.tile);
        const actual = total(state, SIDES.left)(tile);
        return actual === expected;
    };

    const checkTop = (tile, state, x, y) => {
        if (y <= 0) return true;

        const topTile = ret.get(x, y-1);
        const expected = total(topTile.state, SIDES.bottom)(topTile.tile);
        const actual = total(state, SIDES.top)(tile);
        return actual === expected;
    };

    const pos = positionOf(cell, size);
    for(let state of states) {
        if (checkLeft(tile, state, pos.x, pos.y) && checkTop(tile, state, pos.x, pos.y)) {
            r.push({
                tile,
                state
            });
        }
    }
    return r;
}

const total = (state, side) => tile =>
    borderOfAccessor(side)(stateAccessor(state))(tile);

function stateAccessor(state) {
    return rotateAccessor(flipAccessor(identity, state.flip), state.rotate);
}

function flipAccessor(accessor, flip) {
    switch (flip) {
    case FLIPS.none: return accessor;
    case FLIPS.x: return (x, y) => accessor(LAST_INDEX - x, y);
    case FLIPS.y: return (x, y) => accessor(x, LAST_INDEX - y);
    case FLIPS.xy: return (x, y) => accessor(LAST_INDEX - x, LAST_INDEX - y);
    }
    throw new Error(`invalid flip. ${flip}`);
};

function rotateAccessor(accessor, rotate) {
    switch(rotate) {
    case ROTATIONS.none: return accessor;
    case ROTATIONS.one: return (x, y) => accessor(LAST_INDEX - y, x);
    case ROTATIONS.two: return (x, y) => accessor(LAST_INDEX - x, LAST_INDEX - y);
    case ROTATIONS.three: return (x, y) => accessor(y, LAST_INDEX - x);
    }
    throw new Error(`invalid rotate. ${rotate}`);
};

function borderOfAccessor(side) {

    return accessor => tile => {
        const valueAt = getValue(accessor)(tile);
        switch(side) {
        case SIDES.top:
            return range(0, LAST_INDEX).map(x => {
                return valueAt(x, 0);
                // const pos = accessor(x, 0);
                // return tile.lines[pos[1]][pos[0]];
            }).join('');
        case SIDES.bottom:
            return range(0, LAST_INDEX).map(x => {
                return valueAt(x, LAST_INDEX);
                // const pos = accessor(x, LAST_INDEX);
                // return tile.lines[pos[1]][pos[0]];
            }).join('');
        case SIDES.left:
            return range(0, LAST_INDEX).map(y => {
                return valueAt(0, y);
                // const pos = accessor(0, y);
                // return tile.lines[pos[1]][pos[0]];
            }).join('');
        case SIDES.right:
            return range(0, LAST_INDEX).map(y => {
                return valueAt(LAST_INDEX, y);
                // const pos = accessor(LAST_INDEX, y);
                // return tile.lines[pos.y][pos.x];
            }).join('');
        }
    };
}

function parseTiles(input) {
    return input.split('\n\n').map(block => {
        const lines = block.split('\n');
        return {
            id: parseInt(lines[0].substring(5, lines.[0].length - 1), 10),
            lines: lines.slice(1),
            data: loadGrid(lines.slice(1))
        };
    });
}

(function solve() {
    const input = loadInput(2020, 20, 'sample');
    console.log('=======================');
    // console.log('Part I :', part1(input));
    console.log('Part II:', part2(input));
})();