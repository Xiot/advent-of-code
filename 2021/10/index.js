
import { autoParse, log, byLine, sumOf } from "../../utils";

export const parse = byLine(line => line.split(''));

const openers = {
  '{': '}',
  '[': ']',
  '(': ')',
  '<': '>'
};
const closers = {
  '}': '{' ,
  ']': '[' ,
  ')': '(' ,
  '>': '<' 
};
const last = arr => arr[arr.length - 1];

const corrupted = line => {
  const stack = [];
  for(let c of line) {
    if (c === '{' || c === '[' || c === '(' || c === '<') {
      stack.push(c);
    } else {
      if (last(stack) !== closers[c]) {
        return c;
      } else {
        stack.pop();
      }
    }
  }
  return null;
};

export function part1(input) {

  const score = char => {
    if (!char) return 0;
    if (char === ')') return 3;
    if (char === ']') return 57;
    if (char === '}') return 1197;
    if (char === '>') return 25137;
    return 0;
  };

  let sum = 0;
  for(let line of input) {
    const result = corrupted(line);
    if (!result) continue;
    log(result);
    sum += score(result);
  }
  return sum;
}

export function part2(input) {
  const incomplete = input.filter(x => !corrupted(x));
  const close = line => {
    const stack = [];
    for(let c of line) {
      if (c === '{' || c === '[' || c === '(' || c === '<') {
        stack.push(c);
      } else {
        if (last(stack) !== closers[c]) {          
          return c;
        } else {
          stack.pop();
        }
      }
    }

    const remain = stack.reverse();
    return {original: line, closings: remain.map(x => openers[x])};
  };

  const score = c => {
    switch(c) {
    case ')': return 1;
    case ']': return 2;
    case '}': return 3;
    case '>': return 4;
    default: return 0;
    }
  };

  let sums = [];
  for(let line of incomplete) {
    const result = close(line);
    let lineSum = 0;
    for(let c of result.closings) {
      lineSum = lineSum * 5 + score(c);
    }
    sums.push(lineSum);    
  }
  sums.sort((l, r) => l - r);

  return sums[Math.floor(sums.length / 2)];
}    
