import { byLine, GridMap, loadGrid, log, Point } from '../../utils';
type Input = ReturnType<typeof parse>;

export const parse = byLine(line => line);

const numPad = loadGrid('789\n456\n123\n#0A', '#');
// const numPad = loadGrid('#0A\n123\n456\n789', '#');

const arrowPad = loadGrid('#^A\n<v>', '#');

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

// 212128 - high
export function part1(input: Input) {
  log('input', input);

  let totalComplexity = 0;
  for (const code of input) {
    const totalPath = find3(code);
    const complexity = totalPath.length * parseInt(code);
    log('arrow-2', totalPath.length, totalPath);
    log(code, totalPath.length, String(complexity).padStart(8), totalPath.join(''));

    totalComplexity += complexity;
  }
  return totalComplexity;
}

function find2(code: string | string[]) {
  const digitPath = findPathToSequence(numPad, code);
  log('numPad', digitPath.length, digitPath);

  const totalPath: string[] = [];
  let currentKey = 'A';
  for (let i = 0; i < digitPath.length; i++) {
    const digit = digitPath[i];
    const arrowPath = findPathBetweenKeys(arrowPad, currentKey, digit);

    totalPath.push(...arrowPath.path, 'A');
    currentKey = digit;
  }

  return totalPath;
}

function find3(code: string | string[]) {
  const totalPath: string[] = [];
  const digitPath = find2(code);
  log('arrow-1', digitPath.length, digitPath);

  let currentKey = 'A';
  for (let i = 0; i < digitPath.length; i++) {
    const digit = digitPath[i];
    const key = currentKey;
    const arrowPath = findPathBetweenKeys(arrowPad, key, digit);

    totalPath.push(...arrowPath.path, 'A');
    currentKey = digit;
  }

  return totalPath;
}

export function part2(input: Input) {}

function findPathToSequence(grid: GridMap, sequence: string | string[]) {
  let pos = findKeyPos(grid, 'A');
  const totalPath: string[] = [];
  for (let c of sequence) {
    let keyPos = findKeyPos(grid, c);
    const shortest = findPathToPoint(grid, pos, keyPos);

    totalPath.push(...shortest, 'A');

    pos = keyPos;
  }
  return totalPath;
}

function findKeyPos(grid: GridMap, key: string) {
  return grid.entries().find(([, v]) => v === key)[0];
}

function findPathBetweenKeys(grid: GridMap, start: string, end: string) {
  const startPos = findKeyPos(grid, start);
  const endPos = findKeyPos(grid, end);
  const path = findPathToPoint(grid, startPos, endPos);
  log(' ', grid === numPad ? 'num' : 'arr', start, end, path);
  return {
    start: startPos,
    end: endPos,
    path,
  };
}

function findPathToPoint2(grid: GridMap, start: Point, end: Point, pref: 'x' | 'y') {
  const path: string[] = [];
  let aStart = { ...start };
  let aEnd = { ...end };

  const dx = aEnd.x - aStart.x;
  const dy = aEnd.y - aStart.y;

  if (grid === arrowPad) {
    if (start.y === grid.bounds.bottom && start.x === 0) {
      for (let i = 0; i < Math.abs(dx); i++) {
        path.push(dx < 0 ? '<' : '>');
      }
      for (let i = 0; i < Math.abs(dy); i++) {
        path.push(dy < 0 ? '^' : 'v');
      }
      return path;
    }

    if (start.y === 0 && end.x === 0) {
      for (let i = 0; i < Math.abs(dy); i++) {
        path.push(dy < 0 ? '^' : 'v');
      }

      for (let i = 0; i < Math.abs(dx); i++) {
        path.push(dx < 0 ? '<' : '>');
      }
      return path;
    }
  }

  if (grid === numPad) {
    if (start.y === grid.bounds.bottom && end.x === 0) {
      for (let i = 0; i < Math.abs(dy); i++) {
        path.push(dy < 0 ? '^' : 'v');
      }

      for (let i = 0; i < Math.abs(dx); i++) {
        path.push(dx < 0 ? '<' : '>');
      }
      return path;
    }
    if (start.x === 0 && end.y === grid.bounds.bottom) {
      for (let i = 0; i < Math.abs(dx); i++) {
        path.push(dx < 0 ? '<' : '>');
      }

      for (let i = 0; i < Math.abs(dy); i++) {
        path.push(dy < 0 ? '^' : 'v');
      }
      return path;
    }
  }

  if (pref === 'x') {
    for (let i = 0; i < Math.abs(dx); i++) {
      path.push(dx < 0 ? '<' : '>');
    }

    for (let i = 0; i < Math.abs(dy); i++) {
      path.push(dy < 0 ? '^' : 'v');
    }
    return path;
  }

  for (let i = 0; i < Math.abs(dy); i++) {
    path.push(dy < 0 ? '^' : 'v');
  }

  for (let i = 0; i < Math.abs(dx); i++) {
    path.push(dx < 0 ? '<' : '>');
  }

  return path;
}

function findPathToPoint(grid: GridMap, start: Point, end: Point, pref: 'auto' | 'x' | 'y' = 'auto') {
  // const pathX = findPathToPoint2(grid, start, end, 'x');
  // const pathY = findPathToPoint2(grid, start, end, 'y');

  // if (pref === 'x') return pathX;
  // if (pref === 'y') return pathY;

  // return pathX.length < pathY.length ? pathX : pathY;

  const path: string[] = [];
  let aStart = { ...start };
  let aEnd = { ...end };

  const dx = aEnd.x - aStart.x;
  const dy = aEnd.y - aStart.y;

  if (grid === arrowPad) {
    if (start.y === grid.bounds.bottom && start.x === 0) {
      for (let i = 0; i < Math.abs(dx); i++) {
        path.push(dx < 0 ? '<' : '>');
      }
      for (let i = 0; i < Math.abs(dy); i++) {
        path.push(dy < 0 ? '^' : 'v');
      }
      return path;
    }

    if (start.y === 0 && end.x === 0) {
      for (let i = 0; i < Math.abs(dy); i++) {
        path.push(dy < 0 ? '^' : 'v');
      }

      for (let i = 0; i < Math.abs(dx); i++) {
        path.push(dx < 0 ? '<' : '>');
      }
      return path;
    }
  }

  if (grid === numPad) {
    if (start.y === grid.bounds.bottom && end.x === 0) {
      for (let i = 0; i < Math.abs(dy); i++) {
        path.push(dy < 0 ? '^' : 'v');
      }

      for (let i = 0; i < Math.abs(dx); i++) {
        path.push(dx < 0 ? '<' : '>');
      }
      return path;
    }

    if (dx > 0 && dy > 0) {
      for (let i = 0; i < Math.abs(dx); i++) {
        path.push(dx < 0 ? '<' : '>');
      }

      for (let i = 0; i < Math.abs(dy); i++) {
        path.push(dy < 0 ? '^' : 'v');
      }
      return path;
    }
  }

  // for (let i = 0; i < Math.abs(dy); i++) {
  //   path.push(dy < 0 ? '^' : 'v');
  // }

  for (let i = 0; i < Math.abs(dx); i++) {
    path.push(dx < 0 ? '<' : '>');
  }

  for (let i = 0; i < Math.abs(dy); i++) {
    path.push(dy < 0 ? '^' : 'v');
  }

  return path;
}
