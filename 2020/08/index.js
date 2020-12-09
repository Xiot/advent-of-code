import {loadInput} from '../../utils';

function part1() {
    const input = loadInput(2020, 8).split('\n').map(parseInstruction);

    const env = {ptr: 0, register: 0};
    let lastPtr = -1;
    let lastValue = -1;
    let cache = new Set();
    let result;
    while(true) {
        lastPtr = env.ptr;
        lastValue = env.register;
        process(env, input[env.ptr]);
        if (cache.has(env.ptr)) {
            break;
        }
        cache.add(env.ptr);
    }

    console.log('Part I', lastPtr, env.register, );
}

function process(env, ins) {
    // console.log(env.ptr, ins.code, ins.value);

    switch(ins.code) {
    case 'nop': {
        env.ptr += 1;
        return;
    }
    case 'acc': {
        env.register += ins.value;
        env.ptr += 1;
        break;
    }
    case 'dec': {
        env.register -= ins.value;
        env.ptr += 1;
        break;
    }
    case 'jmp': {
        env.ptr += ins.value;
    }
    }
}

function part2() {
    const input = loadInput(2020, 8).split('\n').map(parseInstruction);

    for (let i = 0; i < input.length; i++) {
        if (input[i].code !== 'nop' && input[i].code !== 'jmp') continue;

        const modified = input.map(x => ({...x}));
        modified[i].code = modified[i].code === 'jmp' ? 'nop' : 'jmp';
        const ret = detectLoop(modified);
        if (!ret.loop) {
            console.log('Part II', ret.env.register);
            break;
        }
    }
    console.log('all loops');
    // console.log('Part II');
}

function detectLoop(instructions) {
    const env = {ptr: 0, register: 0};
    let lastPtr = -1;
    let lastValue = -1;
    let cache = new Set();
    let result;
    while(true) {
        if (env.ptr >= instructions.length) {
            return {loop: false, env};
        }
        lastPtr = env.ptr;
        lastValue = env.register;
        process(env, instructions[env.ptr]);
        if (cache.has(env.ptr)) {
            return {loop: true, env};
        }
        cache.add(env.ptr);
    }
}

// part1();
part2();


function parseInstruction(line) {
    const parts = /(\w+) ([+|-]\d+)/.exec(line);
    return {
        code: parts[1],
        value: parseInt(parts[2])
    };
}