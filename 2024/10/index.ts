import { uniqBy } from 'lodash';
import { byLine, GridMap, loadGrid, log, Point } from '../../utils';
type Input = ReturnType<typeof parse>;

export const parse = (text: string) => loadGrid(text, '.');

const DIRECTIONS = [
  { x: 0, y: 1 },
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: -1, y: 0 },
];

export function part1(input: Input) {
  log('input', input);
  input.markOnGet = false;

  const startPoints = input
    .entries()
    .filter(c => c[1] === '0')
    .map(x => x[0])
    .toArray();

  log('start', startPoints);

  let sum = 0;
  for (const start of startPoints) {
    const paths = explore(input, start);

    const uniquePaths = uniqBy(paths, x => `${x.pos.x},${x.pos.y}`);
    log(uniquePaths);
    sum += uniquePaths.length;
  }
  return sum;
}

export function part2(input: Input) {
  log('input', input);
  input.markOnGet = false;

  const startPoints = input
    .entries()
    .filter(c => c[1] === '0')
    .map(x => x[0])
    .toArray();

  log('start', startPoints);

  let sum = 0;
  for (const start of startPoints) {
    const paths = explore(input, start);

    sum += paths.length;
  }
  return sum;
}

function explore(grid: GridMap, start: Point) {
  const paths = [];
  const queue = [{ pos: start, height: parseInt(grid.get(start.x, start.y)), path: [start] }];

  while (queue.length) {
    const item = queue.shift();

    if (item.height === 9) {
      paths.push(item);
      continue;
    }

    DIRECTIONS.forEach(d => {
      const newPoint = add(item.pos, d);
      if (!grid.bounds.contains(newPoint.x, newPoint.y)) return;

      const value = parseInt(grid.get(newPoint.x, newPoint.y));
      if (value !== item.height + 1) return;

      queue.push({ pos: newPoint, height: value, path: [...item.path, newPoint] });
    });
  }
  return paths;
}

function add(l: Point, r: Point) {
  return {
    x: l.x + r.x,
    y: l.y + r.y,
  };
}
