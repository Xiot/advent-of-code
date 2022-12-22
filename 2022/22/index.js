
import { autoParse, log, createGridMap, loadGrid, visualizeGrid, pointsWithin } from "../../utils";
import _ from 'lodash';

const RE = /(\d+|[RL])/g;

export const parse = text => {
  const [map, instructions] = text.split('\n\n');
  return {map: map.split('\n'), instructions};
};

export function part1(input) {  
  const grid = loadGrid(input.map, ' ');
  const ops = Array.from(input.instructions.matchAll(RE)).map(x => isNaN(x[0]) ? x[0] : parseInt(x[0]));
  
  const startPos = findStart(grid);
  
  let dir = 'east';
  let pos = startPos;
  grid.set(pos.x, pos.y, ICONS[dir]);

  for(let op of ops) {
    if (typeof op === 'number') {
      pos = move(grid, pos, dir, op);  
    } else {
      dir = rotate(dir, op);
      grid.set(pos.x, pos.y, ICONS[dir]);
    }
  }
  
  log(pos);
  console.log(
    visualizeGrid(grid, (x, y) => grid.get(x, y))
  );

  return 1000 * (pos.y+1) + 4* (pos.x+1) + DIRS.indexOf(dir);
}

export function part3(input) {  
  if (global.args.inputName !== 'sample.txt') {
    throw new Error('only works with sample');
  }

  const SIZE = 4;  
  const OPPOSITE = findOppositeEdge3dInput;

  const cube = {
    size: SIZE,
    SIZE,
    top: loadMapFaceTest(input.map, SIZE*2, 0, SIZE),
    front: loadMapFaceTest(input.map, SIZE*2, SIZE, SIZE),
    left: loadMapFaceTest(input.map, SIZE, SIZE, SIZE),
    back: loadMapFaceTest(input.map, 0, SIZE, SIZE),
    bottom: loadMapFaceTest(input.map, SIZE*2, SIZE*2, SIZE),
    right: loadMapFaceTest(input.map, SIZE*3, SIZE*2, SIZE),
    opposite: OPPOSITE
  };

  if (OPPOSITE === findOppositeEdge3dSample) {
    test(cube, p('top', 'north', 2, 0), p('back', 'south',1, 0));
    test(cube, p('top', 'east', 3, 1), p('right', 'west', 3, 2));
    test(cube, p('top', 'south', 1, 3), p('front', 'south', 1, 0));
    test(cube, p('top', 'west', 0, 1), p('left', 'south', 1, 0));

    test(cube, p('front', 'north', 2, 0), p('top', 'north', 2, 3));
    test(cube, p('front', 'east', 3, 1), p('right', 'south', 2, 0));
    test(cube, p('front', 'south', 1, 3), p('bottom', 'south', 1, 0));
    test(cube, p('front', 'west', 0, 1), p('left', 'west', 3, 1));

    test(cube, p('left', 'north', 2, 0), p('top', 'east', 0, 2));
    test(cube, p('left', 'east', 3, 1), p('front', 'east', 0, 1));
    test(cube, p('left', 'south', 1, 3), p('bottom', 'east', 0, 2));
    test(cube, p('left', 'west', 0, 1), p('back', 'west', 3, 1));

    test(cube, p('right', 'north', 2, 0), p('front', 'west',3, 1));
    test(cube, p('right', 'east', 3, 1), p('top', 'west', 3, 2));
    test(cube, p('right', 'south', 1, 3), p('back', 'east', 0, 2));
    test(cube, p('right', 'west', 0, 1), p('bottom', 'west', 3, 1));

    test(cube, p('back', 'north', 2, 0), p('top', 'south',1, 0));
    test(cube, p('back', 'east', 3, 1), p('left', 'east', 0, 1));
    test(cube, p('back', 'south', 1, 3), p('bottom', 'north', 2, 3));
    test(cube, p('back', 'west', 0, 1), p('right', 'north', 2, 3));

    test(cube, p('bottom', 'north', 2, 0), p('front', 'north',2, 3));
    test(cube, p('bottom', 'east', 3, 1), p('right', 'east', 0, 1));
    test(cube, p('bottom', 'south', 1, 3), p('back', 'north', 2, 3));
    test(cube, p('bottom', 'west', 0, 1), p('left', 'north', 2, 3));
  } else {
    test(cube, p('top', 'north', 2, 0), p('back', 'east', 0, 2));
    test(cube, p('top', 'east', 3, 1), p('right', 'east', 0, 1));
    test(cube, p('top', 'south', 1, 3), p('front', 'south', 1, 0));
    test(cube, p('top', 'west', 0, 1), p('left', 'east', 0, 2));

    test(cube, p('front', 'north', 2, 0), p('top', 'north', 2, 3));
    test(cube, p('front', 'east', 3, 1), p('right', 'north', 1, 3));
    test(cube, p('front', 'south', 1, 3), p('bottom', 'south', 1, 0));
    test(cube, p('front', 'west', 0, 1), p('left', 'south', 1, 0));

    test(cube, p('left', 'north', 2, 0), p('front', 'east', 0, 2));
    test(cube, p('left', 'east', 3, 1), p('bottom', 'east', 0, 1));
    test(cube, p('left', 'south', 1, 3), p('back', 'south', 1, 0));
    test(cube, p('left', 'west', 0, 1), p('top', 'east', 0, 2));

    test(cube, p('right', 'north', 2, 0), p('back', 'north', 2, 3));
    test(cube, p('right', 'east', 3, 1), p('bottom', 'west', 3, 2));
    test(cube, p('right', 'south', 1, 3), p('front', 'west', 3, 1));
    test(cube, p('right', 'west', 0, 1), p('top', 'west', 3, 1));

    test(cube, p('back', 'north', 2, 0), p('left', 'north', 2, 3));
    test(cube, p('back', 'east', 3, 1), p('bottom', 'north', 1, 3));
    test(cube, p('back', 'south', 1, 3), p('right', 'south', 1, 0));
    test(cube, p('back', 'west', 0, 1), p('top', 'south', 1, 0));

    test(cube, p('bottom', 'north', 2, 0), p('front', 'north', 2, 3));
    test(cube, p('bottom', 'east', 3, 1), p('right', 'west', 3, 2));
    test(cube, p('bottom', 'south', 1, 3), p('back', 'west', 3, 1));
    test(cube, p('bottom', 'west', 0, 1), p('left', 'west', 3, 1));
  }
  log('SUCCESS');
}

