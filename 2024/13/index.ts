import { byLine, bySection, gcd, lcm, log, sumOf } from '../../utils';
type Input = ReturnType<typeof parse>;

const NUMBER_RE = /\d+/g;

export const parse = (text: string) => {
  const sections = text.split('\n\n');
  return sections.map(s => {
    const lines = s.split('\n');

    const a = lines[0].split(':')[1].matchAll(NUMBER_RE).toArray();
    const b = lines[1].split(':')[1].matchAll(NUMBER_RE).toArray();
    const p = lines[2].split(':')[1].matchAll(NUMBER_RE).toArray();
    return {
      buttonA: { cost: 3, x: parseInt(a[0][0]), y: parseInt(a[1][0]) },
      buttonB: { cost: 1, x: parseInt(b[0][0]), y: parseInt(b[1][0]) },
      prize: {
        x: parseInt(p[0][0]),
        y: parseInt(p[1][0]),
      },
    };
  });
};

type Game = Input[number];

export function part1(input: Input) {
  let sum = 0;
  for (let i = 0; i < input.length; i++) {
    const ret = costOf(input[i]);
    log(i, ret);
    sum += ret?.cost ?? 0;
  }

  return sum;
}

export function part2(input: Input) {
  input.forEach(g => {
    g.prize.x += 10000000000000;
    g.prize.y += 10000000000000;
  });
  console.log('games', input.length);
  let sum = 0;
  let i = 0;

  for (const game of input) {
    const ret = solveGame(game);

    i++;
    if (ret == null) continue;
    sum += ret.cost;
    log(i - 1, ret.buttonA.presses, ret.buttonB.presses);
  }
  return sum;
}

function solveGame(game: Game): Result {
  const num = game.buttonA.x * game.prize.y - game.buttonA.y * game.prize.x;
  const dem = game.buttonA.x * game.buttonB.y - game.buttonA.y * game.buttonB.x;
  const bPresses = num / dem;

  const aPresses = (game.prize.x - game.buttonB.x * bPresses) / game.buttonA.x;

  if (Math.trunc(aPresses) !== aPresses) return null;
  if (Math.trunc(bPresses) !== bPresses) return null;

  return {
    buttonA: {
      presses: aPresses,
    },
    buttonB: {
      presses: bPresses,
    },
    cost: aPresses * game.buttonA.cost + bPresses * game.buttonB.cost,
  };
}

type Result = {
  buttonA: {
    presses: number;
  };
  buttonB: {
    presses: number;
  };
  cost: number;
};

function costOf(game: Game): Result | null {
  let min = null;
  for (let i = 1; i <= 100; i++) {
    let sumA = game.buttonA.x * i;
    let rem = game.prize.x - sumA;

    if (rem < 0) break;
    let isDivisible = rem % game.buttonB.x === 0;

    if (!isDivisible) continue;

    const bPresses = rem / game.buttonB.x;
    if (bPresses > 100) continue;

    const yLinesUp = i * game.buttonA.y + bPresses * game.buttonB.y === game.prize.y;
    if (!yLinesUp) continue;

    const ret = {
      buttonA: {
        presses: i,
      },
      buttonB: {
        presses: bPresses,
      },
      cost: i * game.buttonA.cost + bPresses * game.buttonB.cost,
    };

    if (min == null || min.cost > ret.cost) {
      min = ret;
    }
  }

  return min;
}
