
import { autoParse, log, loadGrid, visualizeGrid } from "../../utils";

export const parse = text => {
  const grid = loadGrid(text.split('\n'), ' ');
  
  for(let x = 0; x < grid.bounds.width; x++) {
    if (grid.get(x, 0) === '|') {
      return {
        grid,
        start: {x, y: 0}
      };
    }
  }
};

const DIRS = [
  {x: 0, y: 1},
  {x: -1, y: 0},
  {x: 0, y: -1},
  {x: 1, y: 0},  
];

function isLetter(v) {
  return /[A-Z]/.test(v);
}

export function part1(input) {
  const {grid, start} = input;

  let dir = 0;
  let pos = start;

  let word = '';

  while(true) {
    pos = move(pos, dir);
    const block = grid.get(pos.x, pos.y);
    if (block === ' ') {
      return word;
    }

    if (block === '+') {
      dir = findNewDirection(grid, pos.x, pos.y, dir);
    } else if (isLetter(block)) {
      word += block;
    }
  }
}

function findNewDirection(grid, x, y, dir) {
  const deltas = Object.values(DIRS);
  const leftIndex = (dir - 1 + DIRS.length) % DIRS.length;
  const rightIndex = (dir +1) % DIRS.length;

  const leftDelta = DIRS[leftIndex];
  const rightDelta = DIRS[rightIndex];
  const leftValue = grid.get(x + leftDelta.x, y + leftDelta.y);
  const rightValue = grid.get(x + rightDelta.x, y + rightDelta.y);
  if (leftValue !== ' ' && leftValue !== '+') {
    return leftIndex;
  }
  return rightIndex;
}

function move(pos, dir) {
  const delta = DIRS[dir];
  return {
    x: pos.x + delta.x,
    y: pos.y + delta.y
  };
}

export function part2(input) {
  const {grid, start} = input;

  let dir = 0;
  let pos = start;

  let word = '';
  let steps = 0;

  while(true) {
    pos = move(pos, dir);
    steps++;
    const block = grid.get(pos.x, pos.y);
    if (block === ' ') {
      return steps;
      // return word;
    }

    if (block === '+') {
      dir = findNewDirection(grid, pos.x, pos.y, dir);
    } else if (isLetter(block)) {
      word += block;
    }
  }
}    
