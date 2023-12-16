import { GridMap, Point, byLine, loadGrid, log, visualizeGrid, waitForKey } from '../../utils';
type Input = ReturnType<typeof parse>;

export const parse = (text: string) => loadGrid(text, '.');

const TILES = {
  '.': p => [p],
  '|': p =>
    p.x === 0
      ? [p]
      : [
          { x: 0, y: 1 },
          { x: 0, y: -1 },
        ],
  '-': p =>
    p.y === 0
      ? [p]
      : [
          { x: 1, y: 0 },
          { x: -1, y: 0 },
        ],
  '/': p => {
    if (p.x === 1) return [{ x: 0, y: -1 }];
    if (p.x === -1) return [{ x: 0, y: 1 }];
    if (p.y === 1) return [{ x: -1, y: 0 }];
    if (p.y === -1) return [{ x: 1, y: 0 }];
    return [p];
  },
  '\\': p => {
    if (p.x === 1) return [{ x: 0, y: 1 }];
    if (p.x === -1) return [{ x: 0, y: -1 }];
    if (p.y === 1) return [{ x: 1, y: 0 }];
    if (p.y === -1) return [{ x: -1, y: 0 }];
    return [p];
  },
} satisfies Record<string, (dir: Point) => Point[]>;
type Cell = keyof typeof TILES;

export function part1(input: Input) {
  return countEnergized(input, { x: 0, y: 0 }, { x: 1, y: 0 });
}

export function part2(input: Input) {
  const max = { pos: { x: 0, y: 0 }, count: 0 };

  for (let x = 0; x < input.bounds.width; x++) {
    const down = countEnergized(input, { x, y: 0 }, { x: 0, y: 1 });
    if (down > max.count) {
      max.pos = { x, y: 0 };
      max.count = down;
    }
    const up = countEnergized(input, { x, y: input.bounds.bottom }, { x: 0, y: -1 });
    if (up > max.count) {
      max.pos = { x, y: input.bounds.bottom };
      max.count = up;
    }
  }

  for (let y = 0; y < input.bounds.height; y++) {
    const down = countEnergized(input, { x: 0, y }, { x: 1, y: 0 });
    if (down > max.count) {
      max.pos = { x: 0, y };
      max.count = down;
    }
    const up = countEnergized(input, { x: input.bounds.right, y }, { x: -1, y: 0 });
    if (up > max.count) {
      max.pos = { x: input.bounds.right, y };
      max.count = up;
    }
  }
  log(max);
  return max.count;
}

function countEnergized(input: GridMap, startPos: Point, startDir: Point) {
  const queue = [{ pos: startPos, dir: startDir }];

  const energized = new Set<string>();

  const loops = new Set<string>();

  let steps = 0;
  while (queue.length > 0) {
    steps++;
    const { pos, dir } = queue.shift();

    energized.add(keyOf(pos));
    const ss = vKey(pos, dir);
    if (loops.has(ss)) continue;
    loops.add(ss);

    const cell = input.get(pos.x, pos.y);
    const newDirs = TILES[cell](dir);
    log(steps);
    log(
      visualizeGrid(input, (x, y) => {
        if (pos.x === x && pos.y === y) return '*';
        if (energized.has(keyOf({ x, y }))) return '#';
        return input.get(x, y);
      }),
    );
    log(cell, queue.length, pos, dir, newDirs);

    for (let newDir of newDirs) {
      const newPos = add(pos, newDir);
      if (!input.bounds.contains(newPos.x, newPos.y)) continue;
      queue.push({ pos: newPos, dir: newDir });
    }
  }

  log(
    visualizeGrid(input, (x, y) => {
      if (energized.has(keyOf({ x, y }))) return '#';
      return input.get(x, y);
    }),
  );
  log(steps);
  return energized.size;
}

function add(l: Point, r: Point) {
  return { x: l.x + r.x, y: l.y + r.y };
}
function keyOf(p: Point): string {
  return `${p.x},${p.y}`;
}
function vKey(p: Point, dir: Point) {
  return `${keyOf(p)}|${keyOf(dir)}}`;
}
