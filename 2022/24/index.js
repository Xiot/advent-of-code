
import { autoParse, log, loadGrid, visualizeGrid, createGridMap, aStar } from "../../utils";

export const parse = text => {
  const rows = text.split('\n');
  const grid = createGridMap('.');
  grid.markOnGet = false;

  const blizzards = [];

  for(let y = 1; y < rows.length-1; y++) {
    for(let x = 1; x < rows[0].length-1; x++) {
      const value = rows[y][x];
      grid.set(x-1, y-1, value);

      if (value === '.' || value === '#') continue;

      blizzards.push({x: x-1, y:y-1, dir: value});
    }
  }

  return {
    grid,
    blizzards,
    start: {x: 0, y: -1},
    end: {x: grid.bounds.right, y: grid.bounds.bottom}
  };
};

const DIRS = {
  '>': {x: 1, y: 0},
  'v': {x:0, y: 1},
  '^': {x: 0, y: -1},  
  '<': {x: -1, y: 0},  
};

export function partWorksWithSample(input) {
  // log('input', input);

  const {grid} = input;

  // console.log(
  //   visualizeGrid(input.grid)
  // );

  const visualize = (time, pos, bliz, last) => {
    const g = createGridMap('.');
    g.set(input.end.x, input.end.y, '.');
        
    if ('values' in bliz) {      

      for(let [key, values] of bliz.entries()) {        
        if(values.length === 1) {
          g.set(values[0].x, values[0].y, values[0].dir);
        } else {
          g.set(values[0].x, values[0].y, values.length);
        }
      }

    } else {    
      for(let b of bliz) {
        g.set(b.x, b.y, b.dir);
      }
    }

    g.set(pos.x, pos.y, 'E');

    console.log('------');
    console.log('time', time);
    console.log('pos', pos);
    last && console.log('last', last);
    console.log(      
      visualizeGrid(g)
    );
    console.log();
  };

  let initialBlizzards = createBucketMap(keyOf);
  for(let b of input.blizzards) {        
    initialBlizzards.add(wrappedAdd(b, DIRS[b.dir], grid.bounds));
  }

  function moveBlizzards(source) {
    const target = createBucketMap(keyOf);
    for(let b of source.values()) {
      // log('b', b);
      target.add(wrappedAdd(b, DIRS[b.dir], grid.bounds));
    }
    return target;
  }

  const loop = grid.bounds.width * grid.bounds.height;
  function createBlizzardCache(count = loop) {
    const cache = new Map();    

    let bliz = initialBlizzards;

    for(let t = 0; t < loop;t++) {
      const nextBliz = moveBlizzards(bliz);
      cache.set(
        t + 1,
        nextBliz
      );
      bliz = nextBliz;
    }
    cache.set(0, cache.get(loop));

    return {
      get(time) {
        const wrappedTime = time % loop;
        return cache.get(wrappedTime);
      }
    };
  }
  // log(grid.bounds);
  function willBeFree(time, pos) {
    const tox = time * grid.bounds.width;
    const toy = time * grid.bounds.height;
    const fromLeft = (pos.x - time + tox) % grid.bounds.width;
    const fromRight = (pos.x + time + tox) % grid.bounds.width;
    const fromTop = (pos.y -time + toy) % grid.bounds.height;
    const fromBottom = (pos.y + time + toy) % grid.bounds.height;
    
    const checks = [
      {x: fromLeft, y: pos.y, check: '>'},
      {x: fromRight, y: pos.y, check: '<'},
      {x: pos.x, y: fromTop, check: 'v'},
      {x: pos.x, y: fromBottom, check: '^'}
    ];

    for(let d of checks) {
      const value = grid.get(d.x, d.y);
      // log(d, value);
      if (value === d.check) return false;
    }
    return true;
  }

  // log(2, willBeFree(2, {x: 0, y: 1}));
  // log(2, willBeFree(2, {x: 1, y: 0}));
  // for(let t = 0; t <= 15; t++) {
  //   log(t, willBeFree(t, {x: 0, y:0}));
  // }
  // return willBeFree(1, {x:0, y:0});

  // const d = createGridMap(' ');
  // for(let t = 0; t < 3; t++) {
  //   for(let x = 0; x < 6; x++) {
  //     for(let y = 0; y < 4; y++) {
  //       const free = willBeFree(t, {x,y});
  //       d.set(x, y, free ? '.' : '#');
  //     }
  //   }
  //   console.log('time', t);
  //   console.log(visualizeGrid(d));
  //   console.log();
  // }

  // const c = createBlizzardCache(3);
  // for(let t = 0; t < 3; t++) {
  //   visualize(t, {x: 0, y: -1}, c.get(t));
  // }

  // return 'n';
  // const cachedBliz = createBlizzardCache();
  

  const visited = {};
  const visitedKey = (time, pos) => `${time}|${pos.x},${pos.y}`;
  function hasVisited(time, pos, length) {
    const key = visitedKey(time % loop, pos);
    const v = visited[key];
    if (v == null) return false;
    return v > length;
  }
  function markVisited(time, pos, path) {
    const key = visitedKey(time % loop, pos);
    visited[key] = path.length;
  }

  log(grid.bounds);

  let result = null;

  let maxTime = 0;
  const queue = [{pos: input.start, time: 0, last: 'init', path: ['init']}];  

  function distanceToGoal(pos) {
    return grid.bounds.width - pos.x + grid.bounds.height - pos.y;
  }

  function score(item) {
    return -item.time * distanceToGoal(item.pos); //(item.pos.x + item.pos.y);
  }

  function heuristic(l, r) {
    return score(r) - score(l);
    // const tdiff = l.time - r.time;
    // if (tdiff !== 0) return tdiff;
    // return distanceToGoal(l.pos) - distanceToGoal(r.pos);
  }

  while(queue.length > 0) {
    queue.sort((l, r) => heuristic(l, r));
    const {pos, time, last, path} = queue.shift();

    // log(time, pos, queue.length, distanceToGoal(pos), path.join(', '));
    if (time > maxTime) {
      maxTime = time;
      log('max', maxTime);
    }
    // if (time === 150) break;

    // if(hasVisited(time, pos, path.length)) continue;
    // markVisited(time, pos, path.length);
    if(hasVisited(time, pos, time)) continue;
    markVisited(time, pos, time);

    // const bliz = cachedBliz.get(time);
    

    if (pos.x === input.end.x && pos.y === input.end.y) {
      log('TIME:', time + 1, path);      
      // result = {time:time+1, pos, path: [...path, 'v']};
      result = {time:time+1, pos};
      break;
    }

    let added = 0;
    for(let[dir, move] of Object.entries(DIRS)) {
      const newPos = {x: pos.x + move.x, y: pos.y + move.y};                 
      if (!grid.bounds.contains(newPos.x, newPos.y)) continue;

      // if(bliz.hasKey(keyOf(newPos))) continue;
      // if (time === 0 || time === 1) {
      //   log(time +1, newPos, willBeFree(time+1, newPos));
      // }

      if (!willBeFree(time+1, newPos)) continue;

      // queue.push({pos: newPos, time: time+1, last: dir, path: [...path, dir]});
      queue.push({pos: newPos, time: time+1, last: dir});
      added++;
    }      
    // if(!bliz.hasKey(keyOf(pos))) {
    if (willBeFree(time+1, pos)) {
      added++;
      // queue.push({pos, time: time + 1, last: 'wait', path: [...path, 'wait']});
      queue.push({pos, time: time + 1, last: 'wait'});
    } 
    // if (added === 0) log('cant move');
  }

  if (!result) return `none: ${maxTime}`;
  log('=======');  
  log(result);
  // let p = {x: 0, y: -1};
  // for(let t = 0; t < result.time; t++) {
  //   const dir = result.path[t];
  //   const delta = DIRS[dir];
  //   if (delta) {
  //     p = {x: p.x + delta.x, y: p.y + delta.y};
  //   }
  //   visualize(t, p, cachedBliz.get(t), result.path[t]);
  // }

  return result.time;
}

