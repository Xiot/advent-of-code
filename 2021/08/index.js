
import { byLine, range, toChar, toCharCode } from "../../utils";

const ALL_LETTERS = 'abcdefg'.split('');

const TOP = 0;
const TOP_LEFT = 1;
const TOP_RIGHT = 2;
const MIDDLE = 3;
const BOTTOM_LEFT = 4;
const BOTTOM_RIGHT = 5;
const BOTTOM = 6;

const NAMES = [
  'TOP', 'TOP_LEFT', 'TOP_RIGHT', 'MIDDLE', 'BOTTOM_LEFT', 'BOTTOM_RIGHT', 'BOTTOM'
];

const segments = [
  'abcefg',
  'cf',
  'acdeg',
  'acdfg',
  'bcdf',
  'abdfg',
  'abdefg',
  'acf',
  'abcdefg',
  'abcdfg'
];

const segments2 = segments.map(code => {
  let k = [];
  for(let c = 0; c < 7; c++) {
    k.push(code.includes( toChar(toCharCode('a') + c)));
  }
  return k;
});

export const parse = byLine(line => {
  const sections = line.split('|').map(x => x.trim()).map(x => x.split(' '));
  return sections.map(s => s.map(normalize));
});

export function part1(input) {
  
  let sum = 0;
  for(let [codes, value] of input) {
    sum += countLength(value, 2) + countLength(value, 4) + countLength(value, 3) + countLength(value, 7);
  }
  return sum;
}

function countLength(value, length) {
  return value.filter(x => x.length === length).length;
}


function normalize(code) {
  return code.split('').sort().join('');
}

const intersect = (left, right) => {
  if (typeof left === 'string') left = left.split('');
  if (typeof right === 'string') right = right.split('');

  if (left.length > right.length) {
    const t = left;
    left = right;
    right = t;
  }

  const ret = left.filter(x => right.includes(x));
  return ret;
};

const except = (left, right) => {
  return left.filter(x => !right.includes(x));
};

const union = (left, right) => {
  const ret = Array.from(new Set([...left, ...right]));  
  return ret.sort();
};

// expected -  input: 936117
export function part2(input) {

  let sum = 0;
  for (let [codes, values] of input) {

    const possibilities = range(0, 6).map( (x, i) => ({
      name: NAMES[i],
      exclude: [],     
      locked: null,      
    }));

    const digits = segments.map((x, i) => {
      const pos = codes.filter(c => c.length === x.length);
      return {
        index: i,
        codes: pos,
        segments: segments2[i],
        letters: Array.from(new Set(pos.flatMap(x => x.split('')))),
        locked: null,
      };
    });

    const setNumber = (num, letters) => {
      const def = segments2[num];

      for(let i = 0; i < def.length; i++) {
        if (def[i]) {
          setPossible(i, letters);
        } else {
          setExclude(i, letters);
        }
      }
      digits[num].locked = letters;
      for(let d = 0; d < digits.length; d++) {
        if (d === num) continue;
        digits[d].codes = digits[d].codes.filter(x => x !== letters);
      }
    };

    const setExclude = (pos, letters) => {
      if (typeof letters === 'string') {
        letters = letters.split('');
      }      
      possibilities[pos].exclude = union(possibilities[pos].exclude, letters);
    };

    const setPossible = (pos, letters) => {
      if (typeof letters === 'string') {
        letters = letters.split('');
      }

      const target = possibilities[pos];      
      target.exclude = union(target.exclude, except(ALL_LETTERS, letters));      
    };
    
    const lock = (pos, letter) => {      
      for(let i = 0; i < possibilities.length; i++) {
        const p = possibilities[i];     
        if (i === pos) {
          p.locked = letter;
          p.exclude = ALL_LETTERS.filter(x => x !== letter);
        } else if(!p.locked) {          
          p.exclude = union(p.exclude, [letter]);
        }
      }      
    };

    const checkLock = () => {
      for(let i = 0; i < possibilities.length; i++) {
        const p = possibilities[i];
        if (p.exclude.length === 6) {
          lock(i, except(ALL_LETTERS, p.exclude)[0]);
        }
      } 
    };

    const v4 = codes.find(x => x.length === 4);
    setNumber(4, v4);

    const v1 = codes.find(x => x.length === 2);
    setNumber(1, v1);
    
    const v7 = codes.find(x => x.length === 3);
    setNumber(7, v7);
    checkLock();

    const v6 = digits[6].codes.find(x => {
      let s =  intersect(x, digits[1].locked).length === 2;
      return !s;
    });    
    setNumber(6, v6);
    checkLock();

    const v5 = digits[2].codes.find(x => intersect(x, possibilities[TOP_RIGHT].locked).length === 0);
    setNumber(5, v5);
    checkLock();

    const v0 = digits[0].codes.find(x => intersect(x, possibilities[BOTTOM_LEFT].locked).length === 1);
    setNumber(0, v0);
    checkLock();

    const m = except(ALL_LETTERS, v0)[0];
    lock(MIDDLE, m);    
    checkLock();

    for(let r of digits.filter(x => !x.locked)) {
      const code = r.segments.map((x, i) => x ? possibilities[i].locked : '').sort().join('');
      setNumber(r.index, code);
    }

    const actuals = values.map(v => digits.find(d => d.locked === v).index).join('');
    sum += parseInt(actuals);
    
  }
  return sum;
}    
