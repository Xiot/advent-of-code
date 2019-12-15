import {assert, execute, createIo, loadProgram} from '../common';

async function part1() {
    const io = createIo(1);
    const result = await execute(loadProgram('2019/09'), io);

    console.log('\nPart I');
    console.log('Keycode: ', result);
    assert(2399197539, result, 'Invalid Keycode');
}

async function part2() {
    const io = createIo(2);
    const result = await execute(loadProgram('2019/09'), io);

    console.log('\nPart II');
    console.log('Coordinates: ', result);
    assert(35106, result, 'Invalid Coordinates');
}

(async() => {
    await part1();
    await part2();
})();
