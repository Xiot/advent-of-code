
import { autoParse, log, byLine, toCharCode, sumOf } from "../../utils";

export const parse = byLine(x => {
  const len = x.length / 2;
  return [x.slice(0, len), x.slice(len)];
});

export function part1(input) {
  
  const items = input.map(([left, right]) => findSimilar(left, right));
  const sum = sumOf(items, valueOf);
  return sum;
}

function findSimilar(left, right) {
  const sack = new Map();
  for(let i = 0; i < left.length; i++) {
    sack.set(left[i], true);
  }

  for(let i = 0; i < right.length; i++) {
    if (sack.get(right[i])) {
      return right[i];
    }
  }
  return undefined;
}
function valueOf(item) {
  if(item >= 'a' && item <= 'z') return toCharCode(item) - toCharCode('a') + 1;
  return toCharCode(item) - toCharCode('A') + 27;
}


export function part2(input) {

  const badges = [];
  for(let i = 0; i < input.length; i+=3) {
    badges.push(findCommon(input, i));
  }  
  return sumOf(badges, valueOf);
  
}    

function findCommon(input, offset) {
  const counts = new Map();
  for(let i = 0; i < 3; i++) {
    const sack = input[i + offset].join('');

    for(let letter of distinctLetters(sack)) {
      const value = (counts.get(letter) ?? 0) + 1;
      counts.set(letter, value);
      
      if (value === 3) return letter;
    }
  }
  return undefined;
}

function distinctLetters(value) {
  return (new Set(value)).values();
  // const letters = new Set();
  // for(let letter of value) {
  //   letters.add(letter);
  // }
  // return letters.values();
}