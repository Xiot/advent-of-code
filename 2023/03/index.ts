import { GridMap, Point, loadGrid, log, sumOf, visualizeGrid } from '../../utils';

type Input = ReturnType<typeof parse>;

export const parse = text => loadGrid(text, '.');

export function part1(grid: Input) {
  const parts: number[] = [];

  log(visualizeGrid(grid, (x, y) => grid.get(x, y)));

  for (const entry of grid.entries()) {
    const [pos, value] = entry;

    if (!isSymbol(value)) continue;
    const partNo = findPartNo(grid, pos);
    if (partNo === undefined) continue;
    parts.push(...partNo);
    console.log(partNo);
  }
  return sumOf(parts);
}

export function part2(grid: Input) {
  let sum = 0;

  log(visualizeGrid(grid, (x, y) => grid.get(x, y)));

  for (const entry of grid.entries()) {
    const [pos, value] = entry;
    if (value !== '*') continue;

    const parts = findPartNo(grid, pos);
    log('gear', parts);
    if (parts.length !== 2) continue;
    sum += parts.reduce((acc, n) => acc * n);
  }
  return sum;
}

function findPartNo(grid: GridMap, pos: Point) {
  const parts = new Set<number>();
  for (const p of grid.ring(pos.x, pos.y)) {
    if (isDigit(p[1])) {
      const num = extractNumber(grid, p[0]);
      parts.add(num);
    }
  }
  return Array.from(parts);
}

function extractNumber(grid: GridMap, pos: Point) {
  let startX = pos.x;
  for (let x = pos.x - 1; x >= 0; x--) {
    const digit = grid.get(x, pos.y);
    if (!isDigit(digit)) break;
    startX = x;
  }

  let endX = pos.x;
  for (let x = pos.x + 1; x < grid.bounds.width; x++) {
    const digit = grid.get(x, pos.y);
    if (!isDigit(digit)) break;
    endX = x;
  }
  let text = '';
  for (let x = startX; x <= endX; x++) {
    text += grid.get(x, pos.y);
  }
  return parseInt(text);
}

function isDigit(letter: string) {
  return letter >= '0' && letter <= '9';
}

function isSymbol(letter: string) {
  if (letter === '.') return false;
  return !isDigit(letter);
}
