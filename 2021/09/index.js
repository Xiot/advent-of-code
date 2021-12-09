
import { fill } from "lodash";
import { autoParse, byLine } from "../../utils";

export const parse = byLine(line => line.split('').map(x => parseInt(x)));

export function part1(input) {
  let risk = 0;
  
  for(let y = 0; y < input.length; y++) {
    for(let x = 0; x < input[0].length; x++) {

      const left = x <= 0  ? undefined : input[y][x-1];
      const right = x >= input[0].length -1 ? undefined : input[y][x+1];
      const up = y <= 0 ? undefined : input[y-1][x];
      const down = y >= input.length -1 ? undefined : input[y+1][x];

      const points = [left, right, up, down].filter(x => x != null);
      if (points.filter(v => v > input[y][x]).length === points.length) {
        risk += input[y][x] + 1;
      }
    }
  }
  return risk;
}

export function part2(input) {

  const basins = [];

  const fill = (x, y) => {
    const items = [];
    items.push({x, y});
    let size = 0;
    while(items.length > 0) {
      const pos = items.pop();
      const cur = input[pos.y][pos.x];
      if (cur === 9) continue;
      if (cur === 'x') continue;
      input[pos.y][pos.x] = 'x';
      size +=1;

      const left = pos.x <= 0  ? undefined : {x: pos.x - 1, y: pos.y};
      const right = pos.x >= input[0].length -1 ? undefined : {x: pos.x + 1, y: pos.y};
      const up = pos.y <= 0 ? undefined : {x: pos.x, y: pos.y -1};
      const down = pos.y >= input.length -1 ? undefined : {x: pos.x, y: pos.y + 1};

      [left, right, up, down].filter(x => x != undefined)
        .filter(p => input[p.y][p.x] !== 'x')
        .filter(p => input[p.y][p.x] !== 9)
        .forEach(p => items.push(p));
    }
    return size;
  };

  for(let y = 0; y < input.length; y++) {
    for(let x = 0; x < input[0].length; x++) {
      if (input[y][x] === 'x') continue;
      if(input[y][x] === 9) continue;

      basins.push({
        size: fill(x, y)
      });      
    }
  }
  
  return basins.sort((l, r) => r.size - l.size).slice(0, 3).reduce((mul, b) => mul * b.size, 1);
}    
