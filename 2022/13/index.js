
import { autoParse, log, sumOf } from "../../utils";

export const parse = text => text.split('\n\n').map(chunk => {
  return chunk.split('\n').map(line => {
    return JSON.parse(line);
  });
});

export function part1(input) {

  const indexes = [];
  for (let i = 0; i < input.length; i++) {
    const [left, right] = input[i];
    log.push(`${i} --------`);
    const result = compare(left, right);
    if (result !== 1) indexes.push(i+1);
    log.pop(`-- ${i} == ${result}\n`);
  }
  
  indexes.forEach(i => {
    log(i-1, '\n', `  ${JSON.stringify(input[i-1][0])}`,'\n', `  ${JSON.stringify(input[i-1][1])}`, '\n');
  });
  log(indexes);
  return sumOf(indexes, x => x);
}

function check(input, index) {
  const [left, right] = input[index];
  log.push(`${index} --------`);
  const result = compare(left, right);
  log.pop(`-- ${index} == ${result}\n`);
}

const compare = logFn(
  (left, right) => log.push('compare', left,'__', right), 
  (left, right) => {
  
    if(typeof left === 'number' && typeof right === 'number') {
      return left === right ? 0 : left < right ? -1 : 1;    
    }

    if(Array.isArray(left) && Array.isArray(right)) {

      for(let i = 0; i < left.length; i++) {
        if (right[i] == null) return 1;
        const v = compare(left[i], right[i]);
        if (v === 1) return 1;
        if (v === -1) return -1;
      }
      if (right.length > left.length) return -1;
      return 0;
    }

    const l = Array.isArray(left) ? left : [left];
    const r = Array.isArray(right) ? right : [right];
    return compare(l, r);  
  }, 
  (args, result) => {
    log.pop('result', result);
  }
);

function logFn(pre, fn, post) {
  return (...args) => {
    pre(...args);
    const r = fn(...args);
    post(args, r);
    return r;
  };
}

export function part2(input) {

  const packets = [
    2,
    6,
    ...input.flatMap(x => x)
  ];
  log(packets.map(x => JSON.stringify(x)).join('\n'));

  const sorted = packets.sort(compare);
  log(sorted.map(x => JSON.stringify(x)).join('\n'));

  const firstIndex = sorted.findIndex(x => x === 2);
  const secondIndex = sorted.findIndex(x => x === 6);

  return (firstIndex +1) * (secondIndex +1);
}    
