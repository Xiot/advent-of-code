
import { autoParse, log, createGridMap, visualizeGrid } from "../../utils";

export const parse = autoParse();

export function part1(input) {

  const reg = createRegister();
  for(let [op, value] of input) {
    reg.execute(op, value);
  }

  const ticks = [20,60,100,140,180,220];
  const sum = ticks.reduce((acc, tick) => {
    const value = reg.valueAt(tick - 1) * tick;
    log(tick, value);
    return acc + value;
  }, 0);

  return sum;
}



export function part2(input) {
  const grid = createGridMap(' ');

  const reg = createRegister();
  for(let [op, value] of input) {
    reg.execute(op, value);
  }

  let line = 0;
  for(let i = 0; i<240; i++) {
    const value = reg.valueAt(i);
    const x = i % 40;
    const shouldDraw = ((x -1) <= value) && (value <= (x +1));
    log(i + 1, x, value, shouldDraw, x-1, x+1);
    
    if (shouldDraw) {
      grid.set(x, line, '#'); 
    }
    line = Math.floor(i / 40);
  }

  console.log(
    visualizeGrid(grid, (x, y) => {
      const v = grid.get(x, y);
      return v;
    })
  );

}    

function createRegister() {

  let value = 1;
  let cycle = 0;

  let queue = [];

  let strengths = new Map();

  const execute = (op, opValue) => {
    
    if(op === 'noop') {
      cycle +=1;
    } else if (op === 'addx') {
      cycle +=2;
      value += opValue;      
    }

    strengths.set(cycle, value);
    // log(cycle, value);
    
  };

  return {
    execute,
    get cycle() { return cycle; },
    get value() { return value; },
    get hasMore() { return queue.length > 0;},
    get strengths() { return strengths;},
    valueAt(c) {
      while(c >=0) {
        const v = strengths.get(c);
        if (v != null) return v;
        c--;
      }
      return 1;
    }
  };
}