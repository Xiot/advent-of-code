
import { autoParse, log, byLine, combinations, sumOf } from "../../utils";

export const parse = byLine((line, index) => {
  const [left, right] = line.split('/').map(x => parseInt(x));
  if (right === 0) {
    return {id: index, left: 0, right: left};
  }
  return {id: index, left, right};
});

// 809 - low
export function part1(input) {
  // log('input', input);

  // const combos =Array.from( combinations(input));
  // log(combos);

  let max = {score: 0};

  for(let v of input) {
    if (v.left !== 0) continue;
    const rem = input.filter(x => x.id !== v.id);

    for(let l = 0; l < rem.length; l++) {
      const ret = validBridgeFrom(v, rem, l);
      if (ret.score > max.score) {
        max = ret;
      }
      // log(v, l, ret);
    }    
  }
  log(max);
  return max.score;
}

function validBridgeFrom(value, items, len) {

  if (len === 0) {
    return {score: valueOf(value), path: [value]};
  }

  const myScore = valueOf(value);
  let max = {score: 0, path: []};
   
  for(let i of items.filter(v => v.left === value.right || v.right === value.right)) {
    const p = orient(i, value.right);
    const v = validBridgeFrom(p, items.filter(x => x.id !== p.id), len -1);
    const score = myScore + v.score;
    if (score > max.score) {
      max = {score, path: [value, ...v.path]};
    }
  }
  return max;
}

function validBridgeFromByLength(value, items, len) {

  if (len === 0) {
    return {score: valueOf(value), path: [value]};
  }

  const myScore = valueOf(value);
  let max = {score: 0, path: []};
   
  for(let i of items.filter(v => v.left === value.right || v.right === value.right)) {
    const p = orient(i, value.right);
    const v = validBridgeFromByLength(p, items.filter(x => x.id !== p.id), len -1);
    const score = myScore + v.score;
    if (v.path.length >= max.path.length || (v.path.length === max.path.length && score > max.score)) {
      max = {score, path: [value, ...v.path]};
    }
  }
  return max;
}

function orient(value, left) {
  if (value.left === left) return {...value};
  return {...value, left: value.right, right: value.left};
}

function valueOf(items) {
  if (!Array.isArray(items)) items = [items];
  return sumOf(items, i => i.left + i.right);
}

// 1423 low
// 1448 low
export function part2(input) {
  let max = {score: 0, path: []};

  for(let v of input) {
    if (v.left !== 0) continue;
    const rem = input.filter(x => x.id !== v.id);

    for(let l = rem.length; l >=0; l--) {
      const ret = validBridgeFromByLength(v, rem, l);
      if (ret.path.length > max.path.length || ret.path.length === max.path.length && ret.score > max.score ) {
        max = ret;
        log(l, ret.path.length, max.score);
      }      
    }    
  }
  log(max);
  return max.score;
}    
