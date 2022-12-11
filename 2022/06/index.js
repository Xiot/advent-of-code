
import { log } from "../../utils";

export const parse = text => text.split('');

export function part1(input) {

  for(let i = 3; i < input.length; i++) {
    const obj = new Set();
    for(let j = -3; j<= 0; j++) {
      const c = input[i + j];
      obj.add(c);
    }
    const count = Array.from(obj).length;
    log(i, count);
    if (count === 4) {
      return i + 1;
    }
  }
  return -1;

}

export function part2(input) {

  const size = 14;

  for(let i = size-1; i < input.length; i++) {
    const obj = new Set();
    for(let j = -size + 1; j<= 0; j++) {
      const c = input[i + j];
      obj.add(c);
    }
    const count = Array.from(obj).length;
    log(i, count);
    if (count === size) {
      return i + 1;
    }
  }
  return -1;
}    
