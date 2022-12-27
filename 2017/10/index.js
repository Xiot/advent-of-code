
import { autoParse, log, range,toChar, toCharCode } from "../../utils";

// export const parse = text => text;

export function part1(input) {  
  input = input.split(',').map(x => parseInt(x));

  const RANGE = global.args.isSample ? 4 : 255;
  log(process.env.IS_SAMPLE, RANGE);

  const arr = range(0, RANGE);
  let current = 0;
  let skip = 0;
  
  log(arr);
  for(let len of input) {

    log(current, len, arr);
    let l = current;
    let r = current + len - 1;
    while (l < r) {
      const li = l % arr.length;
      const ri = r % arr.length;

      const t = arr[ri];
      arr[ri] = arr[li];
      arr[li] = t;
      l++;
      r--;
    }
    current = (current + len + skip) % arr.length;
    skip++;    
  }
  
  return arr[0] * arr[1];
}

export function part2(input) {
  const SUFFIX = [17, 31, 73, 47, 23];
  const bytes = input.split('').map(x => toCharCode(x)).concat(SUFFIX);
  
  const RANGE =  255;
  
  const arr = range(0, RANGE);
  let current = 0;
  let skip = 0;
  
  for(let round = 0; round < 64; round++) {
    for(let len of bytes) {

      let l = current;
      let r = current + len - 1;
      while (l < r) {
        const li = l % arr.length;
        const ri = r % arr.length;

        const t = arr[ri];
        arr[ri] = arr[li];
        arr[li] = t;
        l++;
        r--;
      }
      current = (current + len + skip) % arr.length;
      skip++;
    }
  }
  log(arr);
  let dense = [];
  for(let i = 0; i < 16; i++) {
    const digit = range(0, 15).reduce((acc, cur) => acc ^ arr[i*16+cur], 0);
    dense.push(digit.toString(16).padStart(2, '0'));
  }
  log(dense);
  return dense.join('');
}    
