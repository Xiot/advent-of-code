
import { autoParse, log, bySection, range } from "../../utils";

const RE_ID = /Monkey (\d+)/;
const RE_ITEMS = /(\d+)/g;
const RE_TEST = /Test: divisible by (\d+)/;
const RE_TRUE = /If true: throw to monkey (\d+)/;
const RE_FALSE = /If false: throw to monkey (\d+)/;
const RE_OP = /Operation: new = ([a-z0-9]+) (.) ([a-z0-9]+)/i;


export const parse = text => text.split('\n\n').map(chunk => {

  const id = RE_ID.exec(chunk)[1];
  const test = RE_TEST.exec(chunk)[1];
  const ifTrue = RE_TRUE.exec(chunk)[1];
  const ifFalse = RE_FALSE.exec(chunk)[1];

  const opItems = RE_OP.exec(chunk);


  const itemsLine = chunk.split('\n')[1];
  const matches = Array.from(itemsLine.matchAll(RE_ITEMS));
  
  const items = matches.map(x => parseInt(x));

  return {
    id: parseInt(id),
    test: parseInt(test), 
    ifTrue: parseInt(ifTrue),
    ifFalse: parseInt(ifFalse),
    items,
    op: {
      left: opItems[1],
      op: opItems[2],
      right: isNaN(opItems[3]) ? opItems[3] : parseInt(opItems[3]),      
    }
  };

});

export function part1(monkeys) {
  
  const inspectCount = Array.from({length: monkeys.length}, () => 0);

  for(let round of range(1,20)) {
    log.push(`Round: ${round}`);
    for(let m of monkeys) {

      while(m.items.length > 0) {
        const item = m.items.shift();

        inspectCount[m.id]++;

        let testValue = inspect(m, item);
        testValue = Math.floor(testValue / 3);
        const target = testValue % m.test === 0 ? m.ifTrue : m.ifFalse;
        monkeys[target].items.push(testValue);
      }
    }
    
    for(let m of monkeys)  {      
      log(m.id, m.items);
    }
    log.pop();
  }
  log(inspectCount);

  const answer = inspectCount.sort((l, r) => r - l).slice(0,2).reduce((acc, cur) => acc*cur);
  return answer;

}

const inspect = (m, item) => {
  const oldValue = item;

  let {left, op, right} = m.op;
  if (left === 'old') left = oldValue;
  if (right === 'old') right = oldValue;
  return calc(left, op, right);
};


const calc = (left, op, right) => {
  if (op === '*') {
    return left * right;
  }
  if (op === '+') {
    return left + right;
  }
};

const M = 96577;
export function part2(monkeys) {

  const inspectCount = Array.from({length: monkeys.length}, () => 0);

  const divisor = monkeys.map(m => m.test).reduce((acc, t) => acc * t);
  
  // console.log(divisor);
  // return divisor;
  for(let round of range(1,10000)) {
    log.push(`Round: ${round}`);
    for(let m of monkeys) {

      while(m.items.length > 0) {
        const item = m.items.shift();

        inspectCount[m.id]++;

        let testValue = inspect(m, item);
        // testValue = //Math.floor(testValue / 96577);
        testValue = testValue %  divisor;

        const target = testValue % m.test === 0 ? m.ifTrue : m.ifFalse;
        monkeys[target].items.push(testValue);
      }
    }
    
    // for(let m of monkeys)  {      
    //   log(m.id, m.items);
    // }
    log.pop();
  }
  log(inspectCount);

  const answer = inspectCount.sort((l, r) => r - l).slice(0,2).reduce((acc, cur) => acc*cur);
  return answer;
}    
