
const {assert, execute, createIo, loadProgram} = require('../common');

(async () => {
    const acSignal = await execute(loadProgram('day-05'), createIo(1));
    console.log('A/C', acSignal);  // 5346030
    assert(5346030, acSignal, 'Invalid A/C');

    const heatSignal = await execute(loadProgram('day-05'), createIo(5));
    console.log('Heat', heatSignal); // 513116
    assert(513116, heatSignal, 'Invalid Heat');
})();