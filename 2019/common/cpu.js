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
    setBase: 9,
    exit: 99,
};

const Mode = {
    position: 0,
    immediate: 1,
    relative: 2,
};

const HaltProgram = -1;

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
    case OpCodes.setBase:
        return 2;
    case OpCodes.exit:
        return 1;
    default:
        throw new Error(`Invalid OpCode '${code}'`);
    }
};

function parseOpCode(data, index) {
    const code = data[index];
    const op = code % 100;
    const modes = String(Math.floor(code / 100));

    const getMode = index => {
        const digit = modes[modes.length - index];
        if (digit == null) {
            return Mode.position;
        }
        return parseInt(digit);
    };

    const paramCount = operationLength(op);
    const params = range(1, paramCount)
        .map(paramIndex => {
            const mode = getMode(paramIndex);
            const value = data[index + paramIndex];

            return {
                mode,
                index: index + paramIndex - 1,
                value,
            };
        });

    return {
        raw: code,
        index,
        code: op,
        length: operationLength(op),
        parameters: params
    };
}

function toValue(ctx, param) {

    const {registers} = ctx;

    if (param.mode === Mode.position) {
        return ctx.read(param.value);

    } else if (param.mode === Mode.immediate) {
        return param.value;

    } else if (param.mode === Mode.relative) {
        return ctx.read(param.value + registers.base);
    }
}

function toPointer(ctx, param) {
    if(param.mode === Mode.position) {
        return param.value;
    } else if (param.mode === Mode.relative) {
        return param.value + ctx.registers.base;
    } else {
        throw new Error('\'immediate\' parameters can not resolve to pointers');
    }
}
const opName = value => Array.from(Object.entries(OpCodes)).find(([, code]) => code === value)[0];
const log = (ctx, op, ...args) => {
    if (!ctx.options.debug) { return; }
    console.log(`${String(ctx.instructionPointer).padStart(5, ' ')}] ${opName(op.code).padEnd(12)}`, ...args);
};

const opMap = {
    [OpCodes.exit]() {
        return HaltProgram;
    },

    [OpCodes.add](ctx, op){
        const result = toValue(ctx, op.parameters[0]) + toValue(ctx, op.parameters[1]);
        const address = toPointer(ctx, op.parameters[2]);

        log(ctx, op, toValue(ctx, op.parameters[0]), toValue(ctx, op.parameters[1]), address);

        ctx.write(address, result);
        return ctx.advance(op);
    },

    [OpCodes.multiply](ctx, op){
        const result = toValue(ctx, op.parameters[0]) * toValue(ctx, op.parameters[1]);
        const address = toPointer(ctx, op.parameters[2]);

        log(ctx, op, toValue(ctx, op.parameters[0]), toValue(ctx, op.parameters[1]), result, address);

        ctx.write(address, result);
        return ctx.advance(op);
    },
    async [OpCodes.read](ctx, op) {
        const address = toPointer(ctx, op.parameters[0]);
        const value = await ctx.io.read();

        log(ctx, op, address, value);

        if (value == null) {
            throw new Error('read returned null or undefined');
        }
        ctx.write(address, value);
        return ctx.advance(op);
    },
    [OpCodes.write](ctx, op) {
        const value = toValue(ctx, op.parameters[0]);
        log(ctx, op, value);

        ctx.io.write(value);
        return ctx.advance(op);
    },

    [OpCodes.jumpIfTrue](ctx, op) {
        log(ctx, op, toValue(ctx, op.parameters[0]) !== 0, toValue(ctx, op.parameters[1]));
        return toValue(ctx, op.parameters[0]) !== 0
            ? ctx.move(toValue(ctx, op.parameters[1]))
            : ctx.advance(op);
    },
    [OpCodes.jumpIfFalse](ctx, op) {
        log(ctx, op, toValue(ctx, op.parameters[0]) === 0, toValue(ctx, op.parameters[1]));
        return toValue(ctx, op.parameters[0]) === 0
            ? ctx.move(toValue(ctx, op.parameters[1]))
            : ctx.advance(op);
    },
    [OpCodes.equal](ctx, op) {
        const isEqual = toValue(ctx, op.parameters[0]) === toValue(ctx, op.parameters[1]);
        const address = toPointer(ctx, op.parameters[2]);

        log(ctx, op, isEqual, address);

        ctx.write(address, isEqual ? 1 : 0);
        return ctx.advance(op);
    },
    [OpCodes.lessThan](ctx, op) {
        const lessThan = toValue(ctx, op.parameters[0]) < toValue(ctx, op.parameters[1]);
        const address = toPointer(ctx, op.parameters[2]);

        log(ctx, op, lessThan, address);

        ctx.write(address, lessThan ? 1 : 0);
        return ctx.advance(op);
    },
    [OpCodes.setBase](ctx, op) {
        const value = toValue(ctx, op.parameters[0]);
        ctx.registers.base += value;
        log(ctx, op, value, ctx.registers.base);

        return ctx.advance(op);
    }
};

