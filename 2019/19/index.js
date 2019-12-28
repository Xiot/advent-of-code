import {loadProgram, execute, createGridMap, pointsWithin, visualizeGrid, createIo} from '../common';

async function part1() {

    const program = loadProgram('2019/19');

    const grid = createGridMap('.');
    grid.bounds.mark(0, 0);
    grid.bounds.mark(49, 49);
    let count = 0;

    for(let [x, y] of pointsWithin(grid.bounds)) {

        const io = createIo([x, y]);
        await execute(program, io);
        if (io.output) {
            count += 1;
        }
        grid.set(x, y, io.output === 1 ? '#' : '.');
    }

    // const text = visualizeGrid(grid.bounds, (x, y) => grid.get(x, y));
    // console.log(text);
    console.log('Count', count);

    let startIndex = -1;
    for(let x = 0; x < grid.bounds.width; x++) {
        if (grid.get(x, grid.bounds.bottom) === '#') {
            startIndex = x;
            break;
        }
    }
    let endIndex = -1;
    for(let x = grid.bounds.right; x >= 0; x--) {
        if (grid.get(x, grid.bounds.bottom) === '#') {
            endIndex = x;
            break;
        }
    }
    console.log(startIndex, endIndex);

    const a = [startIndex, grid.bounds.bottom];
    const b = [endIndex, grid.bounds.bottom];
    const dot = a[0] * b[0] + a[1] * b[1];
    const lengthOf = ([x,y]) => Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

    const d = dot / (lengthOf(a) * lengthOf(b));
    console.log(d);
    const angleA = Math.acos(d);
    const angleB = (Math.PI - angleA) / 2;
    console.log(angleB);
    console.log(100 / Math.acos(d));
    const bl = 100 * Math.sin(angleB) / Math.sin(angleA);
    console.log(bl);
    // 100 / angleA = x / angleB
    // x = 100 * angleB / angleA
}


async function part2() {

}

(async () => {
    await part1();
    await part2();
})();