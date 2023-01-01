
import { autoParse, log } from "../../utils";
import {isEqual} from 'lodash';

export const parse = text => {
  const chunks = text.split('\n\n');
  
  const tests = [];
  let program = null;
  let id = 0;
  for(let chunk of chunks) {
    if (!chunk) continue;
    if (chunk.startsWith('Before:')) {
      const lines = chunk.split('\n');
      const before = JSON.parse(lines[0].slice(8));
      const input = lines[1].split(' ').map(x => parseInt(x));
      const after = JSON.parse(lines[2].slice(8));
      tests.push({
        id: id++,
        before, 
        input, 
        after
      });
    } else {
      program = chunk.split('\n').map(l => l.split(' ').map(x => parseInt(x)));
    }
  }
  return {
    tests,
    program
  };
};

export function part1(input) {
  let atLeast3 = 0;
  for(let t of input.tests) {
    const possible = OPS.filter(op => {
      const input = t.input.slice(1);
      const registers = [...t.before];
      op.execute(input, registers);

      return isEqual(registers, t.after);
    });
    if (possible.length >=3) {
      atLeast3++;
    }
  }
  return atLeast3;
}

export function part2(input) {

  const codeMap = discoverOpCodes(input);
  log(codeMap);
  const lookup = Object.entries(codeMap)
    .reduce((acc, [name, value]) => {
      acc[value] = OPS.find(x => x.op === name);
      return acc;
    }, []);
  log(lookup);

  const r = [0, 0, 0, 0];
  for(let ins of input.program) {
    const op = lookup[ins[0]];
    op.execute(ins.slice(1), r);
  }

  return r[0];
}

function discoverOpCodes(input) {
  const codes = {};
  let remaining = [...input.tests].map(t => ({
    test: t,
    possible: findPossible(t)
  }));

  while(true) {
    remaining.sort((l, r) => l.possible.length - r.possible.length);

    let onlyOne = remaining.find(r => r.possible.length === 1);
    if (onlyOne) {
      const op = onlyOne.possible[0];
      const opCode = onlyOne.test.input[0];
      codes[op.op] = opCode;
    }
    
    const foundCodes = Object.keys(codes);
    remaining = remaining.map(r => ({
      test: r.test,
      possible: r.possible.filter(x => !foundCodes.includes(x.op))
    })).filter(x => x.possible.length > 0);

    if (Object.keys(codes).length === 16) {
      break;
    }
  }

  return codes;
}

const cache = new Map();
const findPossible = t => {
  if (cache.has(t.id)) {
    return cache.get(t.id);
  }
  const possible = OPS.filter(op => {
    const input = t.input.slice(1);
    const registers = [...t.before];
    op.execute(input, registers);

    return isEqual(registers, t.after);
  });
  cache.set(t.id, possible);
  return possible;
};


const OPS = [
  createOp('addr', ([a, b, c], r) => {
    r[c] = r[a] + r[b];
  }),
  createOp('addi', ([a,b,c], r) => {
    r[c] = r[a] + b;
  }),
  createOp('mulr', ([a,b,c], r) => {
    r[c] = r[a] * r[b];
  }),
  createOp('muli', ([a,b,c], r) => {
    r[c] = r[a] * b;
  }),
  createOp('banr', ([a,b,c], r) => {
    r[c] = r[a] & r[b];
  }),
  createOp('bani', ([a,b,c], r) => {
    r[c] = r[a] & b;
  }),
  createOp('borr', ([a,b,c], r) => {
    r[c] = r[a] | r[b];
  }),
  createOp('bori', ([a,b,c], r) => {
    r[c] = r[a] | b;
  }),
  createOp('setr', ([a,b,c], r) => {
    r[c] = r[a];
  }),
  createOp('seti', ([a,b,c], r) => {
    r[c] = a;
  }),
  createOp('gtir', ([a,b,c], r) => {
    r[c] = a > r[b] ? 1 : 0;
  }),
  createOp('gtri', ([a,b,c], r) => {
    r[c] = r[a] > b ? 1 : 0;
  }),
  createOp('gtrr', ([a,b,c], r) => {
    r[c] = r[a] > r[b] ? 1 : 0;
  }),
  createOp('eqir', ([a,b,c], r) => {
    r[c] = a === r[b] ? 1 : 0;
  }),
  createOp('eqri', ([a,b,c], r) => {
    r[c] = r[a] === b ? 1 : 0;
  }),
  createOp('eqrr', ([a,b,c], r) => {
    r[c] = r[a] === r[b] ? 1 : 0;
  }),
];

function createOp(name, execute) {

  return {
    op: name,
    code: null,
    execute
  };
}