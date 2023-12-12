import { byLine, combinations, log, permutations, range } from '../../utils';
type Input = ReturnType<typeof parse>;

export const parse = (text: string) => {
  const lines = text.split('\n');
  return lines.map(line => {
    const [row, groupText] = line.split(' ');
    return {
      row,
      groups: groupText.split(',').map(x => parseInt(x)),
    };
  });
};

function buildExpression(groups: number[]) {
  let re = '^\\.*';
  for (let g = 0; g < groups.length; g++) {
    re += `#{${groups[g]}}`;
    if (g === groups.length - 1) {
      re += '\\.*';
    } else {
      re += '\\.+';
    }
  }
  re += '$';
  return new RegExp(re);
}

export function part1(input: Input) {
  log('input', input);

  let sum = 0;
  let i = 0;
  for (const row of input) {
    const rw = buildExpression(row.groups);
    const pos = Array.from(getPossibilities(row.row, rw));
    log(i, rw, pos);
    sum += pos.length;
    i++;
  }
  return sum;
}

export function part2(input: Input) {
  // log('input', input);
  // let sum = 0;
  // let i = 0;
  // for (const row of input) {
  //   const newRow = range(1, 5)
  //     .map(() => row.row)
  //     .join('?');
  //   const newGroups = range(1, 5).reduce((acc, cur) => acc.concat(cur), []);
  //   const rw = buildExpression(newGroups);
  //   const pos = Array.from(getPossibilities(newRow, rw));
  //   log(i, rw, pos);
  //   sum += pos.length;
  //   i++;
  // }
  // return sum;
}

function* getPossibilities(row: string, evaluator: RegExp) {
  const indexes = row
    .split('')
    .map((c, i) => (c === '?' ? i : -1))
    .filter(x => x !== -1);

  const replacements = range(0, Math.pow(2, indexes.length) - 1).map(d =>
    d.toString(2).padStart(indexes.length, '0').replace(/0/g, '.').replace(/1/g, '#'),
  );

  for (let r = 0; r < replacements.length; r++) {
    const rep = replacements[r];

    let t = row.split('');
    for (let i = 0; i < indexes.length; i++) {
      const id = indexes[i];
      t[id] = rep[i];
    }
    let text = t.join('');
    if (evaluator.exec(text) !== null) yield text;
  }
}
