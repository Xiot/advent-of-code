import { loadInput, numberPerLine } from '../../utils';

export const parse = numberPerLine;

export function part1(depths) {  
  let inc = 0;
  for (let i = 1; i < depths.length; i++) {
    if (depths[i] > depths[i - 1]) {
      inc++;
    }
  }
  return inc;
}

export function part2(depths) {    
  let inc = 0;
  for (let i = 1; i < depths.length - 2; i++) {
    const sum = depths[i] + depths[i + 1] + depths[i + 2];
    const last = depths[i - 1] + depths[i + 1 - 1] + depths[i + 2 - 1];
    if (sum > last) {
      inc++;
    }
  }
  return inc;
}
