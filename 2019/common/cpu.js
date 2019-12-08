// TODO: May move this back to sync

const fs = require('fs');
const chalk = require('chalk');
const {range} = require('lodash');

const OpCodes = {
    add: 1,
    multiply: 2,
    read: 3,
    write: 4,
    jumpIfTrue: 5,
    jumpIfFalse: 6,
    lessThan: 7,
    equal: 8,
    exit: 99,
};
const Mode = {
    position: 0,
    immediate: 1,
};

const operationLength = code => {

    switch(code) {
    case OpCodes.add:
    case OpCodes.multiply:
    case OpCodes.equal:
    case OpCodes.lessThan:
        return 4;
    case OpCodes.jumpIfFalse:
    case OpCodes.jumpIfTrue:
        return 3;
    case OpCodes.read:
    case OpCodes.write:
        return 2;
    case OpCodes.exit:
        return 1;
    default:
        throw new Error(`Invalid OpCode '${code}'`);
    }
};

function parseOpCode(data, index) {
    const code = data[index];
    let x = parseInt(code);
    const op = x % 100;
    x = Math.floor(x / 100);

    const getMode = val => val === 0 ? Mode.position : Mode.immediate;

    const paramCount = operationLength(op);
    const params = range(1, paramCount)
        .map(paramIndex => {
            const mode = getMode(x & Math.pow(10, paramIndex - 1));
            const value = data[index + paramIndex];

            return {
                raw: code,
                mode,
                index: mode === Mode.position ? value : index + 1,
                value: mode === Mode.position ? data[value] : value
            };
        });

    return {
        index,
        code: op,
        length: operationLength(op),
        parameters: params
    };
}

function valueAt(data, index, mode) {
    if (mode === Mode.immediate) {
        return data[index];
    } else {
        return data[data[index]];
    }
}
function setValue(data, addressPointer, value) {
    data[data[addressPointer]] = value;
}

function processAdd(op, data, index) {
    const result = op.parameters[0].value + op.parameters[1].value;
    data[op.parameters[2].index] = result;
    return index + op.length;
}

function processMultiply(op, data, index) {
    const result = op.parameters[0].value * op.parameters[1].value;
    data[op.parameters[2].index] = result;
    return index + op.length;
}

async function processRead(op, data, index, io) {
    setValue(data, index + 1, await io.read());
    return index + op.length;

}
function processWrite(op, data, index, io) {
    io.write(data[data[index + 1]]);
    return index + op.length;
}

function processStop(op) {
    return -1;
}

const opMap = {
    [OpCodes.exit]: processStop,

    [OpCodes.add]: processAdd,
    [OpCodes.multiply]: processMultiply,
    [OpCodes.read]: processRead,
    [OpCodes.write]: processWrite,

    [OpCodes.jumpIfTrue](op, data, index, io) {
        return op.parameters[0].value !== 0
            ? op.parameters[1].value
            : index + 3;
    },
    [OpCodes.jumpIfFalse](op, data, index) {
        return op.parameters[0].value === 0
            ? op.parameters[1].value
            : index + 3;
    },
    [OpCodes.equal](op, data, index) {
        const isEqual = op.parameters[0].value === op.parameters[1].value;
        data[op.parameters[2].index] = isEqual ? 1 : 0;
        return index + 4;
    },
    [OpCodes.lessThan](op, data, index) {
        const lessThan = op.parameters[0].value < op.parameters[1].value;
        data[op.parameters[2].index] = lessThan ? 1 : 0;
        return index + 4;
    }
};

function processOperation(op, data, index, io) {
    const processor = opMap[op.code];
    if (!processor) {
        console.log('\nINVALID', op);
        process.exit();
    }
    return processor(op, data, index, io);
}

function asyncIO(input, output, {debug} = {debug: false}) {

    let lastWrite = undefined;
    return {
        async read() {
            const value = await input.read();
            debug && console.log('read', value);
            return value;
        },
        write(value) {
            lastWrite = value;
            return output.write(value);
        },
        on(event, cb) {
            return output.on(event, cb);
        },
        get output() { return lastWrite; },
        getLast() { return lastWrite; }
    };
}

function createIo(input) {
    let storedValue = 0;
    let readIndex = 0;

    if (!Array.isArray(input)) {
        input = [input];
    }


    return {
        read() {
            if (readIndex >= input.length) {
                throw new Error('I/O Exception: No data to read');
            }
            return input[readIndex++];
        },
        write(value) {
            storedValue = value;
        },
        get output() {return storedValue; }
    };
}

async function execute(input, io, opt = {debug: false}) {
    let index = 0;

    while (index < input.length) {
        const op = parseOpCode(input, index);
        if (op.code === OpCodes.exit) {

            opt.debug && printDebugInformation(input, op);
            break;
        }

        index = await processOperation(op, input, index, io);
        opt.debug && printDebugInformation(input, op);
    }
    return io.output;
}

function findInput(name) {
    return [
        name,
        `./${name}/input.txt`,
        `./day-${name}/input.txt`
    ].find(x => {
        const stat = fs.statSync(x);
        return stat.isFile();
    });
}

function loadProgram(name) {
    const programFile = findInput(name);
    if (!programFile) {
        throw new Error(`File Not Found: ${name}`);
    }
    return parseProgram(fs.readFileSync(programFile, 'utf-8'));
}

function parseProgram(text) {
    return text.split(',').map(Number);
}

function printDebugInformation(data, op) {

    const clone = [...data];

    const colors ={
        op: chalk.yellow,
        p1: chalk.green,
        p2: chalk.redBright,
        p3: chalk.cyan,
        parameters: [chalk.green, chalk.redBright, chalk.cyan]
    };

    const hilight = (pos, color) => {
        clone[pos] = color(clone[pos]);
    };

    hilight(op.index, colors.op);
    op.parameters.forEach((p, i) => {
        const param = op.parameters[i];
        const color = colors.parameters[i];
        hilight(op.index + i + 1, color);
        if (param.mode === Mode.position) {
            hilight(param.index, color);
        }
    });

    const instructionPointer = colors.op(String(op.index).padStart(4, ' '));
    console.log(`${instructionPointer}] ${clone.map(x => String(x)).join(',')}`);
}

module.exports = {
    createIo,
    asyncIO,
    execute,
    loadProgram,
    parseProgram
};