import { GridMap, Point, byLine, createCircle, createGridMap, log, visualizeGrid } from '../../utils';
type Input = ReturnType<typeof parse>;

const RE = /([RDLU]) (\d+) \(#([a-f0-9]+)\)/i;

export const parse = byLine(line => {
  const [, dir, length, color] = RE.exec(line);

  // return {
  //   dir: dir as Dir,
  //   length: parseInt(length),
  //   // color,
  // };
  if (process.env.PART === '1') {
    return {
      dir: dir as Dir,
      length: parseInt(length),
      // color,
    };
  }

  return {
    dir: DIR_DIGIT[color[color.length - 1]] as Dir,
    length: parseInt(color.slice(0, -1), 16),
    // color: length,
  };
});

type Dir = 'R' | 'L' | 'U' | 'D';
const DIR_DIGIT = {
  '0': 'R',
  '1': 'D',
  '2': 'L',
  '3': 'U',
} as const;

const DIRS = {
  R: { x: 1, y: 0 },
  L: { x: -1, y: 0 },
  U: { x: 0, y: -1 },
  D: { x: 0, y: 1 },
};

export function part1(input: Input) {
  const grid = createGridMap('.');

  let pos = { x: 0, y: 0 };
  grid.set(0, 0, '000000');
  for (const op of input) {
    for (let i = 0; i < op.length; i++) {
      pos = add(pos, DIRS[op.dir]);
      grid.set(pos.x, pos.y, '#');
    }
  }

  log(
    visualizeGrid(grid, (x, y) => {
      const value = grid.get(x, y);
      return value === '.' ? '.' : '#';
    }),
  );

  const edges = grid.length;
  const filled = floodFill(grid, { x: 1, y: 1 }, '#');

  log();
  log(
    visualizeGrid(grid, (x, y) => {
      const value = grid.get(x, y);
      return value === '.' ? '.' : '#';
    }),
  );

  return filled + edges;
}

function floodFill(grid: GridMap, startPoint: Point, value: string) {
  let visited = new Set<string>();
  const queue: Point[] = [startPoint];
  let count = 0;

  function keyOf(p: Point) {
    return `${p.x},${p.y}`;
  }

  while (queue.length > 0) {
    const pos = queue.shift();
    const key = keyOf(pos);
    if (visited.has(key)) continue;
    visited.add(key);

    if (grid.get(pos.x, pos.y) === '.') {
      count++;
    }

    Object.values(DIRS).forEach(dir => {
      const newPos = add(pos, dir);
      if (grid.get(newPos.x, newPos.y) === '.') {
        queue.push(newPos);
      }
    });
  }
  return count;
}

type Op = Input[number];
export function part2(input: Input) {
  let pos = { x: 0.5, y: 0.5 };
  const outside: Point[] = [];

  const mids: Point[] = [];

  for (let i = 0; i < input.length; i++) {
    const op = input[i];
    const prevIndex = (i - 1 + input.length) % input.length;
    const prevOp = input[prevIndex];

    const v = DIRS[op.dir];
    const mid = add(pos, mul(v, op.length));

    const o = getOutside(op, prevOp, pos);
    outside.push(o);

    mids.push(mid);
    pos = mid;
  }

  log(outside);

  return areaOfAPolygon(outside);
}

function getOutside(op: Op, prevOp: Op, mid: Point) {
  const isRight = isRightTurn(prevOp.dir, op.dir);
  switch (op.dir) {
    case 'R':
      return isRight ? { x: Math.floor(mid.x), y: Math.floor(mid.y) } : { x: Math.ceil(mid.x), y: Math.floor(mid.y) };
    case 'D':
      return isRight ? { x: Math.ceil(mid.x), y: Math.floor(mid.y) } : { x: Math.ceil(mid.x), y: Math.ceil(mid.y) };
    case 'L':
      return isRight ? { x: Math.ceil(mid.x), y: Math.ceil(mid.y) } : { x: Math.floor(mid.x), y: Math.ceil(mid.y) };
    case 'U':
      return isRight ? { x: Math.floor(mid.x), y: Math.ceil(mid.y) } : { x: Math.floor(mid.x), y: Math.floor(mid.y) };
  }
}

function isRightTurn(prevDir: Dir, dir: Dir) {
  if (prevDir === 'R') return dir === 'D';
  if (prevDir === 'L') return dir === 'U';
  if (prevDir === 'U') return dir === 'R';
  if (prevDir === 'D') return dir === 'L';
}

function areaOfAPolygon(points: Point[]) {
  let sum = 0;
  for (let i = 1; i < points.length; i++) {
    const pl = points[i - 1];
    const pr = points[i];
    sum += pl.x * pr.y - pr.x * pl.y;
  }
  return sum / 2;
}

function add(l: Point, r: Point) {
  return { x: l.x + r.x, y: l.y + r.y };
}
function mul(p: Point, m: number) {
  return { x: p.x * m, y: p.y * m };
}
