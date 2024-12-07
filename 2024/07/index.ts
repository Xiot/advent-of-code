import { byLine, log } from '../../utils';
type Input = ReturnType<typeof parse>;

export const parse = byLine(line => {
  const sides = line.split(':');
  const values = sides[1]
    .trim()
    .split(' ')
    .map(x => parseInt(x.trim()));
  return {
    raw: line,
    test: parseInt(sides[0]),
    values,
  };
});

export function part1(input: Input) {
  let sum = 0;
  for (const line of input) {
    const ret = evaluate(line.values, 1, line.values[0], line.test, []);

    console.log(line.raw);
    console.log('  ', ret === false ? 'no solution' : ret.ops.join(' '));

    sum += ret === false ? 0 : line.test;
  }
  return sum;
}

export function part2(input: Input) {
  let sum = 0;
  for (const line of input) {
    const ret = evaluate2(line.values, 1, line.values[0], line.test, []);

    console.log(line.raw);
    console.log('  ', ret === false ? 'no solution' : ret.ops.join(' '));

    sum += ret === false ? 0 : line.test;
  }
  return sum;
}

type Result = false | { value: number; ops: string[] };
function evaluate(values: number[], index: number, value: number, target: number, ops: string[]): Result {
  let canAdd = true;
  let canMul = true;

  if (index >= values.length) return false;

  const sumValue = value + values[index];
  if (sumValue > target) {
    canAdd = false;
  }

  const mulValue = value * values[index];
  if (mulValue > target) {
    canMul = false;
  }

  if (!canAdd && !canMul) return false;

  if (index === values.length - 1) {
    if (sumValue === target) {
      return { value: sumValue, ops: [...ops, '+'] };
    }

    if (mulValue === target) {
      return { value: mulValue, ops: [...ops, '*'] };
    }
  }

  const sumRecursive = evaluate(values, index + 1, sumValue, target, [...ops, '+']);
  if (sumRecursive !== false) {
    return sumRecursive;
  }

  const mulRecursive = evaluate(values, index + 1, mulValue, target, [...ops, '*']);
  if (mulRecursive !== false) {
    return mulRecursive;
  }

  return false;
}

function evaluate2(values: number[], index: number, value: number, target: number, ops: string[]): Result {
  let canAdd = true;
  let canMul = true;
  let canConcat = true;

  if (index >= values.length) return false;

  const sumValue = value + values[index];
  if (sumValue > target) {
    canAdd = false;
  }

  const mulValue = value * values[index];
  if (mulValue > target) {
    canMul = false;
  }
  const concatValue = parseInt(String(value) + String(values[index]));
  if (concatValue > target) {
    canConcat = false;
  }

  if (!canAdd && !canMul && !canConcat) return false;

  if (index === values.length - 1) {
    if (sumValue === target) {
      return { value: sumValue, ops: [...ops, '+'] };
    }

    if (mulValue === target) {
      return { value: mulValue, ops: [...ops, '*'] };
    }

    if (concatValue === target) {
      return { value: concatValue, ops: [...ops, '||'] };
    }
  }

  if (canAdd) {
    const sumRecursive = evaluate2(values, index + 1, sumValue, target, [...ops, '+']);
    if (sumRecursive !== false) {
      return sumRecursive;
    }
  }

  if (canMul) {
    const mulRecursive = evaluate2(values, index + 1, mulValue, target, [...ops, '*']);
    if (mulRecursive !== false) {
      return mulRecursive;
    }
  }

  if (canConcat) {
    const concatRecursive = evaluate2(values, index + 1, concatValue, target, [...ops, '||']);
    if (concatRecursive !== false) {
      return concatRecursive;
    }
  }

  return false;
}
