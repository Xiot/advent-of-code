import { isEqual } from 'lodash';
import { byLine, createBucketMap, GridMap, loadGrid, log, visualizeGrid } from '../../utils';
type Input = ReturnType<typeof parse>;

export const parse = (text: string) => loadGrid(text, '.');

type Point = { x: number; y: number };

const DIRECTIONS = {
  north: { x: 0, y: -1 },
  south: { x: 0, y: 1 },
  west: { x: -1, y: 0 },
  east: { x: 1, y: 0 },
};
const ORDERED = [DIRECTIONS.north, DIRECTIONS.east, DIRECTIONS.south, DIRECTIONS.west];

const keyOf = (x: number, y: number) => `${x}|${y}`;
const add = (p: Point, direction: Point) => {
  return {
    x: p.x + direction.x,
    y: p.y + direction.y,
  };
};
const turnRight = (cur: Point) => {
  const index = ORDERED.findIndex(o => isEqual(o, cur));
  return ORDERED[(index + 1) % ORDERED.length];
};

export function part1(grid: Input) {
  const start = grid.entries().find(x => x[1] === '^');
  grid.markOnGet = false;

  let pos = start[0];
  let dir = DIRECTIONS.north;
  while (grid.bounds.contains(pos.x, pos.y)) {
    grid.set(pos.x, pos.y, 'X');
    const next = add(pos, dir);
    if (grid.get(next.x, next.y) === '#') {
      dir = turnRight(dir);
      continue;
    }

    pos = add(pos, dir);
    console.log(visualizeGrid(grid));
    console.log('-----');
  }

  const sum = grid.entries().reduce((acc, cur) => {
    if (cur[1] === 'X') {
      acc++;
    }
    return acc;
  }, 0);
  return sum;
}

export function part2(input: Input) {
  input.markOnGet = false;
  const start = input.entries().find(x => x[1] === '^')[0];

  const test = input.clone();
  test.set(start.x - 1, start.y, 'O');

  function isLoopIf(p: Point) {
    const clone = input.clone();
    clone.set(p.x, p.y, 'O');
    const found = isLoop(clone, start, DIRECTIONS.north);
    if (found) {
      // console.log('loop', p.x, p.y);
      // console.log(visualizeGrid(clone, undefined, { printRowNumbers: true, printColNumbers: true }));
      // console.log('');
    }
    return found;
  }

  let count = 0;

  let pos = start;
  let dir = DIRECTIONS.north;
  const grid = input.clone();

  console.log(visualizeGrid(grid, undefined, { printColNumbers: true, printRowNumbers: true }));

  const loops = new Set<string>();
  const checked = new Set<string>();

  while (grid.bounds.contains(pos.x, pos.y)) {
    grid.set(pos.x, pos.y, 'X');
    const next = add(pos, dir);

    if (grid.get(next.x, next.y) === '#') {
      dir = turnRight(dir);
      continue;
    }

    const nextPos = add(pos, dir);
    const loopKey = keyOf(nextPos.x, nextPos.y);
    if (!checked.has(loopKey) && isLoopIf(nextPos)) {
      loops.add(loopKey);
    }

    checked.add(loopKey);

    pos = nextPos;
  }

  return loops.size;
}

function isLoop(grid: GridMap, start: Point, startDir: Point) {
  let pos = start;
  let dir = startDir;

  type Entry = {
    pos: Point;
    dir: Point;
  };
  const seen = createBucketMap<Entry>(p => keyOf(p.pos.x, p.pos.y));

  while (grid.bounds.contains(pos.x, pos.y)) {
    const b = seen.getBucketFor({ pos, dir });
    if (b.some(x => isEqual(x.dir, dir))) {
      return true;
    }

    grid.set(pos.x, pos.y, 'X');
    seen.add({ pos, dir });
    const next = add(pos, dir);
    const nextMark = grid.get(next.x, next.y);
    if (nextMark === '#' || nextMark === 'O') {
      dir = turnRight(dir);
      continue;
    }

    pos = add(pos, dir);

    // console.log(t);
    // console.log(visualizeGrid(grid, undefined, { printColNumbers: true, printRowNumbers: true }));
    // console.log('-----------');
  }

  return false;
}
