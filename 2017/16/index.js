
import { autoParse, log } from "../../utils";

export const parse = text => {
  const ops = text.split(',');
  return ops.map(o => {
    const cmd = o[0];
    const args = o.slice(1);
    switch(cmd) {
    case 's': return {move: 's', value: parseInt(args)};
    case 'x': return {move: 'x', value: args.split('/').map(x => parseInt(x))};
    case 'p': return {move: 'p', value: args.split('/')};
    }
  });
};

export function part1(input) {  

  let programs = (global.args.isSample ? 'abcde' : 'abcdefghijklmnop').split(''); 

  for(let op of input) {    
    programs = perform(programs, op);    
  }
  log(programs);
  return programs.join('');
}

function perform(programs, op) {
  switch(op.move) {
  case 's': {
    return [...programs.slice(-op.value), ...programs.slice(0, -op.value)];
  }
  case 'x': {
    const clone = programs; // [...programs];
    const t = clone[op.value[0]];
    clone[op.value[0]] = clone[op.value[1]];
    clone[op.value[1]] = t;
    return clone;    
  }
  case 'p': {
    const clone = programs; // [...programs];
    const l = clone.indexOf(op.value[0]);
    const r = clone.indexOf(op.value[1]);
    const t = clone[r];
    clone[r] = clone[l];
    clone[l] = t;
    return clone;
  }
  }
}

export function part2(input) {
  let programs = (global.args.isSample ? 'abcde' : 'abcdefghijklmnop').split(''); 

  let cache = new Map();

  const ONE_BILLION = 1_000_000_000; 

  for(let i = 0; i < 1_000_000_000; i ++) {
    for(let op of input) {    
      programs = perform(programs, op);    
    }
    if (i % 1000 === 0) {
      log(i);
    }

    const order = programs.join('');
    if (!cache.has(order)) {
      cache.set(order, i);
      continue;
    }

    // Loop detected
    const firstIteration = cache.get(order);
    const length = i - firstIteration + 1;

    const reps = ONE_BILLION / (length);
    if (Math.floor(reps) === reps) {      
      return programs.join('');
    }
    
    const s = Math.floor(reps) * length;    

    for(let j = s; j <= ONE_BILLION; j++) {
    // for(let j = 0; j <= rem; j++) {
      for(let op of input) {    
        programs = perform(programs, op);    
      }      
    }
    return programs.join('');
  }    
}    
