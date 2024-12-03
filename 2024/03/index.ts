import { byLine, log } from '../../utils';
type Input = ReturnType<typeof parse>;

export const parse = byLine(line => line);

export function part1(input: Input) {
  log('input', input);

  const RE = /mul\((\d+),(\d+)\)/g;
  let sum = 0;
  for (let line of input) {
    const matches = Array.from(line.matchAll(RE));

    for (let m of matches) {
      const l = parseInt(m[1]);
      const r = parseInt(m[2]);
      sum += l * r;
    }
  }
  return sum;
}

export function part2(input: Input) {
  const RE = /(mul\((\d+),(\d+)\))|(do\(\))|(don't\(\))/g;
  let sum = 0;

  let valid = true;
  for (let line of input) {
    const matches = Array.from(line.matchAll(RE));

    for (let m of matches) {
      if (m[0] === 'do()') {
        valid = true;
      } else if (m[0] === "don't()") {
        valid = false;
      } else if (valid) {
        console.log('m', m[1]);
        const l = parseInt(m[2]);
        const r = parseInt(m[3]);
        sum += l * r;
      }
    }
  }
  return sum;
}
