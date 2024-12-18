import { isEqual } from 'lodash';
import { byLine, createGridMap, GridMap, log, Point, visualizeGrid } from '../../utils';
type Input = ReturnType<typeof parse>;

export const parse = (text: string) => {
  return text.split('\n').map(line => {
    const parts = line.split(',');
    return {
      x: parseInt(parts[0]),
      y: parseInt(parts[1]),
    };
  });
};

export function part1(input: Input) {
  // log('input', input);
  const grid = createGridMap('.');
  const SIZE = global.args.isSample ? 6 : 70;
  const TIME = global.args.isSample ? 12 : 1024;

  grid.set(SIZE, SIZE, '.');
  grid.markOnGet = false;

  const blocks = input.slice(0, TIME);
  blocks.forEach(p => {
    grid.set(p.x, p.y, '#');
  });
  console.log(visualizeGrid(grid));
  log('--------------');

  const ret = shortestPath(grid, { x: 0, y: 0 }, { x: SIZE, y: SIZE });
  if (!ret) return;

  for (const b of blocks) {
    grid.set(b.x, b.y, '#');
  }
  for (const b of ret.path) {
    const c = grid.get(b);

    grid.set(b.x, b.y, c === '#' ? 'X' : 'O');
  }
  console.log(visualizeGrid(grid));

  log(ret.path);
  return ret.path.length - 1;
}

export function part2(input: Input) {
  const grid = createGridMap('.');
  const SIZE = global.args.isSample ? 6 : 70;

  grid.set(SIZE, SIZE, '.');
  grid.markOnGet = false;

  const blocks = input;

  let i = 0;
  let clone = grid.clone();

  let currentPath: Point[] = [];

  while (i < blocks.length) {
    const block = blocks[i];
    clone.set(block.x, block.y, '#');

    if (currentPath.length > 0 && !currentPath.some(p => isEqual(p, block))) {
      i++;
      continue;
    }

    const ret = shortestPath(clone, { x: 0, y: 0 }, { x: SIZE, y: SIZE });

    log(`${String(i).padStart(4)} ------ [${ret?.path.length}]`, block);

    if (!ret) return `${block.x},${block.y}`;
    currentPath = ret.path;

    i++;
  }
}

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

type QueueItem = { pos: Point; path: Point[]; time: number };
function shortestPath(grid: GridMap, startPos: Point, endPos: Point) {
  function keyOf(p: Point) {
    return `${p.x},${p.y}`;
  }

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

  append({ pos: startPos, path: [startPos], time: 0 });

  while (queue.length > 0) {
    const item = queue.shift();

    if (isEqual(item.pos, endPos)) {
      return item;
    }

    for (let d of DIRECTIONS) {
      const newPos = add(item.pos, d);
      append({ pos: newPos, path: [...item.path, newPos], time: item.time + 1 });
    }
  }
}
