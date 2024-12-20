import { isEqual, uniqBy } from 'lodash';
import { byLine, createBucketMap, GridMap, loadGrid, log, Point, visualizeGrid } from '../../utils';
import { calculateLine } from '../../utils/line';
type Input = ReturnType<typeof parse>;

export const parse = (text: string) => loadGrid(text, '.');

const DIRECTIONS: Point[] = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 0, y: -1 },
];

function add(l: Point, r: Point) {
  return {
    x: l.x + r.x,
    y: l.y + r.y,
  };
}

function keyOf(p: Point) {
  return `${p.x},${p.y}`;
}

declare var args: { isSample: boolean };

export function part1(input: Input) {
  const startPos = input.entries().find(e => e[1] === 'S')[0]!;
  const endPos = input.entries().find(e => e[1] === 'E')[0]!;

  const ret = solve(input, startPos, endPos);

  const minSavings = args.isSample ? 2 : 100;

  const cheats = findCheats(ret.path, 2, minSavings).sort((l, r) => l.saved - r.saved);
  const unique = uniqBy(cheats, c => `${c.l.x},${c.l.y}|${c.r.x},${c.r.y}`);

  return unique.length;
}

export function part2(input: Input) {
  const startPos = input.entries().find(e => e[1] === 'S')[0]!;
  const endPos = input.entries().find(e => e[1] === 'E')[0]!;

  const ret = solve(input, startPos, endPos);
  const minSavings = args.isSample ? 50 : 100;

  const cheats = findCheats(ret.path, 20, minSavings).sort((l, r) => r.saved - l.saved);
  const unique = uniqBy(cheats, c => `${c.l.x},${c.l.y}|${c.r.x},${c.r.y}`);

  return unique.length;
}

type TimePoint = Point & { t: number };
type QueueItem = { pos: Point; path: TimePoint[]; time: number };
function solve(grid: GridMap, startPos: Point, endPos: Point) {
  const seen = new Set<string>();
  const queue: QueueItem[] = [];

  function append(item: QueueItem) {
    const key = keyOf(item.pos);
    if (seen.has(key)) return;
    if (!grid.bounds.contains(item.pos.x, item.pos.y)) return;
    if (grid.get(item.pos) === '#') return;

    seen.add(key);

    queue.push(item);
  }

  append({ pos: startPos, path: [{ ...startPos, t: 0 }], time: 0 });

  while (queue.length > 0) {
    const item = queue.pop();

    if (isEqual(item.pos, endPos)) {
      return item;
    }

    for (const dir of DIRECTIONS) {
      const newPoint = add(item.pos, dir);
      append({ pos: newPoint, path: [...item.path, { ...newPoint, t: item.time + 1 }], time: item.time + 1 });
    }
  }
}

function distance(l: TimePoint, r: TimePoint) {
  return Math.abs(r.x - l.x) + Math.abs(r.y - l.y);
}

type Cheat = {
  l: TimePoint;
  r: TimePoint;
  saved: number;
};

function findCheats(input: TimePoint[], cheatLength: number, minSavings: number) {
  const cheats: Cheat[] = [];

  for (let i = 0; i < input.length - minSavings; i++) {
    for (let j = i + minSavings; j < input.length; j++) {
      const d = distance(input[i], input[j]);
      const saved = j - i - d;
      if (saved >= minSavings && d <= cheatLength) {
        cheats.push({ l: input[i], r: input[j], saved });
      }
    }
  }
  return cheats;
}
