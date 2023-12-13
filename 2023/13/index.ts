import { GridMap, Point, byLine, bySection, loadGrid, log, visualizeGrid } from '../../utils';
type Input = ReturnType<typeof parse>;

export const parse = (text: string) => {
  const sections = text.split('\n\n');
  return sections.map(s => loadGrid(s, '.'));
};

export function part1(input: Input) {
  let sum = 0;
  for (let g = 0; g < input.length; g++) {
    const v = findVerticalReflection(input[g]);
    const h = findHorizontalReflection(input[g]);
    log(g, v, h, v + 100 * h);

    if (v > h) {
      sum += v;
    } else {
      sum += 100 * h;
    }
  }
  return sum;
}

export function part2(input: Input) {
  // const v = findVerticalReflectionWithSmudge(input[0]);
  // const h = findHorizontalReflectionWithSmudge(input[0]);

  // log(v, h);
  // return v;

  let sum = 0;
  for (let g = 0; g < input.length; g++) {
    log(g);
    log('vertical');
    const v = findVerticalReflectionWithSmudge(input[g]);
    if (v) {
      sum += v;
      continue;
    }
    log();
    log('horizontal');
    const h = findHorizontalReflectionWithSmudge(input[g]);
    sum += h * 100;
    log(g, v, h, v + 100 * h);
    log();
    log(visualizeGrid(input[g]));
    log();
    // if (v > h) {
    //   sum += v;
    // } else {
    //   sum += 100 * h;
    // }
  }
  return sum;
}

function findVerticalReflection(grid: GridMap) {
  const columns: string[] = [];
  for (let x = grid.bounds.left; x <= grid.bounds.right; x++) {
    columns[x] = getColumn(grid, x);
  }

  const startLeft = 0;
  const endRight = columns.length;

  for (let c = startLeft; c < endRight; c++) {
    if (columns[c] === columns[c - 1]) {
      let found = true;
      for (let l = c - 1, r = c; l >= 0 && r < columns.length; l--, r++) {
        log('l', l, columns[l]);
        log('r', r, columns[r]);
        if (columns[l] !== columns[r]) {
          found = false;
          break;
        }
      }
      if (found) {
        log('found', c);
        return c;
      }
    }
  }
  return 0;
}

function findHorizontalReflection(grid: GridMap) {
  const rows: string[] = [];
  for (let y = grid.bounds.top; y <= grid.bounds.bottom; y++) {
    rows[y] = getRow(grid, y);
  }

  const startTop = 0;
  const endBottom = rows.length;

  let found = false;
  for (let row = startTop; row < endBottom; row++) {
    if (rows[row] === rows[row - 1]) {
      found = true;
      for (let l = row - 2, r = row + 1; l >= 0 && r < rows.length; l--, r++) {
        if (rows[l] !== rows[r]) {
          found = false;
          break;
        }
      }
      if (found) {
        return row;
      }
    }
  }
  return 0;
}

function getColumn(grid: GridMap, col: number) {
  let values = '';
  for (let y = grid.bounds.top; y <= grid.bounds.bottom; y++) {
    values += grid.get(col, y);
  }
  return values;
}

function getRow(grid: GridMap, row: number) {
  let values = '';
  for (let x = grid.bounds.left; x <= grid.bounds.right; x++) {
    values += grid.get(x, row);
  }
  return values;
}

function findVerticalReflectionWithSmudge(grid: GridMap) {
  const columns: string[] = [];
  for (let x = grid.bounds.left; x <= grid.bounds.right; x++) {
    columns[x] = getColumn(grid, x);
  }

  const startLeft = 0;
  const endRight = columns.length;

  let smudge: Point | null = null;
  for (let c = startLeft; c < endRight; c++) {
    let found = true;
    for (let l = c - 1, r = c; l >= 0 && r < columns.length; l--, r++) {
      if (columns[l] === columns[r]) continue;

      const d = differences(columns[l], columns[r]);
      if (d.length === 1) {
        log('diff', d[0]);
        log(l, columns[l]);
        log(r, columns[r]);
        smudge = { x: l, y: d[0] };
      } else {
        found = false;
        smudge = null;
        break;
      }
    }

    if (found && smudge == null) {
      log('found with no smudge', c);
    }
    if (found && smudge != null) {
      log('found', c, smudge);
      grid.set(smudge.x, smudge.y, grid.get(smudge.x, smudge.y) === '#' ? '.' : '#');
      return c;
    }
  }
  return 0;
}
function findHorizontalReflectionWithSmudge(grid: GridMap) {
  const rows: string[] = [];
  for (let y = grid.bounds.top; y <= grid.bounds.bottom; y++) {
    rows[y] = getRow(grid, y);
  }

  const startTop = 0;
  const endBottom = rows.length;

  let smudge: Point | null = null;
  for (let row = startTop; row < endBottom; row++) {
    let found = true;
    for (let l = row - 1, r = row; l >= 0 && r < rows.length; l--, r++) {
      if (rows[l] === rows[r]) continue;

      log(l, rows[l]);
      log(r, rows[r]);
      const d = differences(rows[l], rows[r]);
      if (d.length === 1) {
        smudge = { x: d[0], y: l };
      } else {
        found = false;
        smudge = null;
        break;
      }
    }
    if (found && smudge == null) {
      log('found with no smudge', row);
    }
    if (found && smudge != null) {
      log('found', row, smudge);
      grid.set(smudge.x, smudge.y, grid.get(smudge.x, smudge.y) === '#' ? '.' : '#');
      return row;
    }
  }
  return 0;
}

function differences(left: string, right: string) {
  const diff: number[] = [];
  for (let i = 0; i < left.length; i++) {
    if (left[i] !== right[i]) {
      diff.push(i);
    }
  }
  return diff;
}
