import {
  GridMap,
  MinHeap,
  Point,
  PriorityQueue,
  aStar,
  byLine,
  loadGrid,
  log,
  range,
  sumOf,
  visualizeGrid,
} from '../../utils';
import { calculateLine } from '../../utils/line';
type Input = ReturnType<typeof parse>;

export const parse = (text: string) => loadGrid(text, ' ');

type Node = {
  x: number;
  y: number;
  heatLoss: number;
};

const DIRS = [
  { x: 0, y: 1 },
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: -1, y: 0 },
];

export function part1() {
  const heap = new MinHeap<number>(x => x);
  heap.push(5);
  heap.push(3);
  heap.push(4);
  heap.push(2);
  heap.push(8);
  heap.push(1);
  heap.push(4);
  log(heap.data);

  const q = new PriorityQueue<number>(x => x);
  q.push(5);
  q.push(3);
  q.push(4);
  q.push(2);
  q.push(8);
  q.push(1);
  q.push(4);

  while (heap.length > 0) {
    log(heap.pop(), heap.data);
  }
  while (q.length > 0) {
    log(q.pop(), q.data);
  }
  // log(heap.pop(), heap.data);
}

export function part1_bfs(grid: Input) {
  const ret = bfs(grid);
  // log(ret);
  return ret?.heatLoss ?? -1;
}

type Item = {
  heatLoss: number;
  pos: Point;
  last: Point;
  path: Item[];
};

export function bfs(grid: GridMap) {
  const startPos = { x: 0, y: 0, heatLoss: 0 };
  const endPos = { x: grid.bounds.right, y: grid.bounds.bottom };

  // const queue: Array<{ node: Node; path: Node[] }> = [{ node: startPos, path: [] }];

  function distanceToGoal(node: Point) {
    return endPos.x - node.x + endPos.y - node.y;
  }

  const queue = new MinHeap<Item>(node => {
    return node.heatLoss + distanceToGoal(node.pos);
  });

  function isValid(node: Point, path: Item[]) {
    if (path.length < 3) return true;
    const last3 = [...path.slice(-3).map(x => x.pos), node];
    if (last3.every(n => n.x === node.x)) return false;
    if (last3.every(n => n.y === node.y)) return false;
    return true;
  }

  function getNextNodes(node: Item) {
    const next: Item[] = [];
    for (let d of DIRS) {
      const nextPos = { x: node.pos.x + d.x, y: node.pos.y + d.y };
      if (!grid.bounds.contains(nextPos.x, nextPos.y)) continue;
      if (node.last.x > -1 && nextPos.x === node.last.x && nextPos.y === node.last.y) continue;
      if (!isValid(nextPos, node.path)) continue;
      next.push({
        pos: { x: nextPos.x, y: nextPos.y },
        last: node.pos,
        heatLoss: node.heatLoss + valueAt(grid, nextPos),
        path: [...node.path, node],
      });
    }
    return next;
  }
  function keyOf(node: Item) {
    return `${node.pos.x},${node.pos.y}|${node.heatLoss}`;
  }
  const seen = new Set<string>();

  queue.push({ heatLoss: 0, pos: { x: 0, y: 0 }, last: { x: -1, y: -1 }, path: [] });

  let steps = 0;

  while (queue.length > 0) {
    steps += 1;
    const node = queue.pop();
    const key = keyOf(node);
    if (seen.has(key)) continue;
    seen.add(key);

    // log(node);
    // if (steps > 20) return null;
    if (distanceToGoal(node.pos) === 0) return node;

    const neighbors = getNextNodes(node); //getNeighbors(grid, node, path);

    for (let n of neighbors) {
      queue.push({
        heatLoss: node.heatLoss + valueAt(grid, n.pos),
        pos: n.pos,
        last: node.pos,
        path: [...node.path, node],
      });
    }
  }
  return null;
}

export function part1_astar(input: Input) {
  log('input', visualizeGrid(input));

  const endPos = { x: input.bounds.right, y: input.bounds.bottom };

  function distanceToGoal(node: Node) {
    return endPos.x - node.x + endPos.y - node.y;
  }

  const ret = aStar<Node>(
    item => `${item.x},${item.y}|${item.heatLoss}`,
    { x: 0, y: 0, heatLoss: 0 },
    item => item.x === endPos.x && item.y === endPos.y,
    (node, path) => {
      const n = getNeighbors(input, node, path);
      return n;
    },
    // (cur, next) => parseInt(input.get(next.x, next.y)),
    (cur, next) => {
      let sum = 0;
      let line = calculateLine(cur, next);
      let points = Array.from(line.points()).slice(1);
      return sumOf(points, p => valueAt(input, p));
    },
    distanceToGoal,
    { debug: true },
  );
  log(ret);

  if (ret != null) {
    log(
      visualizeGrid(input, (x, y) => {
        if (ret.path.some(n => n.x === x && n.y === y)) return '*';
        return input.get(x, y);
      }),
    );
  }

  return ret?.score ?? -1;
}

export function part2(input: Input) {}

function isValid(node: Point, path: Node[]) {
  if (path.length < 3) return true;
  const last3 = [...path.slice(-3), node];
  if (last3.every(n => n.x === node.x)) return false;
  if (last3.every(n => n.y === node.y)) return false;
  return true;
}

function getNeighbors(grid: GridMap, node: Node, path: Node[]): Node[] {
  const next: Node[] = [];

  const last = path.at(-1);

  const validDirs = last == null ? DIRS : node.x === last.x ? DIRS.filter(p => p.y === 0) : DIRS.filter(p => p.x === 0);

  // if (node.x === 0 && node.y === 0) {
  // } else {
  //   return [];
  // }

  for (let d of validDirs) {
    for (let c = 1; c <= 3; c++) {
      const nextPos = { x: node.x + d.x * c, y: node.y + d.y * c };
      if (!grid.bounds.contains(nextPos.x, nextPos.y)) continue;
      const heatLoss = range(0, c - 1).reduce((acc, cur) => {
        return acc + valueAt(grid, { x: nextPos.x - d.x * cur, y: nextPos.y - d.y * cur });
      }, 0);
      next.push({
        x: nextPos.x,
        y: nextPos.y,
        heatLoss: node.heatLoss + heatLoss,
      });
    }
  }

  // for (let d of DIRS) {
  //   const nextPos = { x: node.x + d.x, y: node.y + d.y };
  //   if (!grid.bounds.contains(nextPos.x, nextPos.y)) continue;
  //   if (last && nextPos.x === last.x && nextPos.y === last.y) continue;
  //   if (!isValid(nextPos, path)) continue;
  //   next.push({
  //     x: nextPos.x,
  //     y: nextPos.y,
  //     heatLoss: node.heatLoss + valueAt(grid, nextPos),
  //   });
  // }
  if (node.x === 2 && node.y === 0) {
    log('ne', node, last, node.x === last.x, node.x, last.x, validDirs, next);
  }
  // log(node, next);

  return next;
}
function valueAt(grid: GridMap, pos: Point) {
  return parseInt(grid.get(pos.x, pos.y));
}
