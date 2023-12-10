import {
  GridMap,
  Point,
  byLine,
  createBounds,
  createGridMap,
  loadGrid,
  log,
  pointsWithin,
  visualizeGrid,
} from '../../utils';
type Input = ReturnType<typeof parse>;

export const parse = text => loadGrid(text, '.');

const DIRS = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
};

const PIPES = {
  '|': [
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ],
  '-': [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
  ],
  L: [
    { x: 1, y: 0 },
    { x: 0, y: -1 },
  ],
  J: [
    { x: -1, y: 0 },
    { x: 0, y: -1 },
  ],
  '7': [
    { x: 0, y: 1 },
    { x: -1, y: 0 },
  ],
  F: [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
  ],
};

export function part1(input: Input) {
  log(visualizeGrid(input));

  const startPos = Array.from(input.entries()).find(x => x[1] === 'S')[0];
  log('start', startPos);

  const grid = createGridMap('.');

  let steps = 0;
  for (const p of walk(input, startPos)) {
    grid.set(p.x, p.y, input.get(p.x, p.y));
    log(p);
    steps += 1;
  }
  log(visualizeGrid(grid, (x, y) => grid.get(x, y)));
  return (steps - 1) / 2;
}

export function part2(input: Input) {
  const startPos = Array.from(input.entries()).find(x => x[1] === 'S')[0];
  const grid = createGridMap('.');

  let steps = 0;
  for (const p of walk(input, startPos)) {
    grid.set(p.x, p.y, input.get(p.x, p.y));
    steps += 1;
  }

  surroundWith(grid, '.');

  markOutside(grid);

  const count = countEmpty(grid);

  log(
    visualizeGrid(grid, (x, y) => {
      const v = grid.get(x, y);
      return v === 'O' ? '.' : v;
    }),
  );

  return count;
}

function* walk(grid: GridMap, startPos: Point) {
  const firstDirection = Object.values(DIRS).find(d => {
    const p = { x: startPos.x + d.x, y: startPos.y + d.y };
    const targets = getTargets(grid, p);
    return targets.some(t => isEqual(t, startPos));
  });

  yield startPos;

  let prevPoint = startPos;
  let pos = plus(startPos, firstDirection);

  yield pos;

  while (grid.get(pos.x, pos.y) !== 'S') {
    let nextPos = getNextPipe(grid, prevPoint, pos);

    yield nextPos;
    prevPoint = pos;
    pos = nextPos;
  }
}

function countEmpty(grid: GridMap) {
  const b = grid.bounds.toJSON();

  let count = 0;
  for (let x = b.left; x <= b.right; x++) {
    let inside = false;
    for (let y = b.top; y <= b.bottom; y++) {
      const v = grid.get(x, y);
      if (v === '.' && inside) {
        grid.set(x, y, 'I');
        count++;
        continue;
      }

      if (v === '-' || v === 'L' || v === 'F') {
        inside = !inside;
      }
    }
  }
  return count;
}

function markOutside(grid: GridMap) {
  let queue = [];
  const bounds = createBounds(grid.bounds);

  queue.push({ x: bounds.left, y: bounds.top });
  while (queue.length > 0) {
    const pos = queue.shift();

    Object.values(DIRS).forEach(p => {
      const np = plus(pos, p);

      if (!bounds.contains(np.x, np.y)) return;

      if (grid.get(np.x, np.y) !== '.') return;
      grid.set(np.x, np.y, 'O');
      queue.push(np);
    });
  }
}

function surroundWith(grid: GridMap, value: string) {
  const b = grid.bounds.toJSON();
  for (let x = b.left - 1; x <= b.right + 1; x++) {
    grid.set(x, b.top - 1, '.');
    grid.set(x, b.bottom + 1, '.');
  }

  for (let y = b.top - 1; y <= b.bottom + 1; y++) {
    grid.set(b.left - 1, y, '.');
    grid.set(b.right + 1, y, '.');
  }
}

function findConnections(pos: Point, grid: GridMap) {
  let current = grid.get(pos.x, pos.y);
}

function getNextPipe(grid: GridMap, prevPoint: Point, pos: Point) {
  return getTargets(grid, pos).find(p => !isEqual(prevPoint, p));
}

function getTargetOffsets(grid: GridMap, pos: Point) {
  let current = grid.get(pos.x, pos.y);

  if (current === '.' || current === 'S') return [];

  return PIPES[current];
}
function getTargets(grid: GridMap, pos: Point) {
  return getTargetOffsets(grid, pos).map(p => ({ x: pos.x + p.x, y: pos.y + p.y }));
}

function isEqual(l: Point, r: Point) {
  return l.x === r.x && l.y === r.y;
}

function plus(l: Point, r: Point) {
  return { x: l.x + r.x, y: l.y + r.y };
}