// using astar - broken
export function part1(input) {

  const {grid} = input;  

  function willBeFree(time, pos) {
    const tox = time * grid.bounds.width;
    const toy = time * grid.bounds.height;
    const fromLeft = (pos.x - time + tox) % grid.bounds.width;
    const fromRight = (pos.x + time + tox) % grid.bounds.width;
    const fromTop = (pos.y -time + toy) % grid.bounds.height;
    const fromBottom = (pos.y + time + toy) % grid.bounds.height;
    
    const checks = [
      {x: fromLeft, y: pos.y, check: '>'},
      {x: fromRight, y: pos.y, check: '<'},
      {x: pos.x, y: fromTop, check: 'v'},
      {x: pos.x, y: fromBottom, check: '^'}
    ];

    for(let d of checks) {
      const value = grid.get(d.x, d.y);      
      if (value === d.check) return false;
    }
    return true;
  }

  const getNeighbors = ({pos, time}) => {    
    const n = [];
    for(let[dir, move] of Object.entries(DIRS)) {
      const newPos = {x: pos.x + move.x, y: pos.y + move.y};                 
      if (!grid.bounds.contains(newPos.x, newPos.y)) continue;

      if (!willBeFree(time+1, newPos)) continue;      
      n.push({pos: newPos, time: time+1});      
    }
    if (willBeFree(time+1, pos)) {
      n.push({pos, time: time+1});
    }    
    return n;
  };

  function distanceToGoal(pos) {
    return grid.bounds.width - pos.x + grid.bounds.height - pos.y;
  }

  const ret = aStar(
    item => `${item.time}|${item.pos.x},${item.pos.y}`,
    {pos: input.start, time: 0}, 
    item => item.pos.x === input.end.x && item.pos.y === input.end.y, 
    getNeighbors, 
    () => 1, 
    item => distanceToGoal(item.pos) 
  );
  log('RET', ret.node.time + 1);
  return ret.node.time + 1;
}

