
import { autoParse, log, } from "../../utils";

export const parse = text => text.split(',');


const DELTA = {
  n: {x: 0, y: -1},
  ne: {x: 1, y: -0.5},
  se: {x: 1, y: 0.5},
  s: {x: 0, y: 1},
  sw: {x: -1, y: 0.5},
  nw: {x: -1, y: -0.5}
};

export function part1(input) {
  log('input', input);

  function walk(steps) {
    return steps.reduce((acc, cur) => {
      const delta = DELTA[cur];
      return {
        x: acc.x + delta.x,
        y: acc.y + delta.y
      };
    }, {x: 0, y: 0});
  }

  const START = {x: 0, y: 0};

  const finalCell = walk(input);
  log('final', finalCell, manhattenDistance({x: 0, y: 0}, finalCell));
  const steps = distanceBetween(START, finalCell);
  log('steps', steps);
  return steps;
}

function manhattenDistance(from, to) {
  return Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
}
function distanceBetween(from, to) {
  log(to);
  const diff = {x: to.x - from.x, y: to.y - from.y};  

  if (diff.x === 0) return Math.abs(diff.y);

  const sy = Math.abs(diff.y / 0.5);
  const sx = Math.abs(diff.x) - sy;
  return sx + sy;  
}

export function part2(input) {
  log('input', input);

  function walk(steps, stepFn) {
    return steps.reduce((acc, cur) => {
      const delta = DELTA[cur];
      const newPos = {
        x: acc.x + delta.x,
        y: acc.y + delta.y
      };
      stepFn(newPos);
      return newPos;
    }, {x: 0, y: 0});
  }

  const cache = new Map();
  const keyOf = p => `${p.x},${p.y}`;

  let maxDistance = 0;
  const START = {x: 0, y: 0};

  walk(input, child => {
    const value = cache.get(keyOf(child));
    if (value != null) return;
    
    const distance = distanceBetween(START, child);
    cache.set(keyOf(child), distance);
    if (distance > maxDistance) {
      log(distance, child);
      maxDistance = distance;
    }
  });
  return maxDistance;
}    
