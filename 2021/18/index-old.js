
import { autoParse, byLine, log } from "../../utils";

const isNumber = digit =>!isNaN(digit);

const createReader = text => {
  let index = 0;
  return {
    get eof() {return index >= text.length;},
    get length() { return text.length;},
    get index() { return index; },
    current() {
      return text[index];
    },
    peek() {
      return text[index +1];
    },
    read() {
      return text[index++];
    },
    isNumber() {
      return isNumber(this.current());      
    },
    isOpen() {
      return this.current() === '[';
    },
    isClose() {
      return this.current() === ']';
    },
    isComma() {
      return this.current() === ',';
    },
    readNumber() {
      let digits = '';
      while(isNumber(this.current())) {
        digits += this.read();
      }
      return parseInt(digits);
    }
  };
};

export const parse1 = byLine(line => {
  
  const parsePair = (reader) => {
    if (reader.eof) { return null; }

    log('parsePair', reader.index, reader.current() );
    if (reader.isNumber()) {
      return reader.readNumber();      
    }

    reader.read(); // open
    const left = parsePair(reader);
    reader.read(); // comma
    const right = parsePair(reader);
    reader.read(); // close
    return {left, right};
  };  

  const reader = createReader(line);
  return parsePair(reader);

});

export const parse5Line = line => {

};

export const parse4Line = line => {
  const reader = createReader(line);

  const pairs = [];
  let depth = 0;

  let w = 0;
  while(!reader.eof) {
    if (w++ > 20) break;
    if (reader.isOpen()) {
      depth += 1;
      const pair = {
        depth
      };
      reader.read(); // open
      if (reader.isNumber()) {
        pair.left = reader.readNumber();
        reader.read(); // comma

        if (reader.isNumber()) {
          pair.right = reader.readNumber();
          // reader.read(); // close          
        }
        pairs.push(pair);
      }
    } else if (reader.isComma()) {
      reader.read();
      if (reader.isNumber()) {
        const pair = {
          depth, 
          right: reader.readNumber()
        };
        pairs.push(pair);
      }
    } else if(reader.isClose()) {
      depth -=1;
      reader.read(); // close
    }
  }
  if (w >= 20) {log('broke');}
  return pairs;
};

export const parse4 = byLine(line => parse4Line(line));

export const parse3 = byLine(line => {

  const pairs = [];
  const reader = createReader(line);
  let depth = 0;
  const root = {depth: 0};
  const stack = [root];
  pairs.push(root);
  let w = 0;
  while(!reader.eof) {
    w++;
    if (w > 20) break;
    const top = stack[stack.length - 1];
    log('parse3', reader.index, reader.current(), top);
    if (reader.isOpen()) {
      depth +=1;
      const n = {depth};
      if (top.left == null) {
        top.left = n;
      } else if (top.right == null) {
        top.right = n;
      }
      stack.push(n);
      log('move next');
      reader.read();
      continue;

    } else if (reader.isClose()) {
      depth -=1;
      log('push');
      pairs.push(stack.pop());
      reader.read();
      continue;
    } else if(reader.isComma()) {
      reader.read();
      continue;
    }
    
    if (top.left == null && reader.isNumber()) {
      top.left = reader.readNumber();
      // reader.read(); // comma
      continue;
    }

    if (top.right == null && reader.isNumber()) {
      top.right = reader.readNumber();
      log('right', top.right);
      // depth -=1;
      // pairs.push(stack.pop());
      // reader.read(); // close
      continue;
    }
  }

  return pairs;

});

export const parse2 = byLine(line => {
  const pairs = [];
  const parsePair = (reader, depth = 0, parent) => {
    if (reader.eof) { return null; }

    // log('parsePair', reader.index, reader.current() );
    if (reader.isNumber()) {
      return reader.readNumber();      
    }

    const current = {
      depth,
      parent,
    };
    reader.read(); // open
    current.left = parsePair(reader, depth + 1, current);
    reader.read(); // comma
    current.right = parsePair(reader, depth + 1, current);
    reader.read(); // close
    // const p = {left, right, depth, parent};
    pairs.unshift(current);
    return current;
  };  

  const reader = createReader(line);
  const root = parsePair(reader);
  return {
    root,
    pairs
  };
});



