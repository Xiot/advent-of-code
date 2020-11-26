import { load } from 'babel-register/lib/cache';
import {loadInput} from '../../utils';

function part1() {
    const instructions = loadInput(2017, 8).split('\n').map(parseInstruction);

    const cpu = Object.create(null);
    for(let instruction of instructions) {
        if(evaluateCondition(cpu, instruction.condition)) {
            cpu[instruction.register] = process(cpu, instruction);
        }
    }
    const largest = Object.entries(cpu).reduce((ret, [key, value]) => {
        if (value > ret.value) {
            return {key, value};
        }
        return ret;
    }, {key: undefined, value: Number.MIN_SAFE_INTEGER});
    console.log('Part I', largest);
}
function part2() {
    const instructions = loadInput(2017, 8).split('\n').map(parseInstruction);

    const cpu = Object.create(null);
    let largest = {key: undefined, value: Number.MIN_SAFE_INTEGER};

    for(let instruction of instructions) {
        if(evaluateCondition(cpu, instruction.condition)) {
            const value = process(cpu, instruction);
            cpu[instruction.register] = value;
            if (value > largest.value) {
                largest = {key: instruction.register, value};
            }
        }
    }
    console.log('Part II', largest);
}

function parseInstruction(line) {
    const re = /(\w+) (inc|dec) (-?\d+) if (\w+) (.{1,2}) (-?\d+)/;
    const parts = re.exec(line);
    return {
        register: parts[1],
        op: parts[2],
        value: +parts[3],
        condition: {
            register: parts[4],
            op: parts[5],
            value: +parts[6]
        }
    };
}
function process(cpu, op) {
    const current = cpu[op.register] ?? 0;
    switch(op.op) {
    case 'inc': return current + op.value;
    case 'dec': return current - op.value;
    }
    throw new Error(`op ${op.op} not supported.`);
}

function evaluateCondition(cpu, condition)  {
    const current = cpu[condition.register] ?? 0;
    switch(condition.op) {
    case '<': return current < condition.value;
    case '>': return current > condition.value;
    case '>=': return current >= condition.value;
    case '<=': return current <= condition.value;
    case '==': return current === condition.value;
    case '!=': return current !== condition.value;
    }
    throw new Error(`op '${condition.op}' is not supported`);
};

part1();
part2();