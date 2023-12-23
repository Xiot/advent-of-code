import { Point, aStar, byLine, findMaxOf, loadGrid, log as logBase, maxOf, visualizeGrid } from '../../utils';
type Input = ReturnType<typeof parse>;

export const parse = (text: string) => loadGrid(text, '.');

type Node = {
  x: number;
  y: number;
  length: number;
};

const DIRS = [
  { x: 0, y: 1 },
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: -1, y: 0 },
];

const SLOPE = {
  '>': { x: 1, y: 0 },
  '<': { x: -1, y: 0 },
  '^': { x: 0, y: -1 },
  v: { x: 0, y: 1 },
};

export function part1(input: Input) {
  const startPos = { x: 1, y: 0 };
  const endPos = Array.from(input.entries()).find(([pos, val]) => pos.y === input.bounds.bottom && val === '.')[0];

  type State = { pos: { x: number; y: number }; visited: Set<string>; dir: Point };
  const queue: State[] = [
    { pos: { x: startPos.x, y: startPos.y }, dir: { x: 0, y: 1 }, visited: new Set([keyOf(startPos)]) },
  ];

  const paths: State[] = [];

  while (queue.length > 0) {
    const s = queue.pop();
    if (s.pos.x === endPos.x && s.pos.y === endPos.y) {
      paths.push(s);
      log(s.visited.size - 1);
      continue;
    }

    for (const d of DIRS) {
      const newPoint = add(s.pos, d);
      if (!input.bounds.contains(newPoint.x, newPoint.y)) continue;
      const newValue = input.get(newPoint.x, newPoint.y);
      if (newValue === '#') continue;

      if (s.visited.has(keyOf(newPoint))) continue;

      if (Object.keys(SLOPE).includes(newValue)) {
        const slopeDir = SLOPE[newValue];
        const rev = mul(slopeDir, -1);
        if (d.x === rev.x && d.y === rev.y) continue;
      }

      queue.push({
        pos: newPoint,
        dir: d,
        visited: append(s.visited, newPoint),
      });
    }
  }
  const longest = maxOf(paths, p => p.visited.size - 1);
  log(paths.map(p => p.visited.size - 1));
  return longest;
}

export function part1_astar(input: Input) {
  const startPos = Array.from(input.entries()).find(([pos, val]) => val === 'S')[0];
  input.set(startPos.x, startPos.y, '.');
  const endPos = Array.from(input.entries()).find(([pos, val]) => pos.y === input.bounds.bottom && val === '.')[0];

  const ret = aStar<Node>(
    item => `${item.x},${item.y}`,
    { ...startPos, length: 0 },
    n => n.x === endPos.x && n.y === endPos.y,
    (node, path) => {
      const lastPos = path.at(-1);
      const delta = lastPos ? add(node, mul(lastPos, -1)) : { x: 0, y: 0 };

      const currentValue = input.get(node.x, node.y);

      let possible: Node[] = [];
      for (const d of DIRS) {
        const newPoint = add(node, d);
        if (!input.bounds.contains(newPoint.x, newPoint.y)) continue;

        const value = input.get(newPoint.x, newPoint.y);
        log(currentValue, node, value, newPoint);
        if (value === '#') continue;
        if (value === '.') {
          if (path.some(p => p.x === newPoint.x && p.y === newPoint.y)) continue;
          possible.push({ ...newPoint, length: node.length + 1 });
          continue;
        }

        if (Object.keys(SLOPE).includes(value)) {
          const slopeDir = SLOPE[value];
          log('slope', node, currentValue, slopeDir, delta);
          const rev = mul(slopeDir, -1);
          if (d.x === rev.x && d.y === rev.y) continue;
        }

        possible.push({ ...newPoint, length: node.length + 1 });
      }
      possible = possible.filter(p => !path.some(pp => pp.x === p.x && pp.y === p.y));
      log(node, possible);
      return possible;
    },
    () => 1,
    n => startPos.x - n.x + (startPos.y - n.y),
  );

  log(ret);
  if (!ret) return null;

  log(
    visualizeGrid(input, (x, y) => {
      const value = input.get(x, y);
      const inPath = ret.path.some(p => p.x === x && p.y === y);
      return inPath ? 'O' : value;
    }),
  );
  return ret.path.length - 1;
}