export function part1(input) {
  // log('input', input);
  // const split = parse4('[[[[[9,8],1],2],3],4]');
  // const split = parse4('[7,[6,[5,[4,[3,2]]]]]');
  // const split = parse4('[[6,[5,[4,[3,2]]]],1]');
  // const line = parse4Line('[[3,[2,[1,[7,3]]]],[6,[5,[4,[3,2]]]]]');
  const line = parse4Line('[10, 11]');

  const reduce2 = pairs => {

    const getLeft = i => {
      if (i === 0) return null;
      const pair = pairs[i-1];
      const side = pair.right != null ? 'right' : 'left';
      return {
        pair,
        side,
        index: i-1,
        value: pair[side]
      };
      
    };
    const getRight = i => {
      if (i >= pairs.length -1) return null;
      const pair = pairs[i+1];
      const side = pair.left != null ? 'left' : 'right';
      return {
        pair,
        side,
        index: i+1,
        value: pair[side]
      };      
    };
    const getFirstEmpty = i => {
      for(let idx = i -1; idx >= 0; idx--) {
        const pair = pairs[idx];
        if (!pair.right) {
          return {
            pair,
            side: 'right',
            index: idx,
          };
        } else if(!pair.left) {
          return {
            pair,
            side: 'left',
            index: idx,
          };
        }
      }
      return null;
    };

    const explode = (pair, i) => {

      const left = getLeft(i);
      const right = getRight(i);
      // log('explode', {i, pair, left, right});

      const newPairs = [...pairs.slice(0, i), ...pairs.slice(i+1)];

      if (left) {
        left.pair[left.side] = left.value + pair.left;

      } else if (right) {
        right.pair.left = 0;
      }

      if (right) {
        right.pair[right.side] = right.value + pair.right;
      } else if (left) {
        left.pair.right = 0;
      }

      if (left && right) {
        const first = getFirstEmpty(i);
        log('f', first);
        first.pair[first.side] = 0;
      }

      return {
        complete: false,
        op: 'explode',
        pairs: newPairs,
      };
    };

    const split = (pair, side, i) => {
      const value = pair[side];
      const [l, r] = [Math.floor(value / 2), Math.ceil(value / 2)];
      // log('split', value, side, l, r);

      pair[side] = null;
      const newPair = {
        depth: pair.depth +1,
        left: l, 
        right: r
      };

      const newPairs = [...pairs.slice(0, i), newPair, ...pairs.slice(i)].filter(x => !(x.left == null && x.right == null));

      return {
        complete: false,
        pairs: newPairs,
        op: 'split',
      };
    };    

    for(let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      if (pair.depth > 4) {
        return explode(pair, i);
      } else if (pair.left >= 10) {
        return split(pair, 'left', i);
      } else if (pair.right >= 10) {
        return split(pair, 'right', i);
      }
    }

    return {
      complete: true,
      op: 'none',
      pairs
    };
  };
  
  const logPairs = (name, pairs) => {
    log(name, {
      text: format2(pairs),
      pairs
    });
  };
  const add = (left, right) => {

    // const leftText = format2(left);
    // const rightText = format2(right);

    logPairs('LEFT', left);
    logPairs('RIGHT', right);

    const result = [...left.map(l => ({
      ...l,
      depth: l.depth +1
    })), ...right.map(r => ({
      ...r,
      depth: r.depth + 1
    }))];
    logPairs('ADD', result);
    // log('add', {left: leftText, right: rightText, result: format2(result)}, left, right);
    return result;
  };
  const logResult = (i, ret) => log(i, ret.op.padEnd(10), format2(ret.pairs), ret.pairs);

  // const test = add(
  //   parse4Line('[[[[4,3],4],4],[7,[[8,4],9]]]'),
  //   parse4Line('[1,1]')
  // );

  // let pairs = test;  
  // let count = 0;
  
  // logResult(0, {op: 'initial', pairs});
  // while(true) {
  //   const ret = reduce2(pairs);
  //   if (ret.complete) break;
  //   logResult(count++, ret);
  //   pairs = ret.pairs;
  // }
  // log(count, format2(pairs), pairs);
  

  // let pairs = parse4Line('[[[[0,7],4],[7,[[8,4],9]]],[1,1]]');
  // logResult(0, {op: 'initial', pairs});
  // const reduced = reduce2(pairs);
  // logResult(1, reduced);

  const k = parse2('[[[[0,7],4],[7,[[8,4],9]]],[1,1]]')[0].root;
  
  const printer = root => {
    if (typeof root === 'number') return String(root);
    return '[' + printer(root.left) + ',' + printer(root.right) + ']';
  };

  const nodeAt = (root, target) => {

  };

  log('printer', printer(k));

}

function format2(pairs) {
  let lastDepth = 0;
  let text = '';

  const addComma = (text) => {
    const last = text[text.length - 1];
    if (last == null) return '';
    if (last !== ',' && last !== '[') return  ',';
    return '';
  };
  // const addOpen = (text) => {
  //   const last = text[text.length - 1];
  //   if (last == null) return '';
  //   if (last !== '[' && last !== '[') return  ',';
  //   return '';
  // }

  for(let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    if (lastDepth < pair.depth) {
      text += addComma(text, i) + '['.repeat(pair.depth - lastDepth);
    } else if (lastDepth > pair.depth) {
      text += ']'.repeat(lastDepth - pair.depth);
    } else {
      text += '],[';
    }

    if (pair.left != null) {
      text += addComma(text, i) + pair.left;
    }
    if (pair.right != null) {      
      text += addComma(text, i) + pair.right;
    }
    lastDepth = pair.depth;

  }
  return text + ']'.repeat(lastDepth);
}

function format(pair) {

  let t = '[';
  t += typeof pair.left === 'number' ? pair.left : format(pair.left);
  t += ',';
  t += typeof pair.right === 'number' ? pair.right : format(pair.right);
  t += ']';
  return t;

  // let t = '';
  // for(let i = 0; i < pairs.length; i++) {
  //   t += '[';

  //   t+=']';
  // }
}

export function part2(input) {

}    