export function part2(input) {

  const {grid} = input;  

  function willBeFree(time, pos) {
    const tox = time * grid.bounds.width;
    const toy = time * grid.bounds.height;
    const fromLeft = (pos.x - time + tox) % grid.bounds.width;
    const fromRight = (pos.x + time + tox) % grid.bounds.width;
    const fromTop = (pos.y -time + toy) % grid.bounds.height;
    const fromBottom = (pos.y + time + toy) % grid.bounds.height;
    
    const checks = [
      {x: fromLeft, y: pos.y, check: '>'},
      {x: fromRight, y: pos.y, check: '<'},
      {x: pos.x, y: fromTop, check: 'v'},
      {x: pos.x, y: fromBottom, check: '^'}
    ];

    for(let d of checks) {
      const value = grid.get(d.x, d.y);      
      if (value === d.check) return false;
    }
    return true;
  }

  const getNeighbors = ({pos, time}) => {    
    const n = [];
    for(let[dir, move] of Object.entries(DIRS)) {
      const newPos = {x: pos.x + move.x, y: pos.y + move.y};                 
      if (!grid.bounds.contains(newPos.x, newPos.y)) continue;

      if (!willBeFree(time+1, newPos)) continue;      
      n.push({pos: newPos, time: time+1});      
    }
    if (willBeFree(time+1, pos)) {
      n.push({pos, time: time+1});
    }    
    return n;
  };

  function distanceToGoal(pos) {
    return grid.bounds.width - pos.x + grid.bounds.height - pos.y;
  }

  let totalTime = 0;
  const forward = aStar(
    item => `${item.time}|${item.pos.x},${item.pos.y}`,
    {pos: input.start, time: 0}, 
    item => item.pos.x === input.end.x && item.pos.y === input.end.y, 
    getNeighbors, 
    () => 1, 
    item => distanceToGoal(item.pos) 
  );
    
  totalTime += forward.node.time + 1;

  const backwards = aStar(
    item => `${item.time}|${item.pos.x},${item.pos.y}`,
    {pos: {x: input.end.x, y: input.end.y + 1}, time: totalTime}, 
    item => item.pos.x === input.start.x && item.pos.y === input.start.y+1, 
    getNeighbors, 
    () => 1, 
    item => distanceTo(item.pos, input.start)
  );
  
  totalTime = backwards.node.time + 1;

  const oneMoreTime = aStar(
    item => `${item.time}|${item.pos.x},${item.pos.y}`,
    {pos: input.start, time: totalTime}, 
    item => item.pos.x === input.end.x && item.pos.y === input.end.y, 
    getNeighbors, 
    () => 1, 
    item => distanceToGoal(item.pos) 
  );
  log(oneMoreTime);


  return oneMoreTime.node.time + 1;
}    
function distanceTo(from, to) {
  return Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
}

function wrappedAdd(cur, delta, bounds) {
  return {
    ...cur,
    x: (cur.x + delta.x + bounds.width) % bounds.width,
    y: (cur.y + delta.y + bounds.height) % bounds.height
  };
}

function keyOf(pos) {
  return `${pos.x},${pos.y}`;
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
    hasKey(key) {
      return cache.has(key);
    },
    values() {
      return Array.from(cache.values()).flatMap(x => x);
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