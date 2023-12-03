import { log, byLine, aoc } from '../../utils';

const GEM_RE = /(\d+) ([a-z]+)/i;

type RGB = { red?: number; green?: number; blue?: number };

type Input = ReturnType<typeof parse>;
export const parse = byLine(line => {
  const lineParts = line.split(':').map(x => x.trim());
  const game = parseInt(lineParts[0].slice(5));

  const roundsText = lineParts[1].split(';');
  const rounds: RGB[] = [];
  for (const roundText of roundsText) {
    const parts = roundText.split(',');
    rounds.push(
      parts.reduce((acc, x) => {
        const m = GEM_RE.exec(x);
        acc[m[2]] = parseInt(m[1]);
        return acc;
      }, {} as RGB),
    );
  }
  return {
    game,
    rounds,
  };
});

export function part1(input: Input) {
  const MAX_RED = 12;
  const MAX_GREEN = 13;
  const MAX_BLUE = 14;

  const possible = input.reduce((acc, game) => {
    const isInvalid = game.rounds.some(x => {
      return x.red > MAX_RED || x.green > MAX_GREEN || x.blue > MAX_BLUE;
    });

    if (!isInvalid) {
      log('valid', game.game);
      acc += game.game;
    }

    return acc;
  }, 0);

  return possible;
}

export function part2(input: Input) {
  const sumOfPower = input.reduce((acc, game) => {
    const lowest = game.rounds.reduce(
      (gem, r) => {
        gem.red = Math.max(gem.red, r.red ?? 0);
        gem.green = Math.max(gem.green, r.green ?? 0);
        gem.blue = Math.max(gem.blue, r.blue ?? 0);
        return gem;
      },
      { red: 0, green: 0, blue: 0 },
    );
    const power = lowest.red * lowest.green * lowest.blue;
    log(game.game, power);
    acc += power;
    return acc;
  }, 0);

  return sumOfPower;
}

export default aoc(
  byLine(line => {
    const lineParts = line.split(':').map(x => x.trim());
    const game = parseInt(lineParts[0].slice(5));

    const roundsText = lineParts[1].split(';');
    const rounds: RGB[] = [];
    for (const roundText of roundsText) {
      const parts = roundText.split(',');
      rounds.push(
        parts.reduce((acc, x) => {
          const m = GEM_RE.exec(x);
          acc[m[2]] = parseInt(m[1]);
          return acc;
        }, {} as RGB),
      );
    }
    return {
      game,
      rounds,
    };
  }),
).with({
  part1(input) {
    const MAX_RED = 12;
    const MAX_GREEN = 13;
    const MAX_BLUE = 14;

    const possible = input.reduce((acc, game) => {
      const isInvalid = game.rounds.some(x => {
        return x.red > MAX_RED || x.green > MAX_GREEN || x.blue > MAX_BLUE;
      });

      if (!isInvalid) {
        log('valid', game.game);
        acc += game.game;
      }

      return acc;
    }, 0);

    return possible;
  },

  part2(input) {
    const sumOfPower = input.reduce((acc, game) => {
      const lowest = game.rounds.reduce(
        (gem, r) => {
          gem.red = Math.max(gem.red, r.red ?? 0);
          gem.green = Math.max(gem.green, r.green ?? 0);
          gem.blue = Math.max(gem.blue, r.blue ?? 0);
          return gem;
        },
        { red: 0, green: 0, blue: 0 },
      );
      const power = lowest.red * lowest.green * lowest.blue;
      log(game.game, power);
      acc += power;
      return acc;
    }, 0);

    return sumOfPower;
  },
});
