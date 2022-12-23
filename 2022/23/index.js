
import { autoParse, log, loadGrid, visualizeGrid, createGridMap } from "../../utils";

export const parse = text => load(text);


const CHECKS = [
  [[-1, -1], [0,-1],[1,-1]],
  [[-1,1], [0,1], [1,1]],
  [[-1,-1],[-1,0],[-1,1]],
  [[1,-1], [1,0],[1,1]]
];

function isAlone(grid, elf) {
  const r = grid.ring(elf.x, elf.y);
  const allEmpty = Array.from(r).every(([{x,y},v]) => grid.get(x,y) === '.');
  return allEmpty;
}

function tryMoveElf(grid, elf) {
  
  for(let d = 0; d < 4; d++) {
    let dir = (elf.dir + d) % CHECKS.length;
    const m = tryMove(grid, elf.x, elf.y, dir);
    if (m == null) continue;

    return {...elf, target: m, dir: (elf.dir +1) % CHECKS.length, moved: dir};
  }
  return null;
}

function tryMove(grid, x, y, dir) {
  for(let [dx,dy] of CHECKS[dir]) {
    if(grid.get(x+dx, y+dy) === '#') return null;
  }
  return {x: x + CHECKS[dir][1][0], y: y + CHECKS[dir][1][1]};
}


export function part1(input) {
  const {grid: originalGrid} = input;
  
  // console.log(
  //   visualizeGrid(originalGrid, (x, y) => originalGrid.get(x, y))
  // );

  let elves = [...input.elves];
  let grid = originalGrid;  

  for(let turn = 0; turn < 10; turn++) {
    log('TURN', turn + 1);
    const turnMap = createGridMap('.');
    const buckets = createBucketMap(item => `${item.target.x},${item.target.y}`);    
    let cantMove = [];
    for(let elf of elves) {

      if (isAlone(grid, elf)) {
        const nextDir = (elf.dir +1) % CHECKS.length;
        cantMove.push({...elf, dir: nextDir});        
        log(`${elf.id}: ${elf.x}, ${elf.y} is alone`);
        continue;
      }

      const ret = tryMoveElf(grid, elf);
      if (ret != null) {
        log(`${ret.id}: ${ret.x}, ${ret.y} moving to ${ret.target.x}, ${ret.target.y} [${ret.moved}] [dir: ${elf.dir} -> ${ret.dir}]`);        
        buckets.add(ret);        
      } else {
        const nextDir = (elf.dir +1) % CHECKS.length;
        log(`${elf.id}: ${elf.x}, ${elf.y} doesn't move [dir: ${elf.dir} -> ${nextDir}]`);                
        cantMove.push({...elf, dir: nextDir});
      }      
    }

    const elfBuckets = Array.from(buckets.values());
    const elvesToMove = elfBuckets.filter(x => x.length === 1).flatMap(x => x);
    const elvesToStay = elfBuckets.filter(x => x.length > 1).flatMap(x => x);
    
    for(let e of elvesToMove) {    
      turnMap.set(e.target.x, e.target.y, '#');
    }
    for(let e of elvesToStay) {
      turnMap.set(e.x, e.y, '#');
    }
    for(let e of cantMove) {
      turnMap.set(e.x, e.y, '#');
    }

    turnMap.recalculateBounds();
    
    console.log(
      visualizeGrid(turnMap, turnMap.get, {printRowNumbers: true})
    );
    elves = [
      ...cantMove,
      ...elvesToStay,
      ...elvesToMove.map(e => ({id: e.id, x: e.target.x, y: e.target.y, dir: e.dir}))
    ].sort(sortByPos);
    grid = turnMap;
    log('----------\n');
  }

  const volume = grid.bounds.width * grid.bounds.height;
  log(volume, elves.length);
  return volume - elves.length;

}

function sortByPos(l, r) {
  if (l.y === r.y) {
    return l.x - r.x;
  }
  return l.y - r.y;
}

export function part2(input) {
  const {grid: originalGrid} = input;
  
  // console.log(
  //   visualizeGrid(originalGrid, (x, y) => originalGrid.get(x, y))
  // );

  let elves = [...input.elves];
  let grid = originalGrid;    
  let turn = 0;
  // for(let turn = 0; turn < 10; turn++) {
  while(true) {
    turn++;
    log('TURN', turn);
    let elvesMoved = 0;

    const turnMap = createGridMap('.');
    const buckets = createBucketMap(item => `${item.target.x},${item.target.y}`);    
    let cantMove = [];
    for(let elf of elves) {

      if (isAlone(grid, elf)) {
        const nextDir = (elf.dir +1) % CHECKS.length;
        cantMove.push({...elf, dir: nextDir});        
        log(`${elf.id}: ${elf.x}, ${elf.y} is alone`);
        continue;
      }

      const ret = tryMoveElf(grid, elf);
      if (ret != null) {
        log(`${ret.id}: ${ret.x}, ${ret.y} moving to ${ret.target.x}, ${ret.target.y} [${ret.moved}] [dir: ${elf.dir} -> ${ret.dir}]`);        
        elvesMoved++;
        buckets.add(ret);        
      } else {
        const nextDir = (elf.dir +1) % CHECKS.length;
        log(`${elf.id}: ${elf.x}, ${elf.y} doesn't move [dir: ${elf.dir} -> ${nextDir}]`);                
        cantMove.push({...elf, dir: nextDir});
      }      
    }

    const elfBuckets = Array.from(buckets.values());
    const elvesToMove = elfBuckets.filter(x => x.length === 1).flatMap(x => x);
    const elvesToStay = elfBuckets.filter(x => x.length > 1).flatMap(x => x);
    
    for(let e of elvesToMove) {    
      turnMap.set(e.target.x, e.target.y, '#');
    }
    for(let e of elvesToStay) {
      turnMap.set(e.x, e.y, '#');
    }
    for(let e of cantMove) {
      turnMap.set(e.x, e.y, '#');
    }

    turnMap.recalculateBounds();
    
    // console.log(
    //   visualizeGrid(turnMap, turnMap.get, {printRowNumbers: true})
    // );
    elves = [
      ...cantMove,
      ...elvesToStay,
      ...elvesToMove.map(e => ({id: e.id, x: e.target.x, y: e.target.y, dir: e.dir}))
    ].sort(sortByPos);
    grid = turnMap;
    log('----------\n');
    
    if (elvesMoved === 0) {
      break;
    }
  }
  log('NO MOVE', turn);
  // const volume = grid.bounds.width * grid.bounds.height;
  // log(volume, elves.length);
  return turn;
}    

function createBucketMap(keyFn) {
  const cache = new Map();
  return {
    add(value) {
      const key = keyFn(value);
      let bucket = cache.get(key);
      if (!bucket) {
        bucket = [];
        cache.set(key, bucket);
      }
      bucket.push(value);
    },
    values() {
      return cache.values();
    },
    keys() {
      return cache.keys();
    },
    entries() {
      return cache.entries();
    },
    get size() {return cache.size;}
  };
}

function load(text) {

  const grid = createGridMap('.');
  grid.markOnGet = false;

  let elves = [];
  let id = 0;

  const lines = text.split('\n');  
  for(let y = 0; y < lines.length; y++) {
    for(let x = 0; x < lines[0].length; x++) {
      const value = lines[y][x];
      if (value === '#') {
        grid.set(x, y, value);
        elves.push({
          id: id++,
          x,
          y,
          dir: 0
        });
      }
    }
  }
  grid.recalculateBounds();
  return {grid, elves};
}