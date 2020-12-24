import {loadInput, createGridMap, pointsWithin, extendBounds} from '../../utils';


const MOVE = {
    e: ({x,y}) => ({x: x + 1, y: y + 1}),
    w: ({x,y}) => ({x: x - 1, y: y - 1}),
    se: ({x,y}) => ({x: x, y: y + 1}),
    sw: ({x,y}) => ({x: x - 1, y: y}),
    ne: ({x,y}) => ({x: x + 1, y: y}),
    nw: ({x,y}) => ({x: x, y: y - 1}),
};

function neighbours(pos) {
    return Object.keys(MOVE).map(dir => MOVE[dir](pos));
}

function part1(input) {
    const moves = parseInput(input);

    const grid = createGridMap(0);
    for(let move of moves) {
        let pos = {x:0,y:0};

        for(let step of move) {
            pos = MOVE[step](pos);
        }
        grid.set(pos.x, pos.y, grid.get(pos.x, pos.y) + 1);
    }
    return countBlackTiles(grid);
}

function countBlackNeighbors(grid, pos) {
    return neighbours(pos).filter(pos => isBlack(grid, pos)).length;
}
function isBlack(grid, pos) {
    return grid.get(pos.x, pos.y) % 2 === 1;
}
function countBlackTiles(grid) {
    return Array.from(grid.entries()).filter(([pos, value]) =>
        value % 2 === 1
    ).length;
}
function part2(input) {
    const moves = parseInput(input);

    let grid = createGridMap(0);
    for(let move of moves) {
        let pos = {x:0,y:0};

        for(let step of move) {
            pos = MOVE[step](pos);
        }
        grid.set(pos.x, pos.y, grid.get(pos.x, pos.y) + 1);
    }

    let lastGrid = grid.clone();
    for(let day = 0; day < 100; day++) {
        for(let [x,y] of Array.from(pointsWithin(extendBounds(lastGrid.bounds, -1,-1,1,1)))) {
            const pos = {x,y};
            const black = isBlack(lastGrid, pos);
            const blackNeighbors = countBlackNeighbors(lastGrid, pos);
            if(black && (blackNeighbors === 0 || blackNeighbors > 2)) {
                grid.set(pos.x, pos.y, 0);
            } else if (!black && blackNeighbors === 2) {
                grid.set(pos.x, pos.y, 1);
            }
        }

        console.log(day+1, countBlackTiles(grid));
        lastGrid = grid.clone();
    }
    return (countBlackTiles(grid));
}

function parseInput(input) {
    // e, se, sw, w, nw, and ne
    const re = /se|sw|ne|nw|e|w/g;
    return input.split('\n')
        .map(line => {
            let match;
            const moves = [];
            while((match = re.exec(line)) != null) {
                moves.push(match[0]);
            };
            return moves;
        });
}

(function solve() {
    const input = loadInput(2020, 24);
    console.log('Part I :', part1(input));
    console.log('Part II:', part2(input));
})();