function p(side, dir, x, y) {
  return {side, x, y, dir};
}

function test(cube, pos, expect) {
  const actual = stepOne3d(cube, pos);
  const valid = _.isEqual(actual, expect);
  if (!valid) {    
    log('FAIL\n', 'pos', pos, '\n', 'actual', actual, '\n', 'expected', expect, '\n');
    throw new Error();
  }
}

export function part2(input) {
  let ops = Array.from(input.instructions.matchAll(RE)).map(x => isNaN(x[0]) ? x[0] : parseInt(x[0]));  

  const isSample = global.args.inputName === 'sample.txt';

  const SIZE = isSample ? 4 : 50;

  const cube =  isSample ? {
    size: SIZE,
    SIZE,    
    top: loadMapFace(input.map, SIZE*2, 0, SIZE),
    front: loadMapFace(input.map, SIZE*2, SIZE, SIZE),
    left: loadMapFace(input.map, SIZE, SIZE, SIZE),
    back: loadMapFace(input.map, 0, SIZE, SIZE),
    bottom: loadMapFace(input.map, SIZE*2, SIZE*2, SIZE),
    right: loadMapFace(input.map, SIZE*3, SIZE*2, SIZE),
    opposite: findOppositeEdge3dSample
  } : {
    size: SIZE,
    SIZE,
    top: loadMapFace(input.map, SIZE, 0, SIZE),
    right: loadMapFace(input.map, SIZE*2, 0, SIZE),
    front: loadMapFace(input.map, SIZE, SIZE, SIZE),
    left: loadMapFace(input.map, 0, SIZE*2, SIZE),
    bottom: loadMapFace(input.map, SIZE, SIZE*2, SIZE),
    back: loadMapFace(input.map, 0, SIZE*3, SIZE),
    opposite: findOppositeEdge3dInput
  };

  const start = {side: 'top', dir: 'east', x: 0, y: 0};
  let pos = start;

  cube[start.side].set(start.x, start.y, ICONS[start.dir]);

  for(let op of ops) {    
    if (typeof op === 'number') {
      pos = move3d(cube, pos, op);
    } else {
      pos.dir = rotate(pos.dir, op);
      cube[pos.side].set(pos.x, pos.y, ICONS[pos.dir]);
    }    
  }

  cube[pos.side].set(pos.x, pos.y, 'E');

  const combined = createGridMap(' ');
  if (isSample) {
    combine(combined, cube.top, SIZE*2, 0);
    combine(combined, cube.front, SIZE*2, SIZE);
    combine(combined, cube.back, 0, SIZE);
    combine(combined, cube.left, SIZE, SIZE);
    combine(combined, cube.bottom, SIZE*2, SIZE*2);
    combine(combined, cube.right, SIZE*3, SIZE*2);
  } else {
    combine(combined, cube.top, SIZE, 0);
    combine(combined, cube.right, SIZE*2, 0);
    combine(combined, cube.front, SIZE, SIZE);
    combine(combined, cube.left, 0, SIZE*2);
    combine(combined, cube.bottom, SIZE, SIZE*2);
    combine(combined, cube.back, 0, SIZE*3);

  }

  console.log(
    visualizeGrid(combined, (x, y) => combined.get(x, y), {printRowNumbers: true})
  );

  log(pos);
  const finalRelative = Array.from(combined.entries()).find(([p, v]) => v === 'E')[0];
  log('f', finalRelative);

  return 1000 * (finalRelative.y + 1) + 4 * (finalRelative.x + 1) + DIRS.indexOf(pos.dir);
}    

