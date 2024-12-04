import { byLine, GridMap, loadGrid, log } from '../../utils';
type Input = ReturnType<typeof parse>;

export const parse = (text: string) => loadGrid(text, '.');

export function part1(grid: Input) {
  let count = 0;

  const TARGET = 'XMAS';

  for (const p of grid.keys()) {
    count += checkRight(grid, p.x, p.y, TARGET) ? 1 : 0;
    count += checkLeft(grid, p.x, p.y, TARGET) ? 1 : 0;
    count += checkUp(grid, p.x, p.y, TARGET) ? 1 : 0;
    count += checkDown(grid, p.x, p.y, TARGET) ? 1 : 0;
    count += checkNE(grid, p.x, p.y, TARGET) ? 1 : 0;
    count += checkSE(grid, p.x, p.y, TARGET) ? 1 : 0;
    count += checkSW(grid, p.x, p.y, TARGET) ? 1 : 0;
    count += checkNW(grid, p.x, p.y, TARGET) ? 1 : 0;
  }
  return count;
}

function checkRight(grid: GridMap, x: number, y: number, word: string) {
  if (x > grid.bounds.right - 4) return false;
  for (let i = 0; i < word.length; i++) {
    if (grid.get(x + i, y) !== word[i]) return false;
  }
  return true;
}

function checkLeft(grid: GridMap, x: number, y: number, word: string) {
  for (let i = 0; i < word.length; i++) {
    if (grid.get(x - i, y) !== word[i]) return false;
  }
  return true;
}
function checkDown(grid: GridMap, x: number, y: number, word: string) {
  for (let i = 0; i < word.length; i++) {
    if (grid.get(x, y + i) !== word[i]) return false;
  }
  return true;
}
function checkUp(grid: GridMap, x: number, y: number, word: string) {
  for (let i = 0; i < word.length; i++) {
    if (grid.get(x, y - i) !== word[i]) return false;
  }
  return true;
}
function checkNE(grid: GridMap, x: number, y: number, word: string) {
  for (let i = 0; i < word.length; i++) {
    if (grid.get(x + i, y + i) !== word[i]) return false;
  }
  return true;
}
function checkSE(grid: GridMap, x: number, y: number, word: string) {
  for (let i = 0; i < word.length; i++) {
    if (grid.get(x + i, y - i) !== word[i]) return false;
  }
  return true;
}
function checkSW(grid: GridMap, x: number, y: number, word: string) {
  for (let i = 0; i < word.length; i++) {
    if (grid.get(x - i, y + i) !== word[i]) return false;
  }
  return true;
}
function checkNW(grid: GridMap, x: number, y: number, word: string) {
  for (let i = 0; i < word.length; i++) {
    if (grid.get(x - i, y - i) !== word[i]) return false;
  }
  return true;
}

export function part2(grid: Input) {
  let count = 0;
  for (const p of grid.keys()) {
    count += checkCross(grid, p.x, p.y) ? 1 : 0;
  }
  return count;
}

function checkCross(grid: GridMap, x: number, y: number) {
  if (grid.get(x, y) !== 'A') return false;

  const angle1 = checkSE(grid, x - 1, y + 1, 'MAS') || checkSE(grid, x - 1, y + 1, 'SAM');
  if (!angle1) return false;

  const angle2 = checkNE(grid, x - 1, y - 1, 'MAS') || checkNE(grid, x - 1, y - 1, 'SAM');
  if (!angle2) return false;

  return true;
}
