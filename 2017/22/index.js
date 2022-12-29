
import { autoParse, log, loadGrid, visualizeGrid } from "../../utils";

export const parse = text => loadGrid(text, '.');

const DIRS = [
  {x: 0, y: -1},
  {x: 1, y: 0},
  {x: 0, y: 1},
  {x: -1, y: 0}
];

const STATES = [
  '.',
  'W',
  '#',
  'F'
];

export function part1(grid) {
  let pos = {
    x: Math.floor(grid.bounds.width / 2), 
    y: Math.floor(grid.bounds.height / 2)
  };
  let dir = 0;

  const MAX_TURNS = 10000;

  let infections = 0;
  for(let t = 0; t <MAX_TURNS; t++) {
    const value = grid.get(pos.x, pos.y);
    if (value === '.')
      infections++;
    dir = turn(dir, value === '#' ? 'right' : 'left');
    grid.set(pos.x, pos.y, value === '#' ? '.' : '#');
    pos = move(pos, dir);
  }
  console.log(
    visualizeGrid(grid)
  );
  return infections;
}

function turn(dir, turn) {
  const delta = turn === 'left' ? -1 
    : turn === 'right' ? 1
      : turn === 'back' ? 2
        : 0;
  const offset = (dir + delta + DIRS.length);
  return offset % DIRS.length;
}

function rollIndex(arr, cur, delta) {
  const offset = (cur + delta + arr.length) % arr.length;
  return offset;
}

function move(pos, dir) {
  const delta = DIRS[dir];

  return {
    x: pos.x + delta.x,
    y: pos.y + delta.y
  };
}

export function part2(grid) {
  let pos = {
    x: Math.floor(grid.bounds.width / 2), 
    y: Math.floor(grid.bounds.height / 2)
  };
  let dir = 0;

  const MAX_TURNS = 10000000;

  let infections = 0;
  for(let t = 0; t <MAX_TURNS; t++) {
    const value = grid.get(pos.x, pos.y);
    
    if (value === '.') {
      dir = turn(dir, 'left');
    } else if (value === 'W') {
      // same dir
    } else if (value === '#') {
      dir = turn(dir, 'right');
    } else if (value === 'F') {
      dir = turn(dir, 'back');
    }

    const newStateIndex = rollIndex(STATES, STATES.indexOf(value), 1);
    const newState = STATES[newStateIndex];
    if (newState === '#')
      infections++;
    grid.set(pos.x, pos.y, newState);
    pos = move(pos, dir);
  }

  return infections;
}    
