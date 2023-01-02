
import { autoParse, log, byLine, maybeNumber, createGridMap, range, visualizeGrid } from "../../utils";
import fs from 'fs';

const PARSE_RE = /([xy])=(\d+), ([xy])=(\d+)\.\.(\d+)/;
export const parse = byLine(line => {
  const [left, leftValue, right, rightMin, rightMax] = PARSE_RE.exec(line).slice(1).map(maybeNumber);
  const x = left === 'x' 
    ? [leftValue, leftValue]
    : [rightMin, rightMax];
  const y = left === 'y'
    ? [leftValue, leftValue]
    : [rightMin, rightMax];
  return {x, y};
});

// function canSettle(grid, pos) {
//   for
// }
function moveDown(grid, pos) {
  let y = pos.y;
  while(true) {
    if (y > grid.bounds.bottom)  {
      return null;
    }
    const value = grid.get(pos.x, y);
    if (value === '~' || value === '#') {
      return {x: pos.x, y: y-1};
    }    
    y++;    
  }
}
function isBlocked(grid, x, y) {
  const value = grid.get(x, y);
  return value === '#' || value === '~';
}

function canSettle(grid, pos) {
  let lx = pos.x - 1;
  let rx = pos.x + 1;

  let settling = false;
  let leftDrop = null;
  let rightDrop = null;

  // left edge
  if (!isBlocked(grid, lx, pos.y)) {
    while(true) {
      if (!isBlocked(grid, lx, pos.y) && isBlocked(grid, lx, pos.y+1)) {
        lx--;
        continue;
      }    
      break;
    }
  }

  if (!isBlocked(grid, rx, pos.y)) {
    while(true) {
      if (!isBlocked(grid, rx, pos.y) && isBlocked(grid, rx, pos.y+1)) {
        rx++;
        continue;
      }
      break;
    }
  }

  settling = isBlocked(grid, lx, pos.y) && isBlocked(grid, rx, pos.y);
  if (settling) {
    return {
      settled: true,
      l: lx,
      r: rx
    };
  } else {
    let sides = [];
    if (!isBlocked(grid, lx, pos.y+1)) {
      sides.push(lx);
    }
    if (!isBlocked(grid, rx, pos.y+1)) {
      sides.push(rx);
    }

    return {
      settles: false,
      l: lx,
      r: rx,
      sides
    };
  }  
}

function createUniqueQueue(uniqueFn) {

  const data = [];
  return {
    get length() {return data.length;},
    push(value) {
      const key = uniqueFn(value);
      if (!data.some(x => uniqueFn(x) === key)) {
        data.push(value);
      }
    },
    shift() {
      return data.shift();
    },
    [Symbol.iterator]() { return data[Symbol.iterator]();},
    toJSON() {return data;}
  };
}

// 40897 - low
// 41032 - high
export function part1(input) {
  // log('input', input);
  const grid = createGridMap(' ');
  grid.markOnGet = false;

  for(let clay of input) {
    for(let y of range(clay.y[0], clay.y[1])) {
      for(let x of range(clay.x[0], clay.x[1])) {
        grid.set(x, y, '#');
      }
    }
  }
  grid.recalculateBounds();
  const minY = grid.bounds.top;
  log('my', minY);
  let spring = {x: 500, y: 0};
  grid.set(spring.x, spring.y, '+');

  let count = 0;

  // let drops = [{pos: spring, dir: 0}];
  const drops = createUniqueQueue(v => `${v.x},${v.y}`);
  drops.push(spring);

  while(drops.length > 0) {
    count++;
    if (count > 55_000) {
      log(drops);
      break;
    };
    const drop = drops.shift();
    
    if (grid.get(drop.x, drop.y) === '~') {
      continue;
    }

    const b = moveDown(grid, drop);
    if (b == null) {
      for(let y = drop.y; y <= grid.bounds.bottom; y++) {
        grid.set(drop.x, y, '|');
      }        
      continue;
    }

    // log('drop down', drop.pos.x, drop.pos.y, b.y);
    for(let y = drop.y; y <= b.y; y++) {
      if (grid.empty(drop.x, y)) {
        grid.set(drop.x, y, '|');
      }
    }

    const s = canSettle(grid, b);

    if (!s.settled) {
      for(let x = s.l + 1; x <= s.r -1; x++) {
        grid.set(x, b.y, '|');
      }
      s.sides.forEach(s => {
        drops.push({x: s, y: b.y});
      });
      drops.push(drop);
      continue;
    }

    if (s.settled) {
      for(let x = s.l+1; x <= s.r-1; x++) {
        grid.set(x, b.y, '~');
      }
      drops.push(drop);
      continue;
    }
      
  }

  // fs.writeFileSync('./2018/17/output.txt', visualizeGrid(grid));

  const wetTiles = Array.from(grid.entries())
    .filter(([{y}]) => y >= minY)
    .map(([,value]) => value)
    .filter(x => x === '|' || x === '~')
    .length;
  return wetTiles;

}

export function part2(input) {

  const grid = createGridMap(' ');
  grid.markOnGet = false;

  for(let clay of input) {
    for(let y of range(clay.y[0], clay.y[1])) {
      for(let x of range(clay.x[0], clay.x[1])) {
        grid.set(x, y, '#');
      }
    }
  }
  grid.recalculateBounds();
  const minY = grid.bounds.top;
  log('my', minY);
  let spring = {x: 500, y: 0};
  grid.set(spring.x, spring.y, '+');

  let count = 0;

  const drops = createUniqueQueue(v => `${v.x},${v.y}`);
  drops.push(spring);

  while(drops.length > 0) {
    count++;
    if (count > 55_000) {
      log(drops);
      break;
    };
    const drop = drops.shift();
  
    if (grid.get(drop.x, drop.y) === '~') {
      continue;
    }

    const b = moveDown(grid, drop);
    if (b == null) {
      for(let y = drop.y; y <= grid.bounds.bottom; y++) {
        grid.set(drop.x, y, '|');
      }        
      continue;
    }

    // log('drop down', drop.pos.x, drop.pos.y, b.y);
    for(let y = drop.y; y <= b.y; y++) {
      if (grid.empty(drop.x, y)) {
        grid.set(drop.x, y, '|');
      }
    }

    const s = canSettle(grid, b);

    if (!s.settled) {
      for(let x = s.l + 1; x <= s.r -1; x++) {
        grid.set(x, b.y, '|');
      }
      s.sides.forEach(s => {
        drops.push({x: s, y: b.y});
      });
      drops.push(drop);
      continue;
    }

    if (s.settled) {
      for(let x = s.l+1; x <= s.r-1; x++) {
        grid.set(x, b.y, '~');
      }
      drops.push(drop);
      continue;
    }
    
  }

  // fs.writeFileSync('./2018/17/output.txt', visualizeGrid(grid));

  const wetTiles = Array.from(grid.entries())
    .filter(([{y}]) => y >= minY)
    .map(([,value]) => value)
    .filter(x =>  x === '~')
    .length;
  return wetTiles;

}    
