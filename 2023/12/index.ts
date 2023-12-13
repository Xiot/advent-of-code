import { byLine, combinations, log, memoize, permutations, range, sumOf } from '../../utils';
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
  for (const row of input) {
    const rw = buildExpression(row.groups);
    const pos = Array.from(getPossibilities(row.row, rw));
    sum += pos.length;
  }
  return sum;
}

export function part2(input: Input) {
  let sum = 0;
  for (const row of input) {
    const newRow = range(1, 5)
      .map(() => row.row)
      .join('?');
    const newGroups = range(1, 5).reduce((acc, cur) => acc.concat(row.groups), []);
    log(newRow, newGroups);
    const count = getPossibilities2(newRow, newGroups);
    log(count);
    sum += count;
  }
  return sum;
}

const getPossibilities2 = memoize((text: string, groups: number[]) => {
  if (text.length === 0) {
    if (groups.length === 0) return 1;
    return 0;
  }
  if (groups.length === 0) {
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '#') return 0;
    }
    return 1;
  }

  if (text.length < sumOf(groups) + groups.length - 1) return 0;

  if (text[0] === '.') {
    return getPossibilities2(text.slice(1), groups);
  }

  if (text[0] === '#') {
    const [group, ...next] = groups;
    for (let i = 0; i < group; i++) {
      if (text[i] === '.') return 0;
    }
    if (text[group] === '#') return 0;
    return getPossibilities2(text.slice(group + 1), next);
  }
  return getPossibilities2('#' + text.slice(1), groups) + getPossibilities2('.' + text.slice(1), groups);
});

const reCache = new Map<number, RegExp>();
function createRe(count: number) {
  if (reCache.has(count)) {
    return reCache.get(count);
  }
  const re = new RegExp(`^\\.*#{${count}}(?:\\.|$)`);
  reCache.set(count, re);
  return re;
}

function* getPossibilities(row: string, evaluator: RegExp) {
  const indexes = row
    .split('')
    .map((c, i) => (c === '?' ? i : -1))
    .filter(x => x !== -1);

  const replacements = range(0, Math.pow(2, indexes.length) - 1).map(d =>
    d.toString(2).padStart(indexes.length, '0').replace(/0/g, '.').replace(/1/g, '#'),
  );
  log(replacements);
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
