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
  // log('input', input);

  const startPos = input.entries().find(e => e[1] === 'S')[0]!;
  const endPos = input.entries().find(e => e[1] === 'E')[0]!;

  const ret = solve(input, startPos, endPos);
  // log(ret);

  const minSavings = args.isSample ? 2 : 100;

  const cheats = findCheats(ret.path, 2, minSavings).sort((l, r) => l.saved - r.saved);
  const unique = uniqBy(cheats, c => `${c.l.x},${c.l.y}|${c.r.x},${c.r.y}`);

  // log(cheats);

  const clone = input.clone();
  for (const c of unique.filter(x => x.saved === 4)) {
    const l = calculateLine(c.l, c.r);
    const p = l.points().drop(1).toArray();

    for (let i = 0; i < p.length; i++) {
      clone.set(p[i].x, p[i].y, String(i + 1));
    }
  }

  // log(visualizeGrid(clone));

  return unique.length;
}

export function part2(input: Input) {
  // log('input', input);

  const startPos = input.entries().find(e => e[1] === 'S')[0]!;
  const endPos = input.entries().find(e => e[1] === 'E')[0]!;

  const ret = solve(input, startPos, endPos);
  // log(ret);

  const minSavings = args.isSample ? 50 : 100;

  const cheats = findCheats(ret.path, 20, minSavings).sort((l, r) => r.saved - l.saved);
  // log(cheats);

  const unique = uniqBy(cheats, c => `${c.l.x},${c.l.y}|${c.r.x},${c.r.y}`);

  const clone = input.clone();
  const buckets = createBucketMap<Cheat>(c => String(c.saved));
  for (const c of unique) {
    // log(distance(c.l, c.r), c);
    buckets.add(c);
  }

  // log(visualizeGrid(clone));

  const expected = 32 + 31 + 29 + 39 + 25 + 23 + 20 + 19 + 12 + 14 + 12 + 22 + 4 + 3;

  buckets.entries().forEach(([saved, cheats]) => {
    log(saved, cheats.length);
  });

  log('expected', expected);
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
    for (let j = i + minSavings + cheatLength; j < input.length; j++) {
      const d = distance(input[i], input[j]);

      if (d <= cheatLength) {
        cheats.push({ l: input[i], r: input[j], saved: j - i - d });
      }
    }
  }
  return cheats;
}
