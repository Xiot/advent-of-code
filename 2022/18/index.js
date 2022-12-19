
import { autoParse, log, byLine, createCube, visualizeGrid, pointsWithin, range, extendBounds } from "../../utils";

export const parse = byLine(line => line.split(',').map(d => parseInt(d)));

function* neighbors() {
  yield [-1, 0, 0];
  yield [1, 0, 0];
  yield [0, -1, 0];
  yield [0, 1, 0];
  yield [0,0,-1];
  yield [0,0,1];
}

export function part1(input) {
  const cube = createCube(' ');
  for(let [x,y,z] of input) {
    cube.set(x, y, z, '#');
  }
  cube.recalculateBounds();

  let sides = 0;

  for(let [x,y,z] of pointsWithin(cube)) {
    if (!cube.has(x, y, z)) continue;
    for(let [dx, dy, dz] of neighbors()) {
      if (!cube.has(x+dx, y+dy,z+dz)) {
        sides++;
      }
    }
  }

  return sides;
}


function canEscape(cube, sx, sy, sz) {

  let bounds = extendBounds(cube.bounds, -1, -1, 1, 1, -1, 1);
  const queue = [{x: sx,y: sy,z:sz}];

  let visited = new Map();
  const keyOf = (x, y,z) => `${x},${y},${z}`;

  while(queue.length > 0) {
    const {x,y,z} = queue.shift();
    if (visited.has(keyOf(x,y,z))) continue;
    visited.set(keyOf(x,y,z), true);

    if (cube.has(x, y, z)) continue;

    if (x === bounds.left || x === bounds.right) return true;
    if (y === bounds.top || y === bounds.top) return true;
    if (z === bounds.zMin || z === bounds.zMax) return true;

    for(let [dx, dy, dz] of neighbors()) {
      queue.push({x: x+dx, y: y+dy, z: z+dz});
    }
  }

  return false;
}

export function part2(input) {

  const cube = createCube(' ');
  for(let [x,y,z] of input) {
    cube.set(x, y, z, '#');
  }
  cube.recalculateBounds();

  let sides =0;
  let bounds = extendBounds(cube.bounds, -1, -1, 1, 1, -1, 1);
  for(let [x,y,z] of pointsWithin(bounds)) {
    if (!cube.has(x, y, z)) continue;
    
    let cubeSides = 0;

    // x
    cubeSides += canEscape(cube, x-1,y,z) ? 1 : 0;
    cubeSides += canEscape(cube, x+1,y,z) ? 1 : 0;

    // y
    cubeSides += canEscape(cube, x,y-1,z) ? 1 : 0;
    cubeSides += canEscape(cube, x,y+1,z) ? 1 : 0;

    // z
    cubeSides += canEscape(cube, x,y,z-1) ? 1 : 0;
    cubeSides += canEscape(cube, x,y,z+1) ? 1 : 0;

    log(x,y,z, cubeSides);

    sides += cubeSides;
  }

  for(let z = cube.bounds.zMin; z <= cube.bounds.zMax; z++) {
    console.log(z, '-----');
    console.log(
      visualizeGrid(cube, (x, y) => cube.get(x, y, z))
    );
  }

  return sides;
}    
