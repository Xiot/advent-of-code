const {loadProgram, parseProgram, execute, createIo, asyncIO, permutations, assert, Stream} = require('../common');
const {range} = require('lodash');

const DEBUG = false;

async function runAmplifier(phase, input) {

    const program = loadProgram('day-07');

    const result = await execute(program, createIo([phase, input]), {debug: DEBUG});
    return result;
}

async function run(phases) {
    let result = 0;
    for(let i = 0; i < 5; i++) {
        result = await runAmplifier(phases[i], result);
        DEBUG && console.log();
    }
    return result;
}

function* stepPhases(phaseValues) {

    for(let phase of permutations(phaseValues)) {
        yield phase;
    }
}
function phaseName(values) {
    return values.map(x => String(x)).join('');
}

async function debug(phases) {
    const value = await run(phases);
    console.log(`[${phaseName(phases)}]: ${value}`);
}


async function findMax() {
    let max = {
        value: 0,
        phase: undefined
    };
    for(let phase of stepPhases([0, 1, 2, 3, 4])) {
        const value = await run(phase);
        if (value > max.value) {
            max = {value, phase};
        }
    }
    return max;
}


async function feedbackLoop(loader, phases) {

    const programs = phases.map(phase => {

        const opt = {debug: DEBUG};
        const program = loader();

        const input = new Stream([phase]);
        const output = new Stream();
        const io = asyncIO(input, output, opt);
        const run = () => {
            return execute(program, io, opt);
        };

        return {
            program,
            run,
            io,
            input,
            output
        };
    });

    programs[0].input.write(0);

    programs.forEach((p, i) => {
        const nextIndex = (i + 1) % programs.length;
        const chainedProgram = programs[nextIndex];
        p.output.on('write', value => chainedProgram.input.write(value));
    });

    const result = await Promise.all(
        programs.map(x => x.run())
    );

    return programs[4].io.output;
}

const feedbackSample = '3,26,1001,26,-4,26,3,27,1002,27,2,27,1,27,26,27,4,27,1001,28,-1,28,1005,28,6,99,0,0,5';
const feedbackSample2 = '3,52,1001,52,-5,52,3,53,1,52,56,54,1007,54,5,55,1005,55,26,1001,54,-5,54,1105,1,12,1,53,54,53,1008,54,0,55,1001,55,1,55,2,53,55,53,4,53,1001,56,-1,56,1005,56,6,99,0,0,0,0,10';

async function findMaxWithFeedback(loader) {
    let max = {
        value: 0,
        phase: undefined
    };

    for(let phase of stepPhases([5, 6, 7, 8, 9])) {
        const value = await feedbackLoop(loader, phase);
        if (value > max.value) {
            max = {value, phase};
        }
    }
    return max;
}

(async () => {
    const maxPower = await findMax();

    console.log('\nMax Power', phaseName(maxPower.phase), maxPower.value);
    assert(22012, maxPower.value, 'Max Power');
})();

(async () => {
    const loader = () => loadProgram('day-07');
    const maxPower = await findMaxWithFeedback(loader);
    console.log('\nMax Power (Feedback)', phaseName(maxPower.phase), maxPower.value);
    assert(4039164, maxPower.value, 'Max Power with Feedback');

})();