import { byLine, log } from '../../utils';
type Input = ReturnType<typeof parse>;

export const parse = byLine(line => line.split(' ').map(x => parseInt(x)));

export function part1(input: Input) {
  let sum = 0;
  for (const row of input) {
    const tree = buildDiffTree(row);
    log(tree);
    extrapulateForward(tree);
    log(tree);
    sum += tree[0].at(-1);
  }
  return sum;
}

export function part2(input: Input) {
  let sum = 0;

  for (const row of input) {
    const tree = buildDiffTree(row);
    log(tree);
    extrapulateBackwards(tree);
    log(tree);
    sum += tree[0].at(0);
  }
  return sum;
}

function extrapulateForward(tree: number[][]) {
  tree.at(-1).push(0);
  for (let r = tree.length - 2; r >= 0; r--) {
    const baseValue = tree[r + 1].at(-1);
    const sideValue = tree[r].at(-1);
    tree[r].push(baseValue + sideValue);
  }
}

function extrapulateBackwards(tree: number[][]) {
  tree.at(-1).unshift(0);
  for (let r = tree.length - 2; r >= 0; r--) {
    const baseValue = tree[r + 1].at(0);
    const sideValue = tree[r].at(0);
    tree[r].unshift(sideValue - baseValue);
  }
}

function buildDiffTree(line: number[]) {
  const rows = [[...line]];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const newRow = [];
    let allZero = true;
    for (let n = 1; n < row.length; n++) {
      const diff = row[n] - row[n - 1];
      newRow.push(diff);
      allZero = allZero && diff === 0;
    }
    rows.push(newRow);
    if (allZero) break;
  }
  return rows;
}