function combine(target, source, ox, oy) {
  for(let [x,y] of pointsWithin(source)) {
    const value = source.get(x, y);
    if (value === ' ') continue;
    target.set(ox + x, oy + y, value);
  }
}


function loadMapFaceTest(map, ox, oy, size) {
  const grid = createGridMap(' ');
  for(let x = 0; x < size; x++) {
    for(let y = 0; y < size; y++) {      
      let value = map[y+oy][x+ox];
      if (value === '#') value = '.';
      grid.set(x, y, value);
    }
  }
  return grid;
}

function loadMapFace(map, ox, oy, size) {
  const grid = createGridMap(' ');
  for(let x = 0; x < size; x++) {
    for(let y = 0; y < size; y++) {
      const value = map[y+oy][x+ox];      
      grid.set(x, y, value);
    }
  }
  return grid;
}


const DIRS = [
  'east',
  'south',
  'west',
  'north'
];

const DELTA = {
  east: {x: 1, y: 0},
  south: {x: 0, y: 1},
  west: {x: -1, y: 0},
  north: {x: 0, y: -1}
};

function rotate(facing, dir) {
  const facingIndex = DIRS.indexOf(facing);
  const a = dir === 'R' ? 1 : -1;
  const index = (facingIndex + a + DIRS.length) % DIRS.length;
  return DIRS[index];
}

function findStart(grid) {
  for (let x = 0; x < grid.bounds.right; x++) {
    if (grid.get(x, 0) === '.') return {x, y:0};
  }
  return undefined;
}

function move(grid, start, dir, steps) {
  
  let pos = start;
  log('move', start, dir, steps);
  for(let i = 0; i < steps; i++) {
    const n = stepOne(grid, pos, dir);
    if (n == null) break;
    grid.set(n.x, n.y, ICONS[dir]);
    pos = n;
  }
  return pos;
}

function stepOne(grid, start, dir) {
  const delta = DELTA[dir];  
  let pos = add(start, delta);

  let value = grid.get(pos.x, pos.y);
  
  if (value === '#') {
    return null;
  }

  if (value === ' ') {
    const edge = findOppositeEdge(grid, pos, dir);
    log('opp', value, pos, edge);
    if (edge.x === 50 && edge.y === -1)
      throw new Error('boom');
    return stepOne(grid, edge, dir);
  }
  return pos;
}

