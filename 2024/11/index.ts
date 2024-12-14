import { byLine, log } from '../../utils';
type Input = ReturnType<typeof parse>;

export const parse = (text: string) => text.split(' ').map(x => parseInt(x));

export function part1(input: Input) {
  let line = [...input];
  const BLINKS = 75;

  for (let blink = 0; blink < BLINKS; blink++) {
    const blinkLine = [];
    for (let i = 0; i < line.length; i++) {
      if (line[i] === 0) {
        blinkLine.push(1);
      } else if (String(line[i]).length % 2 === 0) {
        const t = String(line[i]);
        const l = t.length / 2;
        blinkLine.push(parseInt(t.slice(0, l)), parseInt(t.slice(l)));
      } else {
        blinkLine.push(line[i] * 2024);
      }
    }
    line = blinkLine;
  }
  return line.length;
}

export function part2(input: Input) {
  const cache = new Map<string, number>();

  const keyOf = (num: number, rem: number) => `${num}|${rem}`;
  function transformTimes(num: number, rem: number) {
    if (rem === 0) return 1;

    if (cache.has(keyOf(num, rem))) {
      return cache.get(keyOf(num, rem));
    }

    let sum = 0;
    const newValues = transform(num);
    for (let i = 0; i < newValues.length; i++) {
      const v = transformTimes(newValues[i], rem - 1);
      sum += v;
    }

    cache.set(keyOf(num, rem), sum);
    return sum;
  }

  const BLINKS = 75;
  let count = 0;
  for (let i = 0; i < input.length; i++) {
    count += transformTimes(input[i], BLINKS);
  }

  return count;
}

function transform(num: number) {
  if (num === 0) {
    return [1];
  } else if (String(num).length % 2 === 0) {
    const t = String(num);
    const l = t.length / 2;
    return [parseInt(t.slice(0, l)), parseInt(t.slice(l))];
  } else {
    return [num * 2024];
  }
}
