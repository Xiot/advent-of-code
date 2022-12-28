
import { autoParse, log, byLine } from "../../utils";

export const parse = byLine(line => parseInt(/\d+/.exec(line)[0]));

export function part1(input) {
  log('input', input);

  const genA = createGenerator(16807, input[0]);
  const genB = createGenerator(48271, input[1]);

  let match = 0;
  for(let i = 0; i < 40_000_000; i++) {
    const a = genA.next16();
    const b = genB.next16();
    if (a === b) {
      match ++;
    }
  }
  return match;
}

export function part2(input) {

  const genA = createGenerator(16807, input[0], 4);
  const genB = createGenerator(48271, input[1], 8);

  let match = 0;
  for(let i = 0; i < 5_000_000; i++) {
    const a = genA.next16();
    const b = genB.next16();    
    if (a === b) {
      match ++;
    }    
  }
  return match;
}    

function bin(value) {
  return value.toString(2);
}

function bin32(value) {
  return bin(value).padStart(32, '0');
}
function lowest16(value) {
  return bin(value & 0xFFFF).padStart(16, '0');
}

function createGenerator(factor, initialValue, mul = 1) {

  let prev = initialValue;
  const MOD = 2147483647;

  return {
    next() {
      while(true) {
        let value = (prev * factor) % MOD;
        prev = value;
        if (mul === 1 || (value % mul === 0)) {
          return value;
        }
      }
    },
    next16() {
      return this.next() & 0xFFFF;
    }
  };
}