function add(l, r) {
  return {x: l.x+r.x, y: l.y+r.y};
}

function findOppositeEdge(grid, pos, dir) {
  const dirIndex = DIRS.indexOf(dir);
  const oppositeIndex = (dirIndex + 2) % DIRS.length;
  log('op', dir,DIRS[oppositeIndex],  DELTA[DIRS[oppositeIndex]]);
  const delta = DELTA[DIRS[oppositeIndex]];
  
  while(true) {
    let newPos = add(pos, delta);
    log('ss', newPos, `|${grid.get(newPos.x, newPos.y) ?? ' '}|`);
    if ((grid.get(newPos.x, newPos.y) ?? ' ') === ' ') return newPos;
    pos = newPos;
  }  
}

const ICONS = {
  'east': '>',
  'west': '<',
  'north': '^',
  'south': 'V'
};

// 3d
function move3d(cube, start, steps) {
  let pos = start;
  for(let i = 0; i < steps; i++) {
    const n = stepOne3d(cube, pos);    

    if (n == null) break;
    cube[n.side].set(n.x, n.y, ICONS[n.dir]);
    pos = n;
  }
  return pos;
}
function stepOne3d(cube, start) {
  const delta = DELTA[start.dir];
  let pos = add3d(start, delta);
  let value = cube[pos.side].get(pos.x, pos.y);
  if (value === '#') {
    return null;
  }
  if (value === ' ') {
    const edge = cube.opposite(cube, start);    
    if (cube[edge.side].get(edge.x, edge.y) === '#') {      
      return null;
    }
    return edge;
  }
  return pos;
}

function add3d(l, r) {
  return {side: l.side, dir: l.dir, x: l.x+r.x, y: l.y+r.y};
}

function findOppositeEdge3dInput(cube, pos) {
  switch(pos.side) {
  case 'top':
    switch(pos.dir) {
    case 'east': return {side: 'right', x: 0, y: pos.y, dir: 'east' };
    case 'west': return {side: 'left', x: 0, y: cube.SIZE - 1 - pos.y, dir: 'east' };
    case 'north': return {side: 'back', x: 0, y: pos.x, dir: 'east'};
    case 'south': return {side: 'front', x: pos.x, y: 0, dir: 'south'};
    }  
    break;
  case 'front':
    switch(pos.dir) {
    case 'east': return {side: 'right', x: pos.y, y: cube.SIZE -1, dir: 'north' };
    case 'west': return {side: 'left', x: pos.y, y: 0, dir: 'south' };
    case 'north': return {side: 'top', x: pos.x, y: cube.SIZE-1, dir: 'north'};
    case 'south': return {side: 'bottom', x: pos.x, y: 0, dir: 'south'};
    }
    break;
  case 'left':
    switch(pos.dir) {
    case 'east': return {side: 'bottom', x: 0, y: pos.y, dir: 'east' };
    case 'west': return {side: 'top', x: 0, y: cube.SIZE -1 -pos.y, dir: 'east' };
    case 'north': return {side: 'front', x: 0, y: pos.x, dir: 'east'};
    case 'south': return {side: 'back', x: pos.x, y: 0, dir: 'south'};
    }
    break;
  case 'right':
    switch(pos.dir) {
    case 'east': return {side: 'bottom', x: cube.SIZE-1, y: cube.SIZE-1-pos.y, dir: 'west' };
    case 'west': return {side: 'top', x: cube.SIZE -1, y: pos.y, dir: 'west' };
    case 'north': return {side: 'back', x: pos.x, y: cube.SIZE -1, dir: 'north'};
    case 'south': return {side: 'front', x: cube.SIZE-1, y: pos.x, dir: 'west'};
    }
    break;
  case 'back':
    switch(pos.dir) {
    case 'east': return {side: 'bottom',x: pos.y, y: cube.SIZE-1, dir: 'north' };
    case 'west': return {side: 'top', x: pos.y, y: 0, dir: 'south' };
    case 'north': return {side: 'left', x: pos.x, y: cube.SIZE - 1, dir: 'north'};
    case 'south': return {side: 'right', x: pos.x, y: 0, dir: 'south'};
    }
    break;
  case 'bottom':
    switch(pos.dir) {
    case 'east': return {side: 'right', x: cube.SIZE-1, y: cube.SIZE -1 - pos.y, dir: 'west' };
    case 'west': return {side: 'left', x: cube.SIZE -1, y: pos.y, dir: 'west' };
    case 'north': return {side: 'front', x: pos.x, y: cube.SIZE - 1, dir: 'north'};
    case 'south': return {side: 'back', x: cube.SIZE-1, y: pos.x, dir: 'west'};
    }
    break;
  }
}

