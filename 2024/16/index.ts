import { isEqual, omit, uniqBy } from 'lodash';
import { byLine, GridMap, loadGrid, log, Point, visualizeGrid } from '../../utils';
type Input = ReturnType<typeof parse>;

export const parse = (text: string) => loadGrid(text, '.');

const DIRECTIONS: Point[] = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 0, y: -1 },
];

function rotateLeft(dir: Point) {
  const index = DIRECTIONS.findIndex(d => isEqual(d, dir));
  const newIndex = (index - 1 + DIRECTIONS.length) % DIRECTIONS.length;
  return DIRECTIONS[newIndex];
}

function rotateRight(dir: Point) {
  const index = DIRECTIONS.findIndex(d => isEqual(d, dir));
  const newIndex = (index + 1) % DIRECTIONS.length;
  return DIRECTIONS[newIndex];
}

export function part1(input: Input) {
  // log('input', input);

  const startPos = input.entries().find(([pos, val]) => val === 'S')[0];
  const endPos = input.entries().find(([pos, val]) => val === 'E')[0];

  log(startPos, endPos);
  log(visualizeGrid(input));

  const ret = lowestScore(input, startPos, endPos);
  if (ret) {
    const clone = input.clone();
    ret.path.forEach(p => {
      clone.set(p.x, p.y, '+');
    });
    log('');
    log(visualizeGrid(clone));
    log(ret.score);
    return ret.score;
  }
  return -1;
  // return ret;
}

export function part2(input: Input) {
  const startPos = input.entries().find(([pos, val]) => val === 'S')[0];
  const endPos = input.entries().find(([pos, val]) => val === 'E')[0];

  log(startPos, endPos);
  log(visualizeGrid(input));

  const lowest = lowestScores(input, startPos, endPos);
  if (lowest.length > 0) {
    const p = uniqBy(
      lowest.flatMap(x => x.path),
      p => `${p.x},${p.y}`,
    );

    const clone = input.clone();
    for (const ret of lowest) {
      ret.path.forEach(p => {
        clone.set(p.x, p.y, '+');
      });
    }
    log('');
    log('paths', lowest.length);
    log(visualizeGrid(clone));

    return p.length;
  }
  return -1;
}

function add(l: Point, r: Point) {
  return {
    x: l.x + r.x,
    y: l.y + r.y,
  };
}

type QueueItem = {
  pos: Point;
  dir: Point;
  score: number;
  path: Point[];
};

function lowestScore(grid: GridMap, startPos: Point, endPos: Point) {
  function keyOf(pos: Point, dir: Point) {
    return `${pos.x},${pos.y}|${dir.x},${dir.y}`;
  }

  const seen = new Set<string>();

  const queue: QueueItem[] = [];

  function append(item: QueueItem) {
    const key = keyOf(item.pos, item.dir);
    if (seen.has(key)) return;
    seen.add(key);
    queue.push(item);
  }

  append({ pos: startPos, dir: DIRECTIONS[0], score: 0, path: [] });

  while (queue.length > 0) {
    queue.sort((l, r) => (l.score < r.score ? 1 : -1));

    const item = queue.pop();
    log(omit(item, ['path']));

    if (isEqual(item.pos, endPos)) {
      return item;
    }

    const newPos = add(item.pos, item.dir);
    if (grid.get(newPos) === '#') {
      append({ pos: item.pos, dir: rotateLeft(item.dir), score: item.score + 1000, path: [...item.path] });
      append({ pos: item.pos, dir: rotateRight(item.dir), score: item.score + 1000, path: [...item.path] });
      continue;
    }

    append({ pos: newPos, dir: item.dir, score: item.score + 1, path: [...item.path, newPos] });

    for (const d of DIRECTIONS) {
      const newPos = add(item.pos, d);
      if (grid.get(newPos) !== '#') {
        append({ pos: item.pos, dir: d, score: item.score + 1000, path: [...item.path] });
      }
    }
  }
}

function lowestScores(grid: GridMap, startPos: Point, endPos: Point): QueueItem[] {
  function keyOf(pos: Point, dir: Point) {
    return `${pos.x},${pos.y}|${dir.x},${dir.y}`;
  }

  const seen: Record<string, number> = {};

  const queue: QueueItem[] = [];

  const results: QueueItem[] = [];

  function append(item: QueueItem) {
    const key = keyOf(item.pos, item.dir);
    if (key in seen) {
      if (seen[key] < item.score) return;
    }
    seen[key] = item.score;
    queue.push(item);
  }

  append({ pos: startPos, dir: DIRECTIONS[0], score: 0, path: [startPos] });

  while (queue.length > 0) {
    queue.sort((l, r) => (l.score < r.score ? 1 : -1));

    const item = queue.pop();
    log(omit(item, ['path']));

    if (isEqual(item.pos, endPos)) {
      if (results.length === 0) {
        results.push(item);
        continue;
      }

      const previousBest = results[0].score;
      const current = item.score;
      log('prev', previousBest, current);
      if (current > previousBest) {
        return results;
      }
      results.push(item);
      continue;
    }

    const newPos = add(item.pos, item.dir);
    if (grid.get(newPos) === '#') {
      append({
        pos: item.pos,
        dir: rotateLeft(item.dir),
        score: item.score + 1000,
        path: [...item.path],
      });
      append({
        pos: item.pos,
        dir: rotateRight(item.dir),
        score: item.score + 1000,
        path: [...item.path],
      });
      continue;
    }

    append({ pos: newPos, dir: item.dir, score: item.score + 1, path: [...item.path, newPos] });

    for (const d of DIRECTIONS) {
      const newPos = add(item.pos, d);
      if (grid.get(newPos) !== '#') {
        append({ pos: item.pos, dir: d, score: item.score + 1000, path: [...item.path] });
      }
    }
  }
  return results;
}
