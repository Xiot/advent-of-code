
import { autoParse, log, byLine, maybeNumber } from "../../utils";

export const parse = byLine(line => {
  const [op, a, b, c] = line.split(' ').map(maybeNumber);
  return {op, a,b,c, inputs: [a,b,c]};
});

export function part1(input) {
  
  const cpu = createCpu();
  cpu.execute(input[0]);

  input = input.slice(1);

  while(cpu.ip >= 0 && cpu.ip < input.length) {
    const ins = input[cpu.ip];
    cpu.execute(ins);
    log(cpu.ip, cpu.registers);
  }
  return cpu.registers[0];
}

function pad4(value) {
  return String(value).padStart(4);
}

function primesLessThan(value) {
  let count = 0;
  for(let i = 3; i < value; i+= 2) {
    if (value % i === 0) {
      log(i);
      count++;
    }
  }
  return count;
}

// counts primes up to 10551403
// need to 
export function part2(input) {

  // return primesLessThan(7);

  const cpu = createCpu([1, 0, 0, 0, 0, 0]);
  cpu.execute(input[0]);

  input = input.slice(1);

  let ticks = 0;
  while(cpu.ip >= 0 && cpu.ip < input.length) {
    ticks++;
    const ip = cpu.ip;
    const ins = input[ip];
    cpu.execute(ins);

    // if (ticks > 40) break;
    if (cpu.ip === 3) {
      // cpu.registers[3] = 19;
      // cpu.registers[5] = 555336; //10551403;
      // cpu.registers[5] = 10551403;
      // cpu.registers[4] = Math.ceil(cpu.registers[2] / cpu.registers[3]);
      cpu.registers[5] = Math.ceil(cpu.registers[2] / cpu.registers[3]);
    }
    // ticks % 100 === 0 &&
    log(
      pad4(ticks), 
      pad4(ip), 
      pad4(cpu.ip), 
      '|',
      cpu.registers.map(x => String(x).padStart(10)).join('')
    );
  }
  return cpu.registers[0];
}

function createCpu(initialRegisters = [0, 0, 0, 0, 0, 0])  {

  let ipRegister = 0;
  let ip = 0;
  let registers = [...initialRegisters];
  
  return {
    get ip() {return ip;},
    get registers() { return registers; },
    execute(ins) {
      if (ins.op === '#ip') {
        
        ipRegister = ins.a;
        log('set register', ipRegister);
        return ip;
      }

      registers[ipRegister] = ip;

      const op = OPS[ins.op];
      op.execute(ins.inputs, registers);
      ip = registers[ipRegister];

      return ++ip;
    }
  };

}

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
].reduce((acc, cur) => ({...acc, [cur.op]: cur}), {});

function createOp(name, execute) {
  return {
    op: name,
    execute
  };
}