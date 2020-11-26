
import {createGridMap, range} from '../../utils';

const input = 325489;

// Help
// Ring approach
//  https://www.reddit.com/r/adventofcode/comments/7h7ufl/2017_day_3_solutions/dqowbxy?utm_source=share&utm_medium=web2x&context=3

function part1() {

    const findBottomRight = index => Math.pow(index * 2 + 1, 2);

    const findRing = input => {
        let i = 0;
        while (findBottomRight(i) < input) {
            i++;
        }
        return i;
    };

    const sizeOf = ring => ring * 2 + 1;

    const ring = findRing(input);
    const pivots = Array.from(new Array(4), (_, i) => findBottomRight(ring) - i * (sizeOf(ring) - 1));

    for(let p of pivots) {
        const distance = Math.abs(p - input);
        console.log(p, distance);
        if (distance <= sizeOf(ring) / 2 ) {
            console.log('distance', sizeOf(ring) - 1 - distance);
            return;
        }
    }
}

function part2() {
    const grid = createGridMap(0);

    const sumSquare = (grid, cx, cy) => {
        let sum = 0;
        for (let x of range(-1, 1)) {
            for(let y of range(-1, 1)) {
                sum += grid.get(cx+x, cy+y);
            }
        }
        return sum;
    };

    grid.set(0, 0, 1);

    let x = 0;
    let y = 0;
    while(true) {
        const value = sumSquare(grid, x, y);
        if (value >= input){
            console.log('Value', value);
            break;
        }
        grid.set(x, y, value);
        if ((x !== y || x >= 0) && Math.abs(x) <= Math.abs(y)) {
            x += y >= 0 ? 1 : -1;
        } else {
            y += x >= 0 ? -1 : 1;
        }
    }
}

part1();
part2();
