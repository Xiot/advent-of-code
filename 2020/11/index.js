import {loadInput, createGridMap, visualizeGrid} from '../../utils';

const OCCUPIED = '#';
const EMPTY = 'L';
const FLOOR = '.';

function part1(input) {
    const original = createGrid(input);

    let previous = original.clone();
    let previousOccupied = 0;

    while(true) {

        const current = previous.clone();
        let occupiedCount = 0;
        Array.from(previous.entries()).forEach(([{x,y}, value]) => {
            if (value === '.') return;
            if (value === OCCUPIED)
                occupiedCount += 1;
            const counts = countAdjacent(previous, x, y);

            if (value === EMPTY && counts[OCCUPIED] === 0) {
                current.set(x, y, OCCUPIED);
                occupiedCount +=1;
            } if (value === OCCUPIED && counts[OCCUPIED] >= 4) {
                current.set(x, y, EMPTY);
                occupiedCount -=1;
            }
        });

        if (occupiedCount === previousOccupied) {
            return occupiedCount;
        }
        previousOccupied = occupiedCount;
        previous = current;

    }
}

function countAdjacent(grid, x, y) {
    const values = {
        '#': 0,
        '.': 0,
        'L': 0
    };

    for(let dx = -1; dx <= 1; dx++) {
        for(let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            const value = grid.get(x + dx, y + dy);
            values[value] = (values[value] ?? 0) + 1;
        }
    }
    return values;
}

function part2(input) {
    const original = createGrid(input);

    let previous = original.clone();
    let previousOccupied = 0;

    while(true) {

        const current = previous.clone();
        let occupiedCount = 0;
        Array.from(previous.entries()).forEach(([{x,y}, value]) => {
            if (value === '.') return;
            if (value === OCCUPIED)
                occupiedCount += 1;
            const counts = countVisible(previous, x, y);

            if (value === EMPTY && counts[OCCUPIED] === 0) {
                current.set(x, y, OCCUPIED);
                occupiedCount +=1;
            } if (value === OCCUPIED && counts[OCCUPIED] >= 5) {
                current.set(x, y, EMPTY);
                occupiedCount -=1;
            }
        });

        // console.log(visualizeGrid(current.bounds, (x,y) => current.get(x, y)));
        // console.log('');

        if (occupiedCount === previousOccupied) {
            return occupiedCount;
        }
        previousOccupied = occupiedCount;
        previous = current;

    }
}
function countVisible(grid, x, y) {
    const values = {
        '#': 0,
        '.': 0,
        'L': 0,
        items: []
    };

    for(let dx = -1; dx <= 1; dx++) {
        for(let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;

            let ax = x + dx;
            let ay = y + dy;
            while(ax >= grid.bounds.left && ax <= grid.bounds.right && ay >= grid.bounds.top && ay <= grid.bounds.bottom) {
                if (grid.get(ax, ay) === OCCUPIED) {
                    values[OCCUPIED] += 1;
                    values.items.push({ax,ay});
                    break;
                } else if (grid.get(ax,ay) === EMPTY) {
                    break;
                }
                ax += dx;
                ay += dy;
            }
        }
    }
    return values;
}

function solve () {

    const input = loadInput(2020, 11);

    console.log('Part I :', part1(input));
    console.log('Part II:', part2(input));

}

function createGrid(input) {
    const grid = createGridMap('.');
    input.split('\n').forEach((line, row) => {
        for(let col = 0; col < line.length; col++) {
            grid.set(col, row, line[col]);
        }
    });
    return grid;
}

solve();