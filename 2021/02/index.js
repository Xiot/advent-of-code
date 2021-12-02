import { autoParse } from "../../utils";

export const parse = autoParse(([dir, value]) => ({dir, value}));

export function part1(input) {
  let x = 0, y = 0;
  for(let {dir, value} of input) {    
    switch(dir) {
    case 'forward': x += value; break;
    case 'down': y += value; break;
    case 'up': y -= value; break;
    }
  }
  return x * y;
}

export function part2(input) {
  let x = 0;
  let y = 0;
  let aim = 0;
  for (let {dir, value} of input) {
    switch(dir) {
    case 'forward': {
      y += aim * value;
      x += value; 
      break;
    }
    case 'up': aim -= value; break;
    case 'down': aim += value; break;
    }
  }
  
  return x * y;
}    
