import { minOf, maxOf } from './array';
import { MinHeap, PriorityQueue } from './data-structures';
import { log } from './logging';
import { Bounds, GridMap, loadGrid } from './map';

export function* pointsWithin(gridOrBounds: GridMap | Bounds) {
  const bounds = 'bounds' in gridOrBounds ? gridOrBounds.bounds : gridOrBounds;
  for (let z = bounds.zMin; z <= bounds.zMax; z++) {
    for (let y = bounds.top; y <= bounds.bottom; y++) {
      for (let x = bounds.left; x <= bounds.right; x++) {
        yield [x, y, z] as const;
      }
    }
  }
}

export function visualizeGrid(
  gridOrBounds: GridMap | Bounds,
  render?: (x: number, y: number) => string,
  opts = { printRowNumbers: false, printColNumbers: false },
) {
  if (process.env.DEBUG !== '1') return 'NOT DEBUG';

  render ??= (x, y) => ('get' in gridOrBounds ? gridOrBounds.get(x, y) : ' ');

  const lines = [];
  // Allow the caller to pass a grid or bounds
  const { left = 0, top = 0, bottom, right } = 'bounds' in gridOrBounds ? gridOrBounds.bounds : gridOrBounds;

  for (let y = top; y <= bottom; y++) {
    let line = opts.printRowNumbers ? String(y).padStart(5, ' ') + ': ' : '';
    for (let x = left; x <= right; x++) {
      line += render(x, y);
    }
    lines.push(line);
  }
  return lines.join('\n');
}

export function boundsOfGrid(grid: Array<Array<any>>) {
  return {
    left: 0,
    right: grid[0].length - 1,
    top: 0,
    bottom: grid.length - 1,
    width: grid[0].length,
    height: grid.length,
  };
}

export function findBounds(input, accessX = p => p[0], accessY = p => p[1]) {
  return {
    left: minOf(input, accessX),
    right: maxOf(input, accessX),
    top: minOf(input, accessY),
    bottom: maxOf(input, accessY),
    get width() {
      return this.right - this.left + 1;
    },
    get height() {
      return this.bottom - this.top + 1;
    },
  };
}

type AStarItem<T = unknown> = {
  score: number;
  node: T;
  path: T[];
};
type AStarOptions = {
  mode: 'min' | 'max';
  debug: boolean;
};
export function aStar<T = unknown>(
  keyOf: (item: T) => string,
  start: T,
  atEndFn: (item: T) => boolean,
  getNeighbors: (item: T, path: T[]) => T[],
  costFn: (from: T, to: T) => number,
  hueristicFn: (item: T) => number,
  opt: Partial<AStarOptions> = { mode: 'min', debug: false },
) {
  let costs = {};
  let backtrace = {};
  let queue = new PriorityQueue<AStarItem<T>>(item => item.score);

  const costOf = node => costs[`${keyOf(node)}`] ?? Number.MAX_SAFE_INTEGER;

  costs[keyOf(start)] = 0;
  queue.push({ node: start, score: 0, path: [] });

  function collectPaths(node) {
    let path: T[] = [node];
    let lastPos = node;
    while (keyOf(lastPos) != keyOf(start)) {
      const prev = backtrace[keyOf(lastPos)];
      path.unshift(prev);
      lastPos = prev;
    }
    return path;
  }
  let steps = 0;
  while (queue.length > 0) {
    steps++;
    const { node, score, path } = queue.pop();

    steps < 20 && opt.debug && console.log(score, node);
    // if (steps >= 20) return null;
    if (atEndFn(node)) {
      return { node, score, path: collectPaths(node) };
    }

    const neighbors = getNeighbors(node, path);
    neighbors.forEach(n => {
      const neighborCost = costOf(node) + costFn(node, n);
      if (neighborCost < costOf(n)) {
        costs[keyOf(n)] = neighborCost;
        backtrace[keyOf(n)] = node;
        queue.push({ node: n, score: neighborCost + hueristicFn(n), path: [...path, node] });
      }
    });
  }
  log(steps);
  return null;
}

// based off of https://medium.com/@adriennetjohnson/a-walkthrough-of-dijkstras-algorithm-in-javascript-e94b74192026
export function dijkstra(grid, start, end) {
  if (Array.isArray(grid)) {
    grid = loadGrid(grid, undefined);
  }

  let times = {};
  let backtrace = {};
  let queue = new PriorityQueue<[{ x: number; y: number }, number]>(item => item[1]);

  const keyOf = ({ x, y }) => `${x},${y}`;

  const getNeighbors = ({ x, y }) => {
    const getInfo = (x, y) => {
      if (!grid.bounds.contains(x, y)) return null;
      return {
        pos: { x, y },
        cost: grid.get(x, y),
      };
    };
    return [getInfo(x - 1, y), getInfo(x + 1, y), getInfo(x, y - 1), getInfo(x, y + 1)]
      .filter(Boolean)
      .sort((l, r) => l.cost - r.cost);
  };

  for (let [x, y] of pointsWithin(grid)) {
    times[keyOf({ x, y })] = Number.MAX_SAFE_INTEGER;
  }
  times[keyOf(start)] = 0;

  queue.push([start, 0]);
  while (queue.length > 0) {
    const [pos, cost] = queue.pop();

    const neighbors = getNeighbors(pos);
    neighbors.forEach(n => {
      const time = times[keyOf(pos)] + n.cost;
      if (time < times[keyOf(n.pos)]) {
        times[keyOf(n.pos)] = time;
        backtrace[keyOf(n.pos)] = pos;
        queue.push([n.pos, time]);
      }
    });
  }

  let path = [end];
  let lastPos = end;
  while (!(lastPos.x === start.x && lastPos.y === start.y)) {
    const prev = backtrace[keyOf(lastPos)];
    path.unshift(prev);
    lastPos = prev;
  }

  return {
    cost: times[keyOf(end)],
    path,
  };
}
