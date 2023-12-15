import { byLine, createBucketMap, log, range, toCharCode } from '../../utils';
type Input = ReturnType<typeof parse>;

export const parse = (text: string) => text.split(',');

export function part1(input: Input) {
  log('input', input);

  let sum = 0;
  for (let i = 0; i < input.length; i++) {
    sum += hash(input[i]);
  }
  return sum;
}

function hash(text: string) {
  let current = 0;
  for (let c = 0; c < text.length; c++) {
    const code = toCharCode(text[c]);
    current += code;
    current *= 17;
    current = current % 256;
  }
  return current;
}

const RE = /^(.+)([=-])(.*)$/;
export function part2(input: Input) {
  const ops = input.map(x => {
    const [, label, op, valueText] = RE.exec(x);
    return {
      label,
      op,
      value: op === '=' ? parseInt(valueText) : null,
      hash: hash(label),
    };
  });
  // log(ops);
  type Item = typeof ops extends Array<infer T> ? T : number;
  // const boxes = range(0, 255).map((x, i) => i);
  // log(boxes);
  // const boxes = createBucketMap<Item>(x => String(x.hash));
  // const b

  const boxes: Item[][] = range(0, 255).map(() => []);
  for (const op of ops) {
    if (op.op === '-') {
      boxes[op.hash] = boxes[op.hash].filter(x => x.label !== op.label);
    } else if (op.op === '=') {
      const idx = boxes[op.hash].findIndex(x => x.label === op.label);
      if (idx === -1) {
        boxes[op.hash].push(op);
      } else {
        boxes[op.hash][idx] = op;
      }
    }
    log(`\nSTEP ${op.label}`);

    boxes.forEach((x, i) => {
      if (x.length === 0) return;
      log(i, x);
    });
  }

  log(`\nFINAL`);

  boxes.forEach((x, i) => {
    if (x.length === 0) return;
    log(i, x);
  });

  const result = boxes.reduce((acc, cur, boxIndex) => {
    if (cur.length === 0) return acc;
    let value = 0;
    for (let i = 0; i < cur.length; i++) {
      value += (1 + boxIndex) * (1 + i) * cur[i].value;
    }
    return acc + value;
  }, 0);
  return result;
}
