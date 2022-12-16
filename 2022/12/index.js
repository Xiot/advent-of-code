
import { byLine, loadGrid, pointsWithin, toCharCode } from "../../utils";

export const parse = byLine(line => line.split(''));

export function part1(input) {

  const grid = loadGrid(input);
  let start, end;
  for(let [x,y] of pointsWithin(grid)) {
    if (grid.get(x, y) === 'S') {
      start = {x,y};
      grid.set(x,y,'a');
    }
    if (grid.get(x, y) === 'E') {
      end = {x,y};
      grid.set(x,y, 'z');
    }
    const v = grid.get(x,y);
    grid.set(x,y, toCharCode(v) - toCharCode('a'));
  }

  const route = dfs(grid, start, end);
  return route;
}

export function part2(input) {
  const grid = loadGrid(input);
  
  let end = null;
  const starts = [];
  for(let [x,y] of pointsWithin(grid)) {
    const cell = grid.get(x, y);
    if (cell === 'S' || cell === 'a') {
      starts.push({x,y});
      grid.set(x,y,'a');
    }
    if (cell === 'E') {
      end = {x,y};
      grid.set(x,y, 'z');
    }
    const v = grid.get(x,y);
    grid.set(x,y, toCharCode(v) - toCharCode('a'));
  }

  let shortest = Number.MAX_SAFE_INTEGER;
  for(let start of starts) {
    const length = dfs(grid, start, end);
    if(length < shortest) {
      shortest = length;
    }
  }
  
  return shortest;
}    

function dfs(grid, start, end) {

  const visited = new Set();
  const queue = [{pos: start, distance: 0}];

  while(queue.length > 0) {    
    const {pos, distance} = queue.shift();
    if (isEqual(pos, end)) {
      return distance;
    }
    if (visited.has(keyOf(pos))) {
      continue;
    }
    visited.add(keyOf(pos));

    const height = grid.get(pos.x, pos.y);
    const n = neighbors(grid, pos, v => v <= height + 1);
    
    const w = Array.from(n);
    for(let next of w) {
      if (!visited.has(keyOf(next))) {
        queue.push({pos: next, distance: distance+1});
      }
    }
  }
}

const dir = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1]
];
function* neighbors(grid, pos, predicate) {
  
  for(let [dx, dy] of dir) {

    const newX = pos.x + dx;
    const newY = pos.y + dy;
    
    if (newX < grid.bounds.left || newX > grid.bounds.right 
      || newY < grid.bounds.top || newY > grid.bounds.bottom) {
      continue;
    }
    
    if (predicate(grid.get(newX, newY))) {
      yield {x: newX, y: newY};
    }
  }
}

function isEqual(l, r) {
  return l.x === r.x && l.y === r.y;
}

function keyOf(p) {
  return `${p.x}|${p.y}`;
}