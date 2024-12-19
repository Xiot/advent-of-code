import { byLine, log } from '../../utils';
type Input = ReturnType<typeof parse>;

export const parse = (text: string) => {
  const sections = text.split('\n\n');
  return {
    towels: sections[0].split(', '),
    patterns: sections[1].split('\n'),
  };
};

export function part1(input: Input) {
  log('input', input);

  const RE = new RegExp(`^(${input.towels.join('|')})+$`);

  let count = 0;
  for (const pattern of input.patterns) {
    if (RE.test(pattern)) {
      log(pattern);
      count++;
    }
  }
  return count;
}

export function part2(input: Input) {
  let sum = 0;
  for (const pattern of input.patterns) {
    const ret = towelDesign(pattern, input.towels, [], {});
    sum += ret;
  }
  return sum;
}

function towelDesign(pattern: string, towels: string[], prev: string[], cache: Record<string, number>) {
  if (cache[pattern] != null) {
    return cache[pattern];
  }

  const available = towels.filter(t => pattern.startsWith(t));

  let possible = 0;

  for (const t of available) {
    const rem = pattern.slice(t.length);

    const o = [...prev, t];

    if (rem === '') {
      possible += 1;
    } else {
      const ret = towelDesign(rem, towels, o, cache);
      cache[rem] = ret;
      possible += ret;
    }
  }

  return possible;
}
