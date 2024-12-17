import { groupBy } from 'lodash';
import { byLine, createBounds, createGridMap, log, maxOf, sumOf, visualizeGrid, waitForKey } from '../../utils';
import * as fs from 'node:fs';
import * as path from 'node:path';

type Input = ReturnType<typeof parse>;

const LINE_RE = /-?\d+/g;

export const parse = (text: string) => {
  const lines = text.split('\n');
  return lines.map(line => {
    const parts = line
      .matchAll(LINE_RE)
      .toArray()
      .map(x => parseInt(x[0]));
    return {
      pos: { x: parts[0], y: parts[1] },
      velocity: { x: parts[2], y: parts[3] },
    };
  });
};

export function part1(input: Input) {
  log('input', input);

  const grid = createGridMap('.');
  grid.set(100, 100, '.');
  grid.markOnGet = false;

  // let blank = grid.clone()
  // for(const bot of input) {
  // }
  const WIDTH = global.args.isSample ? 11 : 101;
  const HEIGHT = global.args.isSample ? 7 : 103;

  const STEPS = 100;

  const final = input.map(b => {
    const pos = {
      x: wrap(b.pos.x, b.velocity.x, WIDTH, STEPS),
      y: wrap(b.pos.y, b.velocity.y, HEIGHT, STEPS),
    };

    const mid = {
      x: Math.trunc(WIDTH / 2),
      y: Math.trunc(HEIGHT / 2),
    };

    const quad = {
      x: pos.x === mid.x ? null : pos.x < mid.x ? 0 : 1,
      y: pos.y === mid.y ? null : pos.y < mid.y ? 0 : 1,
    };
    const quadIndex =
      quad.x === null || quad.y == null
        ? null
        : quad.x === 0 && quad.y === 0
        ? 0
        : quad.x === 1 && quad.y === 0
        ? 1
        : quad.x === 0 && quad.y === 1
        ? 2
        : quad.x === 1 && quad.y === 1
        ? 3
        : -1;

    return {
      pos,
      quad,
      quadIndex,
    };
  });

  log(final);
  const grouped = groupBy(
    final.filter(x => x.quadIndex != null),
    x => x.quadIndex,
  );
  log(grouped);

  const counted = Object.keys(grouped).map(key => ({ index: key, count: grouped[key].length }));
  log(counted);
  return counted.reduce((acc, cur) => {
    return acc * cur.count;
  }, 1);
}

function wrap(pos: number, vel: number, size: number, steps: number) {
  if (vel > 0) {
    return (pos + vel * steps) % size;
  }

  if (vel < 0) {
    const w = pos + vel * steps;
    if (w > 0) return pos % size;
    return (w + size * steps) % size;
  }

  return pos;
}

export function part2(input: Input) {
  // log('input', input);

  const WIDTH = global.args.isSample ? 11 : 101;
  const HEIGHT = global.args.isSample ? 7 : 103;

  const blank = createGridMap('.');
  blank.set(WIDTH - 1, HEIGHT - 1, '.');
  blank.markOnGet = false;

  let i = 0;
  let m = 0;
  while (true) {
    if (i > 10403) break;
    const grid = blank.clone();

    const bots = input.map(bot => {
      return {
        pos: {
          x: wrap(bot.pos.x, bot.velocity.x, WIDTH, i),
          y: wrap(bot.pos.y, bot.velocity.y, HEIGHT, i),
        },
      };
    });

    i++;
    bots.forEach(bot => {
      // bot.pos.x = wrap(bot.pos.x, bot.velocity.x, WIDTH, 1);
      // bot.pos.y = wrap(bot.pos.y, bot.velocity.y, HEIGHT, 1);

      grid.set(bot.pos.x, bot.pos.y, 'B');
    });

    // log(i);
    // log('------------------');

    const w = groupBy(bots, x => x.pos.y);
    const allBottom = maxOf(
      Object.keys(w).map(g => w[g].length),
      x => x,
    );

    // const allBottom = input.filter(b => b.pos.x === Math.trunc(WIDTH / 2)).length;
    log(i, allBottom);
    if (allBottom > m) {
      m = allBottom;
    }
    // if (allBottom > m) {
    //   m = allBottom;
    // }
    // if (allBottom === 19 || i === 99786) {
    if (m === 20) {
      const output = visualizeGrid(grid);
      fs.writeFileSync(path.join(__dirname, 'output', `${String(i).padStart(5, '0')}.log`), output, 'utf-8');
      // log(output);
    }

    // const output = visualizeGrid(grid);

    // fs.writeFileSync(path.join(__dirname, 'output', `${String(i).padStart(5, '0')}.log`), output, 'utf-8');
    // log(output);

    // log('waiting');
    // // await waitForKey();
    // log('got key');
  }
  return m;
}
