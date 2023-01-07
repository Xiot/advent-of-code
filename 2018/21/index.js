
import { autoParse, log, byLine, maybeNumber } from "../../utils";
import {calc} from './calc';

export const parse = byLine(line => {
  const [op, a, b, c] = line.split(' ').map(maybeNumber);
  return {op, a,b,c, inputs: [a,b,c]};
});

// 16773710 - too high
// 14045034 - too high
// 11600695 - too low
// 13728745 - wrong
export function part3(input) {
  calc(0);
}

// 11578381 - high (33 ticks)
// 9566170 - correct
export function part1(input) {
  
  const cpu = createCpu([0, 0, 0, 0, 0, 0]);
  cpu.execute(input[0]);

  input = input.slice(1);

  let ticks = 0;
  let halt = true;
  while(cpu.ip >= 0 && cpu.ip < input.length) {
    ticks++;
    const ip = cpu.ip;
    // if (ip === 19) cpu.registers[1] = 65536 + 256;

    const ins = input[cpu.ip];
    cpu.execute(ins);
    
    if (ip >= 28) {
      return cpu.registers[4];            
    }

    if (ticks % 1000 === 0) log(ticks);
    log(
      pad4(ticks), 
      pad4(ip + 2), 
      pad4(cpu.ip), 
      '|',
      cpu.registers.map(x => String(x).padStart(14)).join('')
    );
  }
  log('halted', halt);
  return cpu.registers[0];

}

// 16773710 - too high
// 14045034 - too high
// 11600695 - too low
// 13728745 - wrong
export function part2(input) {

  const cpu = createCpu([0, 0, 0, 0, 0, 0]);
  cpu.execute(input[0]);

  input = input.slice(1);

  let ticks = 0;
  let halt = true;
  let highest = 0;

  let unique = new Set();
  let last = 0;

  while(cpu.ip >= 0 && cpu.ip < input.length) {
    ticks++;
    const ip = cpu.ip;
    // if (ip === 19) cpu.registers[1] = 65536 + 256;

    const ins = input[cpu.ip];
    cpu.execute(ins);
    
    if (ip === 28) {
      // return cpu.registers[4];
      // log(
      //   pad12(ticks), 
      //   pad4(ip + 2), 
      //   pad4(cpu.ip), 
      //   '|',
      //   cpu.registers.map(x => String(x).padStart(14)).join('')
      // );

      const value = cpu.registers[4];
      if (!unique.has(value)) {
        unique.add(value);
        last = value;
        log(value);
        if (unique.size > 200) {
          log(Array.from(unique).sort((l, r) => l - r));
          halt = false;
          break;
        }
      }
      // if (value > highest) {
      //   highest = value;
      //   log(pad12(highest), pad12(ticks + 1));
      // }

      if (ip === 30) {
        // halt = false;
        // break;
      }      
    }
    // if (ticks % 1000 === 0) log(ticks);
  }
  log('halted', halt, ticks, last);
  return cpu.registers[0];

}    

const pad12 = v => String(v).padStart(12);

function pad4(value) {
  return String(value).padStart(4);
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