import { byLine, log } from '../../utils';
type Input = ReturnType<typeof parse>;

export const parse = (text: string) => {
  const sections = text.split('\n\n');
  const inputs = sections[0].split('\n').map(line => {
    const parts = line.split(':');
    return { name: parts[0], value: parseInt(parts[1]) };
  });

  const operations = sections[1].split('\n').map(line => {
    const parts = line.split(' ');
    return {
      left: parts[0],
      op: parts[1] as 'AND' | 'OR' | 'XOR',
      right: parts[2],
      target: parts[4],
    };
  });

  return {
    inputs,
    operations,
  };
};

export function part1(input: Input) {
  log('input', input);

  const values = Object.create(null);
  input.inputs.forEach(i => {
    values[i.name] = i.value;
  });

  const outputs = input.operations
    .filter(o => o.target.startsWith('z'))
    .map(o => {
      return {
        name: o.target,
        value: process(o, values, input.operations),
      };
    })
    .sort((l, r) => l.name.localeCompare(r.name));

  const ret = outputs.reduceRight((acc, cur) => {
    return acc + String(cur.value);
  }, '');

  log(getDigits('x', values));
  log(getDigits('y', values));
  log('------------------------');
  log(ret);

  return parseInt(ret, 2);
}

function getDigits(prefix: string, registry: Record<string, number>) {
  return Object.keys(registry)
    .filter(k => k.startsWith(prefix))
    .sort((l, r) => l.localeCompare(r))
    .reduce((acc, cur) => {
      return acc + String(registry[cur]);
    }, '');
}

function process(
  op: Input['operations'][number] | number,
  registers: Record<string, number>,
  all: Input['operations'],
) {
  if (typeof op === 'number') return op;

  if (op.target in registers) {
    return registers[op.target];
  }

  const left = process(all.find(o => o.target === op.left) ?? registers[op.left], registers, all);
  const right = process(all.find(o => o.target === op.right) ?? registers[op.right], registers, all);

  const value = calc(left, op.op, right);
  registers[op.target] = value;
  return value;
}

function calc(left: number, op: Input['operations'][number]['op'], right: number) {
  switch (op) {
    case 'AND':
      return left & right;
    case 'OR':
      return left | right;
    case 'XOR':
      return left ^ right;
  }
}

// figure out which bits are wrong in the output and work backwards from there

export function part2(input: Input) {
  log('input', input);

  const values = Object.create(null);
  input.inputs.forEach(i => {
    values[i.name] = i.value;
  });

  const outputs = input.operations
    .filter(o => o.target.startsWith('z'))
    .map(o => {
      return {
        name: o.target,
        value: process(o, values, input.operations),
      };
    })
    .sort((l, r) => l.name.localeCompare(r.name));

  const ret = outputs.reduceRight((acc, cur) => {
    return acc + String(cur.value);
  }, '');

  log(getDigits('x', values));
  log(getDigits('y', values));
  log('------------------------');
  log(ret);

  return parseInt(ret, 2);
}
