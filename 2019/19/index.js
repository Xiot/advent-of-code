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

    const text = visualizeGrid(grid.bounds, (x, y) => grid.get(x, y));
    console.log(text);
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
    const program = loadProgram('2019/19');

    const grid = createGridMap(' ');

    async function calc(x, y) {
        const cached = grid.get(x, y);
        if (cached !== ' ') {
            return cached === '#' ? 1 : 0;
        }

        const io = createIo([x, y]);
        await execute(program, io);

        grid.set(x, y, io.output === 1 ? '#' : '.');
        return io.output;
    }

    let slope = 49 / 33;

    async function findLeftEdge(x, y) {
        const initial = await calc(x, y);
        const distance = 2000;
        console.log('i', x, y, initial);
        if (initial === 0) {
            for(let x1 = x; x1 < x + distance; x1++) {
                const v = await calc(x1, y);
                if (v === 1) {
                    return x1;
                }
            }
        } else {
            for(let x1 = x; x1 > x - distance; x1--) {
                const v = await calc(x1, y);
                if (v === 0) {
                    return x1 + 1;
                }
            }
        }
    }

    const vy = x => Math.floor(slope * x);

    let x = 1140;
    let y = vy(x);
    while(true) {
        x = await findLeftEdge(x, y);

        const opp = await calc(x + 99, y - 99);
        if (opp === 1) {
            console.log('Final', x, y - 99, x * 10000 + (y - 99));
            break;
        }
        y += 1;
    }
}

(async () => {
    // await part1();
    await part2();
})();