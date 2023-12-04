import { byLine, log, range, sumOf } from '../../utils';
type Input = ReturnType<typeof parse>;

const PARSE_RE = /Card\s*(\d+): ([^\|]+)\| (.+)/;
export const parse = byLine(line => {
  const [, card, winning, values] = PARSE_RE.exec(line);

  return {
    card: parseInt(card),
    winning: winning
      .split(' ')
      .filter(x => x)
      .map(x => parseInt(x))
      .sort(),
    values: values
      .split(' ')
      .filter(x => x)
      .map(x => parseInt(x))
      .sort(),
  };
});

export function part1(cards: Input) {
  let sum = 0;
  for (let card of cards) {
    const points = countPoints(card);
    sum += points;
  }
  return sum;
}

export function part2(cards: Input) {
  const basePoints = cards.map(x => countWins(x));
  let multipliers = new Array(cards.length).fill(0);

  basePoints.forEach((x, i) => {
    if (x.wins === 0) return;
    range(1, x.wins).forEach(y => {
      multipliers[y + i] += multipliers[i] + 1;
    });
  });
  const totalCards = cards.length + sumOf(multipliers);
  return totalCards;
}

function countWins(card: Input[0]) {
  let wins = 0;
  let points = 0;
  for (let w of card.winning) {
    const found = card.values.includes(w);
    if (!found) continue;
    wins++;
    if (points === 0) {
      points = 1;
    } else {
      points *= 2;
    }
  }
  return { card: card.card, wins, points };
}

function countPoints(card: Input[0]) {
  let points = 0;

  for (let w of card.winning) {
    const found = card.values.includes(w);
    if (!found) continue;

    if (points === 0) {
      points = 1;
    } else {
      points *= 2;
    }
  }

  return points;
}
