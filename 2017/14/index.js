
import { log, createGridMap, toCharCode, range } from "../../utils";

export const parse = text => text;

export function part1(input) {
  log('input', input);

  let used = 0;
  const grid = createGridMap('.');
  for(let y = 0; y < 128; y++) {
    const key = `${input}-${y}`;
    const hashValue = hash(key);
    const value = hexToBin(hashValue);    
    
    if (y < 8) {
      log(y, hashValue.length, value.length);
    }

    for(let x = 0; x < value.length; x++) {

      const digit = value[x];
      if (digit === '1') {
        used++;
      }
      grid.set(x, y, digit === '1' ? '#' : '.');
    }   
  }

  return used;
}
export function hexToBin(hex) {
  let digits = '';
  
  for(let i = 0; i < hex.length; i ++) {
    const h = hex.slice(i, i+1);
    const dec = parseInt(h, 16);
    const bin = dec.toString(2).padStart(4, '0');    
    digits += bin;
  }
  return digits;
}

export function part2(input) {
  
  const grid = createGridMap('.');
  for(let y = 0; y < 128; y++) {
    const key = `${input}-${y}`;
    const hashValue = hash(key);
    const value = hexToBin(hashValue);    
      
    for(let x = 0; x < value.length; x++) {
      const digit = value[x];
      grid.set(x, y, digit === '1' ? '#' : '.');
    }   
  }

  const regions = getRegions(grid);
  return regions;
}

const DIRS = [
  {x: 0, y: -1},
  {x: 0, y: 1},
  {x: 1, y: 0},
  {x: -1, y: 0}
];

function getRegions(grid) {
  const visited = {};
  const keyOf = (x,y) => `${x},${y}`;
  let regions = 0;
  
  for(let y = 0; y < grid.bounds.height; y++) {
    for(let x = 0; x < grid.bounds.width; x++) {

      if (grid.get(x, y) !== '#') continue;
      if (visited[keyOf(x, y)]) continue;

      regions++;
      const queue = [{x, y}];
      while(queue.length > 0) {
        const p = queue.shift();        
        visited[keyOf(p.x, p.y)] = true;

        DIRS
          .map(d => ({x: p.x+d.x, y: p.y+d.y}))          
          .filter(d => grid.bounds.contains(d.x, d.y))          
          .filter(d => !visited[keyOf(d.x, d.y)])
          .filter(d => grid.get(d.x, d.y) === '#')
          .forEach(d => queue.push(d));

      }      
    }
  }
  return regions;
}


function hash(input) {
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
  
  let dense = [];
  for(let i = 0; i < 16; i++) {
    const digit = range(0, 15).reduce((acc, cur) => acc ^ arr[i*16+cur], 0);
    dense.push(digit.toString(16).padStart(2, '0'));
  }
  
  return dense.join('');
}