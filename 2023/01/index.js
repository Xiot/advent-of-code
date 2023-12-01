import { byLine } from '../../utils';

export const parse = byLine(line => line);

export function part1(lines) {
  const input = lines.map(x => x.split(''));
  let sum = 0;
  for (const line of input) {
    let numbers = '';
    for (let i = 0; i < line.length; i++) {
      const num = parseInt(line[i]);
      if (isNaN(num)) continue;
      numbers += line[i];
      break;
    }
    for (let i = line.length - 1; i >= 0; i--) {
      const num = parseInt(line[i]);
      if (isNaN(num)) continue;
      numbers += line[i];
      break;
    }
    console.log(numbers);
    sum += parseInt(numbers);
  }
  return sum;
}

export function part2(lines) {
  let sum = 0;
  for (const line of lines) {
    let digits = '';
    console.log('line');
    for (let i = 0; i < line.length; i++) {
      const n = matchesNumber(line, i);
      if (n === undefined) continue;
      digits += String(n);
      break;
    }

    for (let i = line.length - 1; i >= 0; i--) {
      const n = matchesNumber(line, i);
      if (n === undefined) continue;
      digits += String(n);
      break;
    }
    console.log('line', line, digits);
    sum += parseInt(digits);
  }
  return sum;
}

const TO_NUMBER = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
};

function matchesNumber(text, i) {
  const n = Object.keys(TO_NUMBER).find(key => {
    const section = text.slice(i, i + key.length);
    if (section !== key) return false;
    const num = TO_NUMBER[section];
    console.log('key', key, i, i + key.length, section, num);
    if (num === undefined) return false;
    return true;
  });
  return TO_NUMBER[n];
}
