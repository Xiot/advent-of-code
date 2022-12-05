
import { autoParse, log, byLine } from "../../utils";

const RE = /(\d+)/g;

export const parse = byLine(text => {
  const items = Array.from(text.matchAll(RE));  
  return items.map(n => parseInt(n[0]));
});

/*
[N] [G]                     [Q]    
[H] [B]         [B] [R]     [H]    
[S] [N]     [Q] [M] [T]     [Z]    
[J] [T]     [R] [V] [H]     [R] [S]
[F] [Q]     [W] [T] [V] [J] [V] [M]
[W] [P] [V] [S] [F] [B] [Q] [J] [H]
[T] [R] [Q] [B] [D] [D] [B] [N] [N]
[D] [H] [L] [N] [N] [M] [D] [D] [B]
 1   2   3   4   5   6   7   8   9 
*/

const sample = [
  ['Z', 'N'],
  ['M', 'C', 'D'],
  ['P']
];

const actual = [
  ['D', 'T','W', 'F', 'J', 'S', 'H', 'N'],
  ['H', 'R', 'P','Q', 'T','N','B','G'],
  ['L', 'Q', 'V'],
  ['N', 'B', 'S', 'W', 'R', 'Q'],
  ['N', 'D', 'F', 'T', 'V', 'M', 'B'],
  ['M', 'D', 'B', 'V', 'H', 'T', 'R'],
  ['D', 'B', 'Q', 'J'],
  ['D', 'N', 'J', 'V', 'R', 'Z', 'H', 'Q'],
  ['B', 'N', 'H', 'M', 'S']
];

export function part1(input) {

  const crates = global.args.inputName === 'sample.txt' ? sample : actual;

  for(let [count, fromId, toId] of input) {
    for(let i = 0; i < count; i++) {
      const box = crates[fromId-1].pop();
      crates[toId -1].push(box);
    }
  }

  const result = crates.map(row => row[row.length - 1]).join('');
  return result;
}

export function part2(input) {

  const crates = global.args.inputName === 'sample.txt' ? sample : actual;

  for(let [count, fromId, toId] of input) {
    
    const tmp = [];
    for(let i = 0; i < count; i++) {
      const box = crates[fromId-1].pop();
      tmp.unshift(box);
    }
    crates[toId-1] = [...crates[toId-1], ...tmp];
  }

  const result = crates.map(row => row[row.length - 1]).join('');
  return result;
}    
