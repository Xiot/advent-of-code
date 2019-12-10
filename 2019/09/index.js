import {assert, execute, executeIterator, createIo, loadProgram, parseProgram} from '../common';

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

//const readline = require('readline');
// function askQuestion(query) {
//     const rl = readline.createInterface({
//         input: process.stdin,
//         output: process.stdout,
//     });

//     return new Promise(resolve => rl.question(query, ans => {
//         rl.close();
//         resolve(ans);
//     }));
// }

// const it = executeIterator(...params);

// let step = 0;
// let runUntil = 0;
// while(true) {
//     step ++;
//     const x = await it.next();

//     if (x.done) {
//         console.log('Result', x.value);
//         break;
//     } else {
//         console.log('op', x.value.ctx.registers, x.value.ctx.io.allOutput);
//     }
//     if (step < runUntil) {
//         continue;
//     }
//     const answer = await askQuestion('Run: ');
//     if (answer === '') {
//         runUntil = step+1;
//     } else if (answer === 'end') {
//         runUntil = 999999;
//     } else if (answer === 'q') {
//         break;
//     } else {
//         runUntil = step + parseInt(answer) ?? 1;
//     }
// }