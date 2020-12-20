import {loadInput, range, loadGrid, createGridMap, createBounds, pointsWithin, visualizeGrid, extendBounds} from '../../utils';

const SIZE = 10;

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
    if (!ret) {
        return null;
    }
    const length = Math.sqrt(tiles.length);

    const idOf = (x,y) => ret.get(x,y).tile.id;
    const ids = [
        idOf(0, 0),
        idOf(length -1, 0),
        idOf(length -1, length -1),
        idOf(0, length - 1)
    ];
    console.log(ids);
    return ids.reduce((mul, id) => mul * id);
}

function gridSizeFrom(tiles) {
    const gridSize = Math.sqrt(tiles.length);
    return {x: gridSize, y: gridSize };
}

function tileSizeFrom(tiles) {
    const first = tiles[0].lines;
    return {
        x: first[0].length,
        y: first.length,
    };
}

const monster = loadInput(2020, 20, 'monster').split('\n');
function part2(input) {
    const tiles = parseTiles(input);

    const gridTiles = findGrid(tiles);
    const picture = createGridMap();

    const CELL_LENGTH = 10;
    const imageBounds = createBounds({left: 1, top: 1, right: CELL_LENGTH - 2, bottom: CELL_LENGTH - 2});

    const gridSize = gridSizeFrom(tiles);
    const cellSize = tileSizeFrom(tiles);

    console.log(gridSize, cellSize);
    for(let iy = 0; iy < gridSize.y; iy++) {
        for(let ix = 0; ix < gridSize.x; ix++) {
            const image = gridTiles.get(ix, iy);
            const accessor = getValue(stateAccessor(image.state, cellSize))(image.tile);

            for(let [x, y] of pointsWithin(imageBounds)) {
                picture.set(
                    x + ix * imageBounds.width,
                    y + iy * imageBounds.height,
                    accessor(x, y)
                );
            }
        }
    }

    const pictureImage = visualizeGrid(picture.bounds, (x,y) => picture.get(x, y))
        .split('\n').reverse().join('\n');

    console.log(pictureImage);
    console.log();

    const pictureTiles = {lines: pictureImage.split('\n')};
    const searchBounds = extendBounds(picture.bounds, 0, 0, -monster[0].length, -monster.length);

    const pictureSize = tileSizeFrom([pictureTiles]);

    let totalChop = 0;
    for(let [x,y] of pointsWithin(picture.bounds)) {
        if (picture.get(x, y) === '#') {
            totalChop +=1;
        }
    }

    for(let state of states) {

        const accessor = getValue(stateAccessor(state, pictureSize))(pictureTiles);
        const monsters = [];

        for(let [x,y] of pointsWithin(searchBounds)) {
            const m = findMonster(accessor, x, y);
            if (m)
                monsters.push(m);
        }

        if (monsters.length > 0) {
            console.log( monsters);
            const removeMonsters = totalChop - monsters.length * 15;
            return removeMonsters;
        }
    }
    return undefined;
}

function findMonster(accessor, x, y) {
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
    const size = {x: length, y: length};
    const l = [];
    const valueAccessor = getValue(stateAccessor(state, size))(tile);
    for(let y = 0; y < length; y++) {
        l[y] = '';
        for(let x = 0; x < length; x++) {
            l[y] += valueAccessor(x, y);
        }
    }
    return l.join('\n');
};

function findGrid(tiles) {
    const gridSize = gridSizeFrom(tiles);
    console.log(gridSize);
    for (let state of states) {
        for(let t = 0; t < tiles.length; t++) {
            const tile = tiles[t];
            const ret = createGridMap();
            ret.set(0, 0, {tile, state});
            const r = recurse(ret, removeAt(tiles, t), 1, gridSize);
            if (r.length > 0) {
                return r[0];
            }
        }
    }
    return undefined;
}

function positionOf(cell, size) {
    const y = Math.floor(cell / size.x);
    const x = cell % size.x;
    return {x, y};
}

const removeAt = (arr, index) => arr.filter((v,i) => i !== index);
const removeTile = (arr, tile) => arr.filter(x => x !== tile);

function recurse(ret, tiles, cell, gridSize) {

    if (tiles.length === 0) {
        return [ret];
    }

    const pos = positionOf(cell, gridSize);

    const possibles = tiles.flatMap(t => canFit(ret, t, cell, gridSize));

    const r = [];
    for(let p of possibles) {
        const mret = ret.clone();
        mret.set(pos.x, pos.y, p);
        r.push(...recurse(
            mret,
            removeTile(tiles, p.tile),
            cell+1,
            gridSize
        ));
    }
    return r;
}

function canFit(ret, tile, cell, gridSize) {
    const tileSize = tileSizeFrom([tile]);

    const r = [];
    const checkLeft = (tile, state, x, y) => {
        if (x <= 0) return true;
        const leftTile = ret.get(x-1, y);
        const expected = total(leftTile.state, tileSize, SIDES.right)(leftTile.tile);
        const actual = total(state, tileSize, SIDES.left)(tile);
        return actual === expected;
    };

    const checkTop = (tile, state, x, y) => {
        if (y <= 0) return true;

        const topTile = ret.get(x, y-1);
        const expected = total(topTile.state, tileSize, SIDES.bottom)(topTile.tile);
        const actual = total(state, tileSize, SIDES.top)(tile);
        return actual === expected;
    };

    const pos = positionOf(cell, gridSize);
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

const total = (state, size, side) => tile =>
    borderOfAccessor(side,size)(stateAccessor(state, size))(tile);

function stateAccessor(state, size) {
    return rotateAccessor(flipAccessor(identity, size, state.flip), size, state.rotate);
}

function flipAccessor(accessor, size, flip) {
    switch (flip) {
    case FLIPS.none: return accessor;
    case FLIPS.x: return (x, y) => accessor(size.x -1 - x, y);
    case FLIPS.y: return (x, y) => accessor(x, size.y-1 - y);
    case FLIPS.xy: return (x, y) => accessor(size.x-1 - x, size.y-1 - y);
    }
    throw new Error(`invalid flip. ${flip}`);
};

function rotateAccessor(accessor, size, rotate) {
    switch(rotate) {
    case ROTATIONS.none: return accessor;
    case ROTATIONS.one: return (x, y) => accessor(size.x-1 - y, x);
    case ROTATIONS.two: return (x, y) => accessor(size.x-1 - x, size.y-1 - y);
    case ROTATIONS.three: return (x, y) => accessor(y, size.x-1 - x);
    }
    throw new Error(`invalid rotate. ${rotate}`);
};

function borderOfAccessor(side, size) {

    return accessor => tile => {
        const valueAt = getValue(accessor)(tile);
        switch(side) {
        case SIDES.top:
            return range(0, size.x-1).map(x => {
                return valueAt(x, 0);
            }).join('');
        case SIDES.bottom:
            return range(0, size.x-1).map(x => {
                return valueAt(x, size.y-1);
            }).join('');
        case SIDES.left:
            return range(0, size.y-1).map(y => {
                return valueAt(0, y);
            }).join('');
        case SIDES.right:
            return range(0, size.y-1).map(y => {
                return valueAt(size.x-1, y);
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
    const input = loadInput(2020, 20);
    console.log('=======================');
    console.log('Part I :', part1(input));
    console.log('Part II:', part2(input));
})();