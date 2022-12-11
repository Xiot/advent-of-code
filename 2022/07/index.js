
import {  log, byLine } from "../../utils";

export const parse = byLine();

export function part1(input) {
  const items = Array.from(iterate(input));
  
  const sizes = new Map();
  for(let op of items.filter(x => x.op === 'ls')) {
    for(let item of op.items) {
      if (item.type === 'file') {
        for(let di = 0; di <= op.path.length; di++) {
          const d = op.path.slice(0, di).join('/');
          sizes.set(d,  (sizes.get(d) ?? 0) + item.size);
        }
      }
    }
  }

  let t = 0;
  for(let [name, size] of sizes.entries()) {
    if (size >= 100_000) continue;
    t+=size;
  }
  return t;
}

function* iterate(input) {

  let i = 0;

  const stack = [];

  while(i < input.length) {
    const line = input[i];    
    if (line.startsWith('$')) {
      const currentDir = stack[stack.length - 1];
      const cmd = line.slice(2).split(' ');

      if (cmd[0] === 'cd') {

        const p = cmd.slice(1)[0];
        if (p === '..') {
          stack.pop();
        } else {
          stack.push(p);
        }
        
        yield {op: cmd[0], args: cmd.slice(1), dir: currentDir || '/'};

        i++;
        continue;
      }

      const c = {op: 'ls', items: [], qn: stack.join('/'), dir: stack[stack.length - 1], path: [...stack]};
      i++;
      while(i < input.length) {
        const parts = input[i].split(' ');
        if (parts[0] === '$') {
          break;
        }
        if (parts[0] === 'dir') {
          c.items.push({type: 'dir', name: parts[1]});
        } else {
          c.items.push({type: 'file', size: parseInt(parts[0]), name: parts[1]});
        }
        i++;
      }
      yield c;
    }
  }
}

export function part2(input) {

  const MAX_SPACE = 70000000;
  const REQUIRED = 30000000;

  const items = Array.from(iterate(input));
  
  const sizes = new Map();
  for(let op of items.filter(x => x.op === 'ls')) {
    for(let item of op.items) {
      if (item.type === 'file') {
        for(let di = 0; di <= op.path.length; di++) {
          const d = op.path.slice(0, di).join('/');
          sizes.set(d,  (sizes.get(d) ?? 0) + item.size);
        }
      }
    }
  }

  const used = sizes.get('/');
  const unused = MAX_SPACE - used;
  const min = REQUIRED - unused;

  const possible = Array.from(sizes.entries())
    .filter(([name, size]) => size > min)
    .sort((l, r) => l[1] - r[1])[0];

  return possible[1];
}    
