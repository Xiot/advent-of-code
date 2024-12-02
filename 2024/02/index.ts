import { byLine, log, maybeNumber } from '../../utils';
type Input = ReturnType<typeof parse>;

export const parse = byLine(line => line.split(' ').map(x => parseInt(x)));

function isSafe(report: Input[number]) {
  const mode = report[0] < report[1] ? 'inc' : 'dec';
  for (let i = 0; i < report.length - 1; i++) {
    const l = report[i];
    const r = report[i + 1];
    const diff = Math.abs(l - r);
    if (diff === 0 || diff > 3) return false;

    if (mode === 'inc' && r < l) return false;
    if (mode === 'dec' && l < r) return false;
  }
  return true;
}

function isSafe2(report: Input[number]) {
  const mode = report[0] < report[1] ? 'inc' : 'dec';
  for (let i = 0; i < report.length - 1; i++) {
    const l = report[i];
    const r = report[i + 1];
    const diff = Math.abs(l - r);
    if (diff === 0 || diff > 3) return false;

    if (mode === 'inc' && r < l) return false;
    if (mode === 'dec' && l < r) return false;
  }
  return true;
}

export function part1(input: Input) {
  log('input', input);
  let count = 0;
  for (let i = 0; i < input.length; i++) {
    const safe = isSafe(input[i]);
    if (safe) count++;
  }
  return count;
}

export function part2(input: Input) {
  let count = 0;
  for (let i = 0; i < input.length; i++) {
    const initial = isSafe(input[i]);
    if (initial === true) {
      count++;
      continue;
    }

    for (let j = 0; j < input[i].length; j++) {
      const attempt = [...input[i]];
      attempt.splice(j, 1);

      console.log('attempt', attempt);
      const safe = isSafe(attempt);
      if (safe) {
        count++;
        break;
      }
    }
  }
  return count;
}
