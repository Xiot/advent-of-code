import { byLine, log, maxOf } from '../../utils';
type Input = ReturnType<typeof parse>;

export const parse = (text: string) => {
  return text.split('\n').map(x => BigInt(parseInt(x)));
};

export function part1(input: Input) {
  log('input', input);

  let sum = 0n;
  for (let m = 0; m < input.length; m++) {
    let num = input[m];
    for (let i = 0; i < 2000; i++) {
      num = next(num);
    }
    log(m, num);
    sum += num;
  }
  return sum;
}

// 2045 - low
export function part2(input: Input) {
  function hash(seq: Entry[], index: number) {
    return [seq[index - 3].change, seq[index - 2].change, seq[index - 1].change, seq[index - 0].change].join(',');
  }

  const monkeys = input.map(m => {
    const sequence = generateSequence(m);
    const cache = new Map<string, bigint>();
    for (let i = 3; i < sequence.length; i++) {
      const key = hash(sequence, i);
      if (!cache.has(key)) cache.set(key, sequence[i].price);
    }
    return {
      sequence,
      cache,
    };
  });

  const merged = monkeys.reduce((acc, m) => {
    m.cache.entries().forEach(([key, price]) => {
      acc.set(key, (acc.get(key) ?? 0n) + price);
    });

    return acc;
  }, new Map<string, bigint>());

  const most = maxOf(merged.values().toArray(), x => Number(x));

  return most;
}

type Entry = {
  value: bigint;
  price: bigint;
  change: bigint;
};

function generateSequence(initialValue: bigint): Entry[] {
  let last = { value: initialValue, price: initialValue % 10n, change: 0n };
  const seq = [last];
  for (let i = 1; i < 2000; i++) {
    const value = next(last.value);
    const price = value % 10n;
    const change = price - last.price;
    const entry = {
      value,
      price,
      change,
    };
    seq.push(entry);
    last = entry;
  }
  return seq;
}

function next(secret: bigint) {
  const first = mixAndPrune(secret, v => v * 64n);
  const second = mixAndPrune(first, v => v / 32n);
  const final = mixAndPrune(second, v => v * 2048n);
  return final;
}

function mixAndPrune(value: bigint, op: (v: bigint) => bigint) {
  const l = op(value);
  const r = value;
  const x = l ^ r;
  return x & 0b111111111111111111111111n; //% 16777216n;
}
