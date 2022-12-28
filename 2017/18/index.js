
import { maybeNumber, log, byLine } from "../../utils";


export const parse = byLine(line => {
  const [op, a1, a2] = line.split(' ');
  return {
    op,
    left: maybeNumber(a1),
    right: maybeNumber(a2)
  };
});

export function part1(input) {

  const cpu = createPartOneCpu();
  let ip = 0;  
  while(true) {
    const cmd = input[ip];
    ip = cpu.execute(cmd);
    log(cmd.op, cmd.left, cmd.right, 'a =',cpu.registers.a);

    if (cmd.op === 'rcv' && cpu.registers.a) {
      return cpu.registers.a;
    }
  }
}

function createPartOneCpu() {
  const registers = {
    a: 0,
    sound: 0,
    ip: 0
  };

  function setRegister(name, fn) {
    if (registers[name] == null) 
      registers[name] = 0;
    const ret = typeof fn === 'function' ? fn(registers[name]) : fn;    

    registers[name] = typeof ret === 'number' ? ret : registers[ret];
  }

  function valueOf(nameOrValue) {
    return typeof nameOrValue === 'string' 
      ? registers[nameOrValue]
      : nameOrValue;
  }

  function execute(cmd) {
    switch(cmd.op) {
    case 'snd': {
      setRegister('sound', cmd.left);
      return ++registers.ip;
    }

    case 'rcv': {
      const value = valueOf(cmd.left);
      if (value !== 0)
        setRegister(cmd.left, valueOf('sound'));
      return ++registers.ip;
    }

    case 'set': {
      setRegister(cmd.left, cmd.right);        
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

// 8128 - high
export function part2(input) {

  const p1 = createPartTwoCpu(0);
  const p2 = createPartTwoCpu(1);
  
  p1.setTransport(value => p2.push(value));
  p2.setTransport(value => p1.push(value));

  let send2 = 0;

  while(true) {
    const cmd1 = input[p1.ip];
    const cmd2 = input[p2.ip];

    p1.execute(cmd1);
    p2.execute(cmd2);

    if (cmd2.op === 'snd') {
      send2++;
    }

    if (p1.waiting && p2.waiting)
      break;    
  }

  return send2;
}    


function createPartTwoCpu(p) {
  const registers = {
    p,
    ip: 0,
    a: 0,    
  };
  let waiting = false;

  const queue = [];
  let handler = null;

  function setRegister(name, fn) {
    if (registers[name] == null) 
      registers[name] = 0;
    const ret = typeof fn === 'function' ? fn(registers[name]) : fn;    

    registers[name] = typeof ret === 'number' ? ret : registers[ret];
  }

  function valueOf(nameOrValue) {
    return typeof nameOrValue === 'string' 
      ? registers[nameOrValue]
      : nameOrValue;
  }

  function execute(cmd) {
    switch(cmd.op) {
    case 'snd': {
      handler(valueOf(cmd.left));
      // setRegister('sound', cmd.left);
      return ++registers.ip;
    }

    case 'rcv': {
      if (queue.length === 0) {
        // registers.ip = -1;
        // return -1;
        waiting = true;
        return registers.ip;
      }
      waiting = false;
      const value = queue.shift();
      setRegister(cmd.left, value);
      return ++registers.ip;      
    }

    case 'set': {
      setRegister(cmd.left, cmd.right);        
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
    get waiting() {
      return waiting;
    },
    setTransport(cb) {
      handler = cb;
    },
    push(value) {
      queue.push(value);
    },
    execute
  };
}
