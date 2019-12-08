const fs = require('fs');

const load = () => fs.readFileSync('./day-05/input.txt', 'utf-8').split(',').map(Number);

// const OpCodes = {
//     add: 1,
//     multiply: 2,
//     read: 3,
//     write: 4,
//     jumpIfTrue: 5,
//     jumpIfFalse: 6,
//     lessThan: 7,
//     equal: 8,
//     exit: 99,
// }
// const Mode = {
//     position: 0,
//     immediate: 1,
// }

// const parameterLength = code => {

//     switch(code) {
//     case OpCodes.add:
//     case OpCodes.multiply:
//     case OpCodes.equal:
//     case OpCodes.lessThan:
//         return 4;
//     case OpCodes.jumpIfFalse:
//     case OpCodes.jumpIfTrue:
//         return 3;
//     case OpCodes.read:
//     case OpCodes.write:
//         return 2;
//     case OpCodes.exit:
//         return 0;
//     default:
//         throw new Error(`Invalid OpCode '${code}'`);
//     }
// }

// function parseOpCode(code) {
//     let x = parseInt(code);
//     const op = x % 100;
//     x = Math.floor(x / 100);

//     const getMode = val => val === 0 ? Mode.position : Mode.immediate;

//     return {
//         code: op,
//         length: parameterLength(op),
//         modes: [
//             getMode(x & 1),
//             getMode(x & 10),
//             getMode(x & 100),
//         ]
//     }
// }

// function valueAt(data, index, mode) {
//     if (mode === Mode.immediate) {
//         return data[index];
//     } else {
//         return data[data[index]]
//     }
// }

// function parameterValue(data, index, op, p) {
//     return valueAt(data, index + p, op.modes[p-1])
// }

// function processAdd(op, data, index) {
//     const result = valueAt(data, index+1, op.modes[0]) + valueAt(data, index +2, op.modes[1]);
//     data[data[index+3]] = result;
//     return index + op.length;
// }

// function processMultiply(op, data, index) {
//     const result = valueAt(data, index+1, op.modes[0]) * valueAt(data, index +2, op.modes[1]);
//     data[data[index+3]] = result;
//     return index + op.length;
// }

// function processRead(op, data, index, io) {
//     data[data[index + 1]] = io.read();
//     return index + op.length;

// }
// function processWrite(op, data, index, io) {
//     io.write(data[data[index + 1]]);
//     return index + op.length;
// }

// function processStop(op) {
//     return -1;
// }

// const opMap = {
//     [OpCodes.exit]: processStop,

//     [OpCodes.add]: processAdd,
//     [OpCodes.multiply]: processMultiply,
//     [OpCodes.read]: processRead,
//     [OpCodes.write]: processWrite,

//     [OpCodes.jumpIfTrue](op, data, index, io) {
//         return parameterValue(data, index, op, 1) !== 0
//             ? parameterValue(data, index, op, 2)
//             : index + 3;
//     },
//     [OpCodes.jumpIfFalse](op, data, index) {
//         return parameterValue(data, index, op, 1) === 0
//             ? parameterValue(data, index, op, 2)
//             : index + 3;
//     },
//     [OpCodes.equal](op, data, index) {
//         const isEqual = parameterValue(data, index, op, 1) === parameterValue(data, index, op, 2);
//         data[data[index + 3]] = isEqual ? 1 : 0;
//         return index + 4;
//     },
//     [OpCodes.lessThan](op, data, index) {
//         const lessThan = parameterValue(data, index, op, 1) < parameterValue(data, index, op, 2);
//         data[data[index + 3]] = lessThan ? 1 : 0;
//         return index + 4;
//     }
// }

// function processOperation(op, data, index, io) {
//     const processor = opMap[op.code];
//     if (!processor) {
//         console.log('\nINVALID', op);
//         process.exit();
//     }
//     return processor(op, data, index, io);
// }

// function createIo(input) {
//     let storedValue = 0;
//     return {
//         read() {return input;},
//         write(value) { storedValue = value; },
//         get output() {return storedValue; }
//     }
// }

// function execute(io) {
//     const input = load();
//     let index = 0;
//     while (index < input.length) {
//         const op = parseOpCode(input[index]);
//         if (op.code === OpCodes.exit) {
//             break;
//         }

//         index = processOperation(op, input, index, io);
//     }
//     return io.output;
// }

const {assert, execute, createIo, loadProgram} = require('../common');

(async () => {
// const acSignal = execute(createIo(1));
const acSignal = await execute(loadProgram('day-05'), createIo(1));
console.log('A/C', acSignal);  // 5346030
assert(5346030, acSignal, 'Invalid A/C');

// const heatSignal = execute(createIo(5));
const heatSignal = await execute(loadProgram('day-05'), createIo(5));
console.log('Heat', heatSignal); // 513116
assert(513116, heatSignal, 'Invalid Heat');
})();