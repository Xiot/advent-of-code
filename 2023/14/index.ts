import { GridMap, Point, byLine, createGridMap, loadGrid, log, visualizeGrid } from '../../utils';
type Input = ReturnType<typeof parse>;

export const parse = (text: string) => loadGrid(text, '.');

export function part1(grid: Input) {
  rollNorth(grid);

  let sum = 0;
  for (let x = 0; x < grid.bounds.width; x++) {
    for (let y = 0; y < grid.bounds.height; y++) {
      const value = grid.get(x, y);
      if (value !== 'O') continue;
      sum += grid.bounds.height - y;
    }
  }

  log(visualizeGrid(grid));
  return sum;
}

export function part2(input: Input) {
  const cache = new Map<string, number>();

  let cycle = 0;
  let offset = -1;
  let first = -1;
  let last = -1;
  let cycleSize = 0;
  let prev = -1;
  while (cycle < 1_000_000_000) {
    cycle += 1;

    rollNorth(input);
    rollWest(input);
    rollSouth(input);
    rollEast(input);

    const state = visualizeGrid(input);
    if (!cache.has(state)) {
      cache.set(state, cycle);
      continue;
    }

    if (first !== -1) {
      const found = cache.get(state);
      cycleSize++;
      if (found === first) {
        last = prev;
        log('last', last);
        break;
      }
    }

    if (offset === -1) {
      offset = cycle;
      first = cache.get(state);
      log('offset', offset);
      log('first', first);
    }

    log(cycle, cache.get(state));
    prev = cache.get(state);

    // if (cycle > 40) break;
  }

  // const cycleSize = 9 - 3 + 1;
  // offset = 10;
  // first = 3;
  // const cycleSize = (last - first) / 2;
  const target = ((1_000_000_000 - offset) % cycleSize) + first;
  log(target, offset, first, last, cycleSize);

  const targetState = Array.from(cache.entries()).find(([state, cycle]) => cycle === target)[0];
  const grid = loadGrid(targetState, '.');

  let sum = 0;
  for (let x = 0; x < grid.bounds.width; x++) {
    for (let y = 0; y < grid.bounds.height; y++) {
      const value = grid.get(x, y);
      if (value !== 'O') continue;
      sum += grid.bounds.height - y;
    }
  }
  return sum;
}

function rollNorth(grid: GridMap) {
  for (let y = 0; y < grid.bounds.height; y++) {
    for (let x = 0; x < grid.bounds.width; x++) {
      const value = grid.get(x, y);
      if (value !== 'O') continue;

      const target = findTargetN(grid, { x, y });
      if (target == null) continue;
      grid.set(x, y, '.');
      grid.set(target.x, target.y, 'O');
    }
  }
}

function findTargetN(grid: GridMap, pos: Point) {
  for (let y = pos.y; y > 0; y--) {
    const value = grid.get(pos.x, y - 1);
    if (value === '#' || value === 'O') return { x: pos.x, y };
    if (y === 1) return { x: pos.x, y: 0 };
  }
  return null;
}

function rollSouth(grid: GridMap) {
  for (let y = grid.bounds.bottom; y >= grid.bounds.top; y--) {
    for (let x = 0; x < grid.bounds.width; x++) {
      const value = grid.get(x, y);
      if (value !== 'O') continue;

      const target = findTargetS(grid, { x, y });
      if (target == null) continue;
      grid.set(x, y, '.');
      grid.set(target.x, target.y, 'O');
    }
  }
}
function findTargetS(grid: GridMap, pos: Point) {
  for (let y = pos.y; y < grid.bounds.bottom; y++) {
    const value = grid.get(pos.x, y + 1);
    if (value === '#' || value === 'O') return { x: pos.x, y };
    if (y === grid.bounds.bottom - 1) return { x: pos.x, y: grid.bounds.bottom };
  }
  return null;
}

function rollEast(grid: GridMap) {
  for (let x = grid.bounds.right; x >= grid.bounds.left; x--) {
    for (let y = 0; y < grid.bounds.height; y++) {
      const value = grid.get(x, y);
      if (value !== 'O') continue;

      const target = findTargetE(grid, { x, y });
      if (target == null) continue;
      grid.set(x, y, '.');
      grid.set(target.x, target.y, 'O');
    }
  }
}
function findTargetE(grid: GridMap, pos: Point) {
  for (let x = pos.x; x < grid.bounds.right; x++) {
    const value = grid.get(x + 1, pos.y);
    if (value === '#' || value === 'O') return { x, y: pos.y };
    if (x === grid.bounds.right - 1) return { x: grid.bounds.right, y: pos.y };
  }
  return null;
}

function rollWest(grid: GridMap) {
  for (let x = 0; x < grid.bounds.width; x++) {
    for (let y = 0; y < grid.bounds.height; y++) {
      const value = grid.get(x, y);
      if (value !== 'O') continue;

      const target = findTargetW(grid, { x, y });
      // log('t', x, y, target);
      if (target == null) continue;
      grid.set(x, y, '.');
      grid.set(target.x, target.y, 'O');
    }
  }
}

function findTargetW(grid: GridMap, pos: Point) {
  for (let x = pos.x; x > grid.bounds.left; x--) {
    const value = grid.get(x - 1, pos.y);
    if (value === '#' || value === 'O') return { x, y: pos.y };
    if (x === grid.bounds.left + 1) return { x: grid.bounds.left, y: pos.y };
  }
  return null;
}