function findOppositeEdge3dSample(cube, pos) {
  switch(pos.side) {
  case 'top':
    switch(pos.dir) {
    case 'east': return {side: 'right', x: cube.SIZE-1,y: cube.SIZE-1-pos.y, dir: 'west' };
    case 'west': return {side: 'left', x: pos.y, y: 0, dir: 'south' };
    case 'north': return {side: 'back', x: cube.SIZE-1 - pos.x, y: 0, dir: 'south'};
    case 'south': return {side: 'front', x: pos.x, y: 0, dir: 'south'};
    }  
    break;
  case 'front':
    switch(pos.dir) {
    case 'east': return {side: 'right', x: cube.SIZE-1 - pos.y, y: 0, dir: 'south' };
    case 'west': return {side: 'left', x: cube.SIZE -1, y: pos.y, dir: 'west' };
    case 'north': return {side: 'top', x: pos.x, y: cube.SIZE-1, dir: 'north'};
    case 'south': return {side: 'bottom', x: pos.x, y: 0, dir: 'south'};
    }
    break;
  case 'left':
    switch(pos.dir) {
    case 'east': return {side: 'front', x: 0, y: pos.y, dir: 'east' };
    case 'west': return {side: 'back', x: cube.SIZE -1, y: pos.y, dir: 'west' };
    case 'north': return {side: 'top', x: 0, y: pos.x, dir: 'east'};
    case 'south': return {side: 'bottom', x: 0, y: cube.SIZE - 1- pos.x, dir: 'east'};
    }
    break;
  case 'right':
    switch(pos.dir) {
    case 'east': return {side: 'top',x: cube.SIZE-1,y: cube.SIZE-1-pos.y, dir: 'west' };
    case 'west': return {side: 'bottom', x: cube.SIZE -1, y: pos.y, dir: 'west' };
    case 'north': return {side: 'front', x: cube.SIZE-1, y: cube.SIZE -1 - pos.x, dir: 'west'};
    case 'south': return {side: 'back', x: 0, y: cube.SIZE - 1- pos.x, dir: 'east'};
    }
    break;
  case 'back':
    switch(pos.dir) {
    case 'east': return {side: 'left',x: 0, y: pos.y, dir: 'east' };
    case 'west': return {side: 'right', x: cube.SIZE -1 - pos.y, y: cube.SIZE - 1, dir: 'north' };
    case 'north': return {side: 'top', x: cube.SIZE-1 - pos.x, y: 0, dir: 'south'};
    case 'south': return {side: 'bottom', x: cube.SIZE - 1 - pos.x, y: cube.SIZE - 1, dir: 'north'};
    }
    break;
  case 'bottom':
    switch(pos.dir) {
    case 'east': return {side: 'right',x: 0, y: pos.y, dir: 'east' };
    case 'west': return {side: 'left', x: cube.SIZE -1 - pos.y, y: cube.SIZE - 1, dir: 'north' };
    case 'north': return {side: 'front', x: pos.x, y: cube.SIZE - 1, dir: 'north'};
    case 'south': return {side: 'back', x: cube.SIZE - 1 - pos.x, y: cube.SIZE - 1, dir: 'north'};
    }
    break;
  }
}