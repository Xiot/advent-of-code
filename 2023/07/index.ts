import { byLine, log } from '../../utils';
type Input = ReturnType<typeof parse>;

const CARDS_1 = 'AKQJT98765432';
const CARDS_2 = 'AKQT98765432J';

const PART = parseInt(process.env.PART);

const CARDS = PART === 1 ? CARDS_1 : CARDS_2;

export const parse = byLine(line => {
  const parts = line.split(' ');
  return {
    ...processHand(parts[0]),
    bid: parseInt(parts[1]),
  };
});

export function part1(input: Input) {
  const sorted = input.sort(byRank);

  let points = 0;
  for (let i = 0; i < sorted.length; i++) {
    points += (i + 1) * sorted[i].bid;
  }
  return points;
}

export function part2(input: Input) {
  const sorted = input.sort(byRank);

  let points = 0;
  for (let i = 0; i < input.length; i++) {
    points += (i + 1) * input[i].bid;
  }
  return points;
}

function byRank(l: Hand, r: Hand) {
  if (l.kind !== r.kind) {
    return -(l.kind - r.kind);
  }
  for (let i = 0; i < 5; i++) {
    const lc = CARDS.indexOf(l.hand[i]);
    const rc = CARDS.indexOf(r.hand[i]);
    if (lc === rc) continue;
    return -(lc - rc);
  }
  return 0;
}

function processHand(hand: string) {
  const cards = new Map<string, number>();
  hand.split('').forEach(c => {
    cards.set(c, (cards.get(c) ?? 0) + 1);
  });

  const kind = getHandType(cards);

  return {
    hand,
    handMap: cards,
    kind,
  };
}
type Hand = ReturnType<typeof processHand>;

function getHandType(hand: HandMap) {
  if (PART === 1) return evaluateHand(hand);

  const jokers = hand.get('J') ?? 0;
  if (jokers === 0) return evaluateHand(hand);

  let min = 8;
  for (let i = 0; i < CARDS.length; i++) {
    const clone = new Map(hand);
    clone.delete('J');
    const card = CARDS[i];
    clone.set(card, (clone.get(card) ?? 0) + jokers);

    const kind = evaluateHand(clone);
    if (kind < min) {
      min = kind;
    }
  }
  return min;
}

function evaluateHand(hand: HandMap) {
  if (isFiveOfAKind(hand)) return 1;
  if (isFourOfAKind(hand)) return 2;
  if (isFullHouse(hand)) return 3;
  if (isThreeOfAKind(hand)) return 4;
  if (isTwoPair(hand)) return 5;
  if (isOnePair(hand)) return 6;
  return 7;
}

type HandMap = Map<string, number>;

function isFiveOfAKind(hand: HandMap) {
  return Array.from(hand.values()).includes(5);
}

function isFourOfAKind(hand: HandMap) {
  return Array.from(hand.values()).includes(4);
}

function isFullHouse(hand: HandMap) {
  const values = Array.from(hand.values());
  return values.includes(3) && values.includes(2);
}

function isThreeOfAKind(hand: HandMap) {
  return Array.from(hand.values()).includes(3);
}

function isTwoPair(hand: HandMap) {
  const values = Array.from(hand.values());
  const sum = values.reduce((acc, cur) => {
    if (cur === 2) acc += 1;
    return acc;
  }, 0);
  return sum === 2;
}

function isOnePair(hand: HandMap) {
  return Array.from(hand.values()).includes(2);
}
