
import { autoParse, log, byLine, maybeNumber } from "../../utils";
import {calc} from './calc';

export const parse = byLine(line => {
  if (!line) return undefined;

  if (line.startsWith('//')) {
    return {op: 'nop', left: line.slice(2)};
  }

  const [op, a1, a2] = line.split(' ');
  return {
    op,
    left: maybeNumber(a1),
    right: maybeNumber(a2)
  };
});

export function part1(input) {
  
  input = input.filter(Boolean);
  log('ops', input.length);
  const cpu = createPartOneCpu();
  
  let mulCount = 0;  
  while(true) {
    if (cpu.ip < 0 || cpu.ip >= input.length) break;
    
    const cmd = input[cpu.ip];
    if (cmd.op === 'mul') 
      mulCount++;
    cpu.execute(cmd);
  }
  return mulCount;
}

//  501 - low
// 1000 - high
export function part2(input) {
  const isSample = global.args.isSample;
  if (!isSample) {
    return calc();
  }
  input = input.filter(Boolean);  
  const cpu = createPartOneCpu({a: 1});
  
  let tick = 0;
  while(true) {
    tick++;
    if (cpu.ip < 0 || cpu.ip >= input.length) break;
    const cmd = input[cpu.ip];
    
    cpu.execute(cmd);
    // if (tick % 1000 === 0) {
    //   log(tick);
    // }
    // log(
    //   String(tick).padStart(4), 
    //   String(cpu.ip).padStart(2), 
    //   cpu.registers
    // );
  }

  return cpu.registers.h;
}    


function createPartOneCpu(initial = {}) {
  const registers = {
    ip: 0,
    ...initial
  };

  function setRegister(name, fn) {
    if (registers[name] == null) 
      registers[name] = 0;
    const ret = typeof fn === 'function' ? fn(registers[name]) : fn;    

    registers[name] = typeof ret === 'number' ? ret : registers[ret];
  }

  function valueOf(nameOrValue) {
    return (typeof nameOrValue === 'string' 
      ? registers[nameOrValue]
      : nameOrValue) ?? 0;
  }

  function execute(cmd) {
    switch(cmd.op) {
    
    case 'nop': 
      return ++registers.ip;
    case 'set': {
      setRegister(cmd.left, cmd.right);        
      return ++registers.ip;
    }
    case 'sub': {
      setRegister(cmd.left, v => v - valueOf(cmd.right));
      return ++registers.ip;
    }
    case 'add': {
      setRegister(cmd.left, v => v + valueOf(cmd.right));
      return ++registers.ip;
    }
    case 'mul': {
      setRegister(cmd.left, v => v * valueOf(cmd.right));
      return ++registers.ip;
    }
    case 'mod':
      setRegister(cmd.left, v => v % valueOf(cmd.right));    
      return ++registers.ip;
    case 'jnz': {
      const condition = valueOf(cmd.left);
      if (condition === 0) 
        return ++registers.ip;
      registers.ip = registers.ip + valueOf(cmd.right);
      return registers.ip;  
    }
    case 'jgz': {
      const condition = valueOf(cmd.left);
      if (condition <= 0) 
        return ++registers.ip;
      registers.ip = registers.ip + valueOf(cmd.right);
      return registers.ip;
    }
    }
  }

  return {
    get ip() {return registers.ip;},
    get registers() {
      return registers;
    },
    execute
  };
}