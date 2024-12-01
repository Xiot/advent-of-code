import { byLine, createBucketMap, log, maybeNumber, sumOf } from '../../utils';
type Input = ReturnType<typeof parse>;

export const parse = byLine(line => line.split(' ').filter(Boolean).map(maybeNumber) as [number, number]);

export function part1(input: Input) {
  const left = input.map(x => x[0]).sort((l, r) => l - r);
  const right = input.map(x => x[1]).sort((l, r) => l - r);
  const diff = left.map((x, i) => Math.abs(right[i] - left[i]));

  const sum = sumOf(diff);

  return sum;
}

export function part2(input: Input) {
  const leftList = input.map(x => x[0]).sort((l, r) => l - r) as number[];
  const rightList = input.map(x => x[1]).sort((l, r) => l - r) as number[];

  const totals = leftList.reduce((acc, num) => {
    const count = rightList.filter(x => x === num).length;
    return acc + num * count;
  }, 0);

  return totals;
}
