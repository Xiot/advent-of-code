import {
  GridMap,
  Point,
  byLine,
  combinations,
  createGridMap,
  loadGrid,
  log,
  range,
  sumOf,
  visualizeGrid,
} from '../../utils';
type Input = ReturnType<typeof parse>;

export const parse = text => loadGrid(text, '.');

export function part1(input: Input) {
  let grid = createGridMap('.');

  let galaxies: Point[] = [];

  log(input.bounds.toJSON());

  let newY = 0;
  for (let y = input.bounds.top; y <= input.bounds.bottom; y++) {
    const isEmpty = isRowEmpty(input, y);
    for (let x = input.bounds.left; x <= input.bounds.right; x++) {
      const value = input.get(x, y);
      grid.set(x, newY, value);
    }
    newY += isEmpty ? 2 : 1;
  }

  input = grid;
  grid = createGridMap('.');
  let newX = 0;
  for (let x = input.bounds.left; x <= input.bounds.right; x++) {
    const isEmpty = isColEmpty(input, x);
    for (let y = input.bounds.top; y <= input.bounds.bottom; y++) {
      const value = input.get(x, y);
      grid.set(newX, y, value);
      if (value === '#') {
        galaxies.push({ x: newX, y });
      }
    }
    newX += isEmpty ? 2 : 1;
  }

  log(visualizeGrid(grid));

  let sum = 0;
  const pairs = combinations(range(0, galaxies.length - 1), 2);
  for (const [leftIndex, rightIndex] of pairs) {
    const left = galaxies[leftIndex];
    const right = galaxies[rightIndex];
    const distance = Math.abs(left.x - right.x) + Math.abs(left.y - right.y);
    log(leftIndex, rightIndex, distance);
    sum += distance;
  }
  return sum;
}

export function part2(input: Input) {
  const multiplier = 1000000; //10;
  const emptyRows = range(input.bounds.top, input.bounds.bottom)
    .map(y => {
      return { empty: isRowEmpty(input, y), y };
    })
    .filter(x => x.empty);
  const emptyCols = range(input.bounds.left, input.bounds.right)
    .map(x => {
      return { empty: isColEmpty(input, x), x };
    })
    .filter(x => x.empty);

  const galaxies = Array.from(input.entries())
    .filter(([pos, value]) => value === '#')
    .map(e => e[0]);

  let sum = 0;
  const pairs = combinations(range(0, galaxies.length - 1), 2);
  for (const [leftIndex, rightIndex] of pairs) {
    const left = galaxies[leftIndex];
    const right = galaxies[rightIndex];
    const smallDistance = Math.abs(left.x - right.x) + Math.abs(left.y - right.y);

    const [tt, bb] = [left.y, right.y].sort((l, r) => l - r);
    const r = emptyRows.reduce((acc, i) => {
      if (i.y > tt && i.y < bb) {
        acc += multiplier - 1;
      }
      return acc;
    }, 0);

    const [ll, rr] = [left.x, right.x].sort((l, r) => l - r);
    const c = emptyCols.reduce((acc, i) => {
      if (i.x > ll && i.x < rr) {
        acc += multiplier - 1;
      }
      return acc;
    }, 0);
    sum += smallDistance + r + c;
  }
  return sum;
}

function isRowEmpty(grid: GridMap, row: number) {
  for (let x = grid.bounds.left; x <= grid.bounds.right; x++) {
    if (grid.get(x, row) !== '.') return false;
  }
  return true;
}

function isColEmpty(grid: GridMap, col: number) {
  for (let y = grid.bounds.top; y <= grid.bounds.bottom; y++) {
    if (grid.get(col, y) !== '.') return false;
  }
  return true;
}
