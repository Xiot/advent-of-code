import { isEqual } from 'lodash';
import { byLine, log } from '../../utils';
type Input = ReturnType<typeof parse>;

export const parse = (text: string) => {
  const sections = text.split('\n\n');

  const registers = sections[0].split('\n').reduce(
    (acc, line) => {
      const m = line.match(/([a-z]): (\d+)/i);
      const [, name, value] = m;

      acc[name] = parseInt(value);

      return acc;
    },
    { ip: 0 } as { A: number; B: number; C: number; ip: number },
  );

  return {
    registers,
    program: sections[1]
      .split(': ')[1]
      .split(',')
      .map(x => parseInt(x)),
  };
};

function combo(reg: Registers, val: number) {
  if (val <= 3) return val;
  if (val === 4) return reg.A;
  if (val === 5) return reg.B;
  if (val === 6) return reg.C;

  throw new Error('unknown value');
}

type Registers = Input['registers'];

type OpResult =
  | { action: 'noop' }
  | { action: 'set'; register: keyof Registers; value: number }
  | { action: 'jump'; value: number }
  | { action: 'print'; value: number };

type OpCode = {
  name: string;
  exec(reg: Registers, args: number): OpResult;
};

const OPS: Record<number, OpCode> = {
  0: {
    name: 'adv',
    exec(reg: Registers, arg: number) {
      const value = Math.trunc(reg.A / Math.pow(2, combo(reg, arg)));
      return {
        action: 'set',
        register: 'A',
        value,
      };
    },
  },
  1: {
    name: 'bxl',
    exec(reg: Registers, arg: number) {
      const value = reg.B ^ arg;
      return {
        action: 'set',
        register: 'B',
        value,
      };
    },
  },
  2: {
    name: 'bst',
    exec(reg: Registers, arg: number) {
      const value = combo(reg, arg) % 8;
      return {
        action: 'set',
        register: 'B',
        value,
      };
    },
  },
  3: {
    name: 'jnz',
    exec(reg: Registers, arg: number) {
      if (reg.A === 0) return { action: 'noop' };
      return {
        action: 'jump',
        value: arg,
      };
    },
  },
  4: {
    name: 'bxc',
    exec(reg: Registers, arg: number) {
      const value = reg.B ^ reg.C;
      return {
        action: 'set',
        register: 'B',
        value,
      };
    },
  },
  5: {
    name: 'out',
    exec(reg: Registers, arg: number) {
      const value = combo(reg, arg) % 8;
      return {
        action: 'print',
        value,
      };
    },
  },
  6: {
    name: 'bdv',
    exec(reg, arg) {
      const value = Math.trunc(reg.A / Math.pow(2, combo(reg, arg)));
      return {
        action: 'set',
        register: 'B',
        value,
      };
    },
  },
  7: {
    name: 'bdv',
    exec(reg, arg) {
      const value = Math.trunc(reg.A / Math.pow(2, combo(reg, arg)));
      return {
        action: 'set',
        register: 'C',
        value,
      };
    },
  },
};

export function part1(input: Input) {
  log('input', input);

  const { program, registers } = input;
  return run(registers, program).join(',');
}

const HALT = Symbol('halt');
function run(registers: Registers, program: number[], cb: (val: number) => void | typeof HALT = () => void 0) {
  const screen: number[] = [];
  while (registers.ip < program.length) {
    const code = program[registers.ip];
    const value = program[registers.ip + 1];

    const op = OPS[code];
    if (op == null) break;
    if (value == null) break;

    const ret = op.exec(registers, value);

    // log(op.name, ret);

    if (ret.action === 'jump') {
      registers.ip = ret.value;
      continue;
    }
    if (ret.action === 'print') {
      const r = cb(ret.value);
      if (r === HALT) {
        return null;
      }

      screen.push(ret.value);
    } else if (ret.action === 'set') {
      registers[ret.register] = ret.value;
    }
    registers.ip += 2;
  }

  return screen;
}

export function part2(input: Input) {
  const target = [...input.program];

  // for (let i = 0; i < input.program.length; i += 2) {
  //   const op = OPS[input.program[i]];
  //   log(op.name, input.program[i + 1]);
  // }

  let a = 6;
  while (true) {
    let index = 0;
    const registers = { ...input.registers, A: a };
    const ret = run(registers, input.program, v => {
      if (target[index++] !== v) return HALT;
    });
    log(a, ret);

    if (isEqual(ret, target)) return a;
    a += 6;
  }

  // const registers = input.registers;
  // registers.A = 128 + 0b111;
  // const ret = run(registers, input.program);
  // log(ret);

  // let x = 64;
  // for (let i = 2; i < 20; i++) {
  //   log(i, 64 * i, ((64 * i) / 64) & 0b010);
  // }

  // first(1);
  // first(2);
  // first(4);
  // first(8);
  // first(16);
  // first(32);
  // first(64);
  // first(128);
}

function first(val: number) {
  log(` ${val} -----`);
  for (let i = 2; i < 20; i++) {
    log(i, val * i, ((val * i) / val) & 0b010);
  }
}