function processOperation(ctx, op) {
    const processor = opMap[op.code];
    if (!processor) {
        console.log('\nINVALID', op);
        process.exit();
    }
    return processor(ctx, op);
}

function asyncIO(input, output) {

    let lastWrite = undefined;
    return {
        async read() {
            const value = await input.read();
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
    let readIndex = 0;

    if (!Array.isArray(input)) {
        input = [input];
    }
    const written = [];

    return {
        read() {
            if (readIndex > input.length) {
                throw new Error('I/O Exception: No data to read');
            }
            return input[readIndex++];
        },
        write(value) {
            if (value == null || isNaN(value)) {
                throw new Error('Attempt to write an invalid number');
            }
            written.push(value);
        },
        get output() {return written[written.length - 1]; },
        get allOutput() {return written; }
    };
}

function createContext(data, io, registers, options) {
    let instructionPointer = 0;
    let program = [...data];

    function ensureAddress(address) {
        if (address < program.length) { return; }

        const previousLength = program.length;
        program.length = address + 1;
        program.fill(0, previousLength);
    }

    return {
        advance(val) {
            if (typeof val === 'number') {
                return instructionPointer += val;
            } else if ('length' in val) {
                return instructionPointer += val.length;
            } else {
                throw new Error(`Unable to advance. ${JSON.stringify(val)}`);
            }
        },
        move(val) {
            return instructionPointer = val;
        },
        read(address) {
            ensureAddress(address);
            return program[address];
        },
        write(address, value) {
            ensureAddress(address);
            program[address] = value;
        },
        get data() {return program; },
        registers,
        io,
        options,
        get instructionPointer() {
            return instructionPointer;
        },
    };
}

async function execute(input, io, opt = {debug: false}) {

    for await (let state of executeIterator(input, io, opt)) {
        // Run through all operations
    }
    return io.output;
}

async function* executeIterator(input, io, opt = {debug: false}) {
    const ctx = createContext(input, io, {base: 0}, opt);

    while (ctx.instructionPointer < ctx.data.length) {
        const op = parseOpCode(ctx.data, ctx.instructionPointer);
        if (op.code === OpCodes.exit) {

            opt.debug && printDebugInformation(ctx, op);
            break;
        }

        await processOperation(ctx, op);
        opt.debug && printDebugInformation(ctx, op);
        yield {ctx, op};
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

function printDebugInformation(ctx, op) {

    const clone = [...ctx.data];

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
        if (param.mode !== Mode.immediate && op.code !== OpCodes.setBase) {
            hilight(toPointer(ctx, param), color);
        }
    });

    const instructionPointer = colors.op(String(op.index).padStart(4, ' '));
    console.log(`${instructionPointer}] ${clone.map(x => String(x)).join(',')} [${clone.length}]`);
}

const {prompt} = require('../../utils/io');
function createInteractiveHandler(opts) {
    let step = 0;
    let runUntil = 0;
    let bp = undefined;

    const filter = opts.filter ?? (() => true);
    const handler = opts.handler ?? (() => {});

    return async (current) => {

        if (current.done) { return false; }

        if (filter(current) === false) {
            return true;
        }
        step++;

        handler(current);
        // console.log(current.ctx.instructionPointer, runUntil);
        if (runUntil !== undefined && step < runUntil) {
            return true;
        }
        if (bp !== undefined && current.ctx.instructionPointer !== bp) {
            return true;
        }
        bp = undefined;

        const answer = await prompt('Run: ');
        if (answer === 'q') {
            return false;
        }

        if (answer === '') {
            // eslint-disable-next-line require-atomic-updates
            runUntil = step + 1;
        } else if (answer.startsWith(':')) {
            // eslint-disable-next-line require-atomic-updates
            bp = parseInt(answer.substring(1));
        } else if (answer === 'end') {
            // eslint-disable-next-line require-atomic-updates
            runUntil = 999999;
        } else {
            // eslint-disable-next-line require-atomic-updates
            runUntil = step + parseInt(answer) ?? 1;
        }
        return true;
    };
}

async function stepExecute(input, io, handler) {
    const it = executeIterator(input, io, {debug: false});

    // eslint-disable-next-line no-constant-condition
    while(true) {
        const x = await it.next();

        const shouldContinue = await handler({done: x.done, ...x.value});
        if (x.done || !shouldContinue) {
            break;
        }
    }
}

module.exports = {
    createIo,
    asyncIO,
    execute,
    executeIterator,
    loadProgram,
    parseProgram,
    OpCodes,

    createInteractiveHandler,
    stepExecute
};