export function part2(input: Input) {
  const startPos = { x: 1, y: 0 };
  const endPos = Array.from(input.entries()).find(([pos, val]) => pos.y === input.bounds.bottom && val === '.')[0];

  type State = {
    pos: { x: number; y: number };
    visited: Map<string, number>;
    dir: Point;
  };

  let queue: State[] = [
    {
      pos: {
        x: startPos.x,
        y: startPos.y,
      },
      dir: { x: 0, y: 1 },
      visited: new Map([[keyOf(startPos), 0]]),
    },
  ];

  const paths: State[] = [];

  function prune(pos: Point, prev: Point, length: number) {
    let maxLength = 0;
    const newQueue = queue.filter(s => {
      const value = s.visited.get(keyOf(pos));
      if (value == null) return true;
      if (s.visited.has(keyOf(prev))) return true;
      if (value > maxLength) maxLength = value;
      return value > length;
    });
    return { queue: newQueue, maxLength };
  }

  while (queue.length > 0) {
    const s = queue.shift();
    if (s.pos.x === endPos.x && s.pos.y === endPos.y) {
      paths.push(s);
      log(s.visited.size - 1);
      continue;
    }

    const oldSize = queue.length;
    const ret = prune(s.pos, add(s.pos, mul(s.dir, -1)), s.visited.size);
    queue = ret.queue;
    if (oldSize !== queue.length) {
      log('prune', oldSize, queue.length, s.pos, s.visited.size, ret.maxLength);
    }
    // if (s.visited.size < ret.maxLength) continue;

    for (const d of DIRS) {
      const newPoint = add(s.pos, d);
      if (!input.bounds.contains(newPoint.x, newPoint.y)) continue;
      const newValue = input.get(newPoint.x, newPoint.y);
      if (newValue === '#') continue;

      if (s.visited.has(keyOf(newPoint))) continue;
      queue.push({
        pos: newPoint,
        dir: d,
        visited: mark(s.visited, newPoint),
      });
    }

    // function* getPossible() {
    //   for (const d of DIRS) {
    //     const newPoint = add(s.pos, d);
    //     if (!input.bounds.contains(newPoint.x, newPoint.y)) continue;
    //     const newValue = input.get(newPoint.x, newPoint.y);
    //     if (newValue === '#') continue;

    //     if (s.visited.has(keyOf(newPoint))) continue;
    //     yield {
    //       pos: newPoint,
    //       dir: d,
    //       visited: mark(s.visited, newPoint),
    //     };
    //   }
    // }

    // const possible = Array.from(getPossible());
    // for (const p of possible) {
    //   queue.push(p);
    // }
    // log('length', queue.length);
  }

  if (paths.length === 0) return -1;
  const longest = findMaxOf(paths, p => p.visited.size - 1);
  log(paths.map(p => p.visited.size - 1));

  if (longest) {
    log(
      visualizeGrid(input, (x, y) => {
        const value = input.get(x, y);
        if (longest.visited.has(keyOf({ x, y }))) {
          return '.';
        }
        return value === '#' ? '#' : ' ';
      }),
    );
  }

  return longest.visited.size - 1;
}

function add(l: Point, r: Point) {
  return { x: l.x + r.x, y: l.y + r.y };
}
function mul(l: Point, value: number) {
  return { x: l.x * value, y: l.y * value };
}

function keyOf(p: Point) {
  return `${p.x},${p.y}`;
}

function log(...args: any[]) {
  const changed = args.map(i => {
    if (i != null && typeof i === 'object' && 'x' in i) return `${i.x},${i.y}`;
    return i;
  });
  logBase(...changed);
}

function mark(m: Map<string, number>, p: Point) {
  const clone = new Map(m);
  clone.set(keyOf(p), m.size + 1);
  return clone;
}
function append(s: Set<string>, p: Point) {
  const clone = new Set(s);
  clone.add(keyOf(p));
  return clone;
}
