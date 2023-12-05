import { byLine, bySection, log, minOf, range } from '../../utils';
type Input = ReturnType<typeof parse>;

export const parse = text => {
  const [seedChunk, ...mapChunks] = bySection()(text);

  const seeds = seedChunk
    .slice(7)
    .split(' ')
    .map(x => parseInt(x));

  const chunks = mapChunks.map(chunk => {
    const [title, ...rangeLines] = chunk.split('\n');

    const [from, to] = title.slice(0, -5).split('-to-');

    const ranges = rangeLines.map(x => {
      const nums = x.split(' ').map(y => parseInt(y));
      return {
        destinationStart: nums[0],
        sourceStart: nums[1],
        length: nums[2],
      };
    });

    return {
      source: from,
      dest: to,
      ranges,
    };
  });

  return {
    seeds,
    chunks,
  };
};

type Chunk = Input['chunks'][number];
type Range = Chunk['ranges'][number];

export function part1(input: Input) {
  log('input', input);

  const allPositions = input.seeds.map(x => fullLookup(x, input));

  return minOf(allPositions);
}

export function part2(input: Input) {
  let min = Number.MAX_SAFE_INTEGER;

  const chunks = input.seeds.length / 2 - 1;

  for (let group of range(0, chunks)) {
    log('starting', group);
    for (const seed of rangeIterator(input.seeds[group * 2], input.seeds[group * 2 + 1])) {
      const value = fullLookup(seed, input);
      if (value < min) {
        min = value;
      }
    }
  }

  return min;
}

function* rangeIterator(from: number, length: number) {
  for (let i = 0; i < length; i++) {
    yield from + i;
  }
}

function fullLookup(initialValue: number, input: Input) {
  let value = initialValue;
  for (const chunk of input.chunks) {
    value = lookup(value, chunk);
  }
  return value;
}

function lookup(value: number, chunk: Chunk) {
  for (const r of chunk.ranges) {
    if (r.sourceStart <= value && value <= r.sourceStart + r.length) {
      return r.destinationStart + (value - r.sourceStart);
    }
  }

  return value;
}
