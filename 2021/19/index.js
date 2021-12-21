
import { autoParse, boundsOfGrid, combinations, createBounds, createGridMap, log, range } from "../../utils";
import { isEqual } from "lodash";

const ROTATIONS = {
  none: 0,
  one: 1,
  two: 2,
  three: 3
};

/*
Here was my basic approach:
1. BFS starting with the first section
2. calculate the distance between all of the points within a scanner.
3. use those distances to check if points overlap
4. If they overlap calculate the offset and rotation,
  a. take the matching pair from both sides and get their vector
  b. Rotate the vector until it matches the other to determine the scanner orientation
  c. offset of the scanner is calculated by subtracting one of the matched points (after rotation) with the same point on the first scanner. 
5. if they overlap, update all of the points to match scanner 0, and add it to the BFS to search for more matches
*/

export const parse = text => text.split('\n\n').map(section => {
  const [header, ...lines] = section.split('\n');
  const [,id] = /scanner ([0-9]+)/i.exec(header);

  const beacons = lines.map((l) => {
    const [,x,y,z] = /(-?[0-9]+),(-?[0-9]+)(?:,(-?[0-9]+))?/.exec(l);
    return {
      x: parseInt(x),
      y: parseInt(y),
      z: z != null ? parseInt(z) : 0
    };
  });
  return {
    id: parseInt(id),
    beacons
  };
});

const vsub = (v1, v2) => {
  return {
    x: v1.x - v2.x,
    y: v1.y - v2.y,
    z: v1.z - v2.z
  };
};
const vadd = (l, r) => {
  return {
    x: l.x + r.x,
    y: l.y + r.y,
    z: l.z + r.z
  };
};

function buildPossibles() {
  const rotations = [];
  const visited = new Map();
  const keyOf = ({x, y, z}) => `${x},${y},${z}`;

  const testPoint = {x: 1, y: 2, z: 3};

  const lookup = {};

  for(let x of range(0, 3)) {
    for(let y of range(0, 3)) {
      for(let z of range(0, 3)) {

        const rotator = rotate({x,y,z});
        const result = rotator(testPoint);
        if (!visited.has(keyOf(result))) {
          visited.set(keyOf(result), {x, y, z});
          lookup[keyOf({x,y,z})] = {x,y,z};
          rotations.push({
            rotation: {x,y,z},
            rotator: rotator,
          });
        } else {
          const t = visited.get(keyOf(result));
          lookup[keyOf({x,y,z})] = t;
        }
      }
    }
  }

  rotations.lookup = ({x=0,y=0,z=0}) => {
    return lookup[keyOf({x,y,z})];
  };

  return rotations;
}

/*
identity
0,2,0
4,1,0
3,3,0

x:1
0,0,2
4,0,1
3,0,3
*/
export function part1(input) {

  const possibles = buildPossibles();

  const rotateBy = ({x = 0, y = 0, z = 0}) => {
    const accessor = rotateAccessor(identity)({x,y,z});
    return accessor;
  };

  const test = input.map((d) => {
    return {
      id: d.id,
      beacons: [...d.beacons],
      originalBeacons: d.beacons,      
    };
  });

  const distanceBetween = (p1, p2) => Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y,2) + Math.pow(p2.z - p1.z,2);

  const distanceMap = points => {
    const lookup = [];
    for(let i = 0; i < points.length - 1; i++) {
      for(let j = i+1; j < points.length; j++) {
        lookup.push({
          fromIndex: i,
          from: points[i],
          toIndex: j,
          to: points[j],
          distance: distanceBetween(points[i], points[j])
        });
      }
    }
    return {
      byIndex: (i1, i2) => lookup.find(x => (x.from ===i1 && x.to === i2) || (x.from === i2 && x.to === i1)),
      byDistance: distance => lookup.find(x => x.distance === distance),
      raw: lookup
    }; 
  };

  const findOverlap = (left, right) => {
    const sourceDistances = distanceMap(left.beacons);
    const targetDistances = distanceMap(right.beacons);

    const foundLeft = new Set();
    const foundRight = new Set();
    const mappings = [];

    for(let relative of sourceDistances.raw) {
      const found = targetDistances.byDistance(relative.distance);
      if (found) {
        foundLeft.add(relative.from);
        foundLeft.add(relative.to);
        foundRight.add(found.from);
        foundRight.add(found.to);

        const vectorRight = vsub(found.to, found.from);
        const vectorLeft = vsub(relative.to, relative.from);
        
        mappings.push({
          left: {
            from: {
              point: relative.from,
              index: relative.fromIndex
            },
            to: {
              point: relative.to,
              index: relative.toIndex,
            },
            vector: vectorLeft
          },
          right: {
            from: {
              point: found.from,
              index: found.fromIndex
            },
            to: {
              point: found.to,
              index: found.toIndex,
            },
            vector: vectorRight
          },
        });
      }
    }
    if (foundLeft.size < 12) return null;

    const m = mappings[0];
    
    let r = possibles.find(p => isEqual(m.left.vector, p.rotator(m.right.vector)));
    if (!r) {      
      // If we couldn't find a rotation that matches, then the points were probably reversed.
      // flip them around and try again
      const t = m.right.from;
      m.right.from  = m.right.to;
      m.right.to = t;
      m.right.vector = vsub(m.right.to.point, m.right.from.point);
      r = possibles.find(p => isEqual(m.left.vector, p.rotator(m.right.vector)));
    }

    const rotatedRightFrom = r.rotator(m.right.from.point);

    return {
      from: left,
      to: right,
      offset: vsub(m.left.from.point, rotatedRightFrom),
      rotation: r?.rotation,
    };
  };

  const hasLink = [];
  const discovered = new Set();
  
  const pointKey = ({x,y,z}) => `${x},${y},${z}`;

  const stack = [0];
  const final = new Set();

  for(let p of test[0].originalBeacons) {
    final.add(pointKey(p));
  }

  while(stack.length > 0 ) {

    const idx = stack.shift();
    if(discovered.has(idx)) continue;
    discovered.add(idx);
    
    for(let i = 0; i < test.length; i++) {
      if (idx === i || discovered.has(i)) continue;
            
      const o = findOverlap(test[idx], test[i]);
      if (o) {
    
        const rotator = rotateBy(o.rotation);
        test[i].beacons = test[i].beacons.map(x => {
          return vadd(o.offset, rotator(x));
        });
        test[i].beacons.forEach(b => {
          final.add(pointKey(b));
        });
        stack.push(i);
        hasLink.push({from: test[idx], to: test[i], offset: o.offset, rotation: o.rotation});
      }
    }
  }
  
  log('links');
  hasLink.forEach(x => {
    log( `${x.from.id} -> ${x.to.id}`, x.offset, x.rotation);
  });

  return final.size;
}


export function part2(input) {

  const possibles = buildPossibles();

  const rotateBy = ({x = 0, y = 0, z = 0}) => {
    const n = possibles.lookup({x,y,z});
    const accessor = rotateAccessor(identity)({x,y,z});
    return accessor;
  };

  const x1r = rotateBy({x: 1});

  // log('0x1', input[0].beacons.map(x1r));

  // const x3r = rotateBy({x: 3});
  // const r1 = x1r({x:4,y:1,z:0});
  // log('rotate x:1:', r1);
  // log('rotate.b', x3r(r1));
  // log('input', input);

  // const p = [
  //   {x: 0, y: 2, z:0},
  //   {x: 4, y:1, z:0},
  //   {x: 3, y:3, z:0}
  // ];
  // const rotateX90 = rotateXAccessor(identity, ROTATIONS.one);
  // const rotateX270 = rotateXAccessor(identity, ROTATIONS.three);
  // log('normal', p);
  // log('x90', p.map(rotateX90));
  // log('xback', p.map(rotateX270).map(rotateX90));

  const data = input.map(x => {
    const grid = createGridMap();
    for(let beacon of x.beacons) {
      grid.set(beacon.x, beacon.y, 'B');
    }

    const normalized = normalize(x.beacons);

    return {
      id: x.id,
      pos: null,
      rotation: null,
      beacons: {
        original: x.beacons,
        normalized: normalized,
      },
      grid
    };
  });

  
  // log(possibles.length, possibles);
  
  const test = data.map((d, i) => {
    return {
      id: d.id,
      beacons: d.beacons.original,
      originalBeacons: d.beacons.original,
      offsetTo0: null,
      states: i === 0 
        ? {rotation: {x: 0, y: 0, z: 0}, rotator: identity} 
        : possibles.map(p => {
          return {
            rotation: p.rotation,
            rotator: p.rotator,
            beaconAt(index) {
              return d.beacons.original[index].map(b => p.rotator(b));
            },
            beacons() {
              return d.beacons.original.map(b => p.rotator(b));
            // return normalize(
            //   d.beacons.original.map(b => p.rotator(b))
            // );
            }
          };
        })        
    };
  });

  const distanceBetween = (p1, p2) => Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y,2) + Math.pow(p2.z - p1.z,2);

  const distanceMap = points => {
    const lookup = [];
    for(let i = 0; i < points.length - 1; i++) {
      for(let j = i+1; j < points.length; j++) {
        lookup.push({
          fromIndex: i,
          from: points[i],
          toIndex: j,
          to: points[j],
          distance: distanceBetween(points[i], points[j])
        });
      }
    }
    return {
      byIndex: (i1, i2) => lookup.find(x => (x.from ===i1 && x.to === i2) || (x.from === i2 && x.to === i1)),
      byDistance: distance => lookup.find(x => x.distance === distance),
      raw: lookup
    }; 
  };

  // log();
  const w = possibles.lookup({x: 3, y: 0, z: 0});

  // -618,-824,-621
  // -537,-823,-458

  // const source = test[0];
  // const p01 = {x:-618,y:-824,z:-621};
  // const p02 = {x: -537, y: -823, z: -458};
  // const p11 = {x:686,y:422,z:578};
  // const p12 = {x:605,y:423,z: 415};
  // const d = distanceBetween(p01, p02);
  // const d2 = distanceBetween(p11, p12);
  // log(d, d2, d === d2);

  // for(let i = 0; i < test.length - 1; i++) {

  const findOverlap = (left, right) => {
    const sourceDistances = distanceMap(left.beacons);
    const targetDistances = distanceMap(right.beacons);

    const foundLeft = new Set();
    const foundRight = new Set();
    const mappings = [];

    for(let relative of sourceDistances.raw) {
      const found = targetDistances.byDistance(relative.distance);
      if (found) {
        foundLeft.add(relative.from);
        foundLeft.add(relative.to);
        foundRight.add(found.from);
        foundRight.add(found.to);

        const vectorRight = {
          x: found.to.x - found.from.x,
          y: found.to.y - found.from.y,
          z: found.to.z - found.from.z
        };

        const vectorLeft = {
          x: relative.to.x - relative.from.x,
          y: relative.to.y - relative.from.y,
          z: relative.to.z - relative.from.z,
        };

        mappings.push({
          left: {
            from: {
              point: relative.from,
              index: relative.fromIndex
            },
            to: {
              point: relative.to,
              index: relative.toIndex,
            },
            vector: vectorLeft
          },
          right: {
            from: {
              point: found.from,
              index: found.fromIndex
            },
            to: {
              point: found.to,
              index: found.toIndex,
            },
            vector: vectorRight
          },
        });
      }
    }
    if (foundLeft.size < 12) return null;

    const m = mappings[0]; //mappings.find(m => m.left.from.index === 4 && m.left.to.index === 9);    
    
    let r = possibles.find(p => isEqual(m.left.vector, p.rotator(m.right.vector)));
    if (!r) {
      
      const t = m.right.from;
      m.right.from  = m.right.to;
      m.right.to = t;
      m.right.vector = vsub(m.right.to.point, m.right.from.point);
      r = possibles.find(p => isEqual(m.left.vector, p.rotator(m.right.vector)));
    }

    const rotatedRightTo = r.rotator(m.right.to.point);
    const rotatedRightFrom = r.rotator(m.right.from.point);
    // log('m', m.left.to, rotatedRightFrom, rotatedRightTo);
    // log('v', vsub(m.left.from.point, rotatedRightFrom));
    return {
      from: left,
      to: right,
      offset: vsub(m.left.from.point, rotatedRightFrom),
      rotation: r?.rotation,
    };
  };

  // const overlap = findOverlap(test[0], test[1]);
  // log('overlap', !!overlap, overlap.rotation);
  

  const hasLink = [];
  const discovered = new Set();
  
  const pointKey = ({x,y,z}) => `${x},${y},${z}`;

  const stack = [0];
  const final = new Set();

  for(let p of test[0].originalBeacons) {
    final.add(pointKey(p));
  }

  while(stack.length > 0 ) {

    const idx = stack.shift();
    if(discovered.has(idx)) continue;
    discovered.add(idx);
    // log('idx', idx);
    for(let i = 0; i < test.length; i++) {
      if (idx === i || discovered.has(i)) continue;
            
      const o = findOverlap(test[idx], test[i]);
      if (o) {
        // log('find overlap', idx, i);
        const rotator = rotateBy(o.rotation);
        test[i].beacons = test[i].beacons.map(x => {
          return vadd(o.offset, rotator(x));
        });
        test[i].beacons.forEach(b => {
          final.add(pointKey(b));
        });
        stack.push(i);
        hasLink.push({from: test[idx], to: test[i], offset: o.offset, rotation: o.rotation});
      }
    }
  }
  
  log('links');
  hasLink.forEach(x => {
    log( `${x.from.id} -> ${x.to.id}`, x.offset, x.rotation);
  });


  let maxDistance = 0;
  for(let i = 0; i < hasLink.length-1; i++) {
    for(let j = i+1; j < hasLink.length; j++) {
      const l = hasLink[i].offset;
      const r = hasLink[j].offset;
      const distance = Math.abs(l.x - r.x) + Math.abs(l.y - r.y) + Math.abs(l.z - r.z); //Math.sqrt( distanceBetween(hasLink[i].offset, hasLink[j].offset));
      log(i,j, distance, l, r);
      if (distance > maxDistance) {
        maxDistance = distance;
      }
    }
  }
  return maxDistance;

  // const extract = l => {
  //   const [,x,y,z] = /(-?[0-9]+),(-?[0-9]+)(?:,(-?[0-9]+))?/.exec(l);
  //   return {x: parseInt(x),y: parseInt(y),z:parseInt(z)};
  // };
  // const byX = ((l, r) => l.x - r.x);

  // // Array.from(final).map(extract).sort((l, r) => l.x - r.x).forEach(x => log(x));
  // log('');
  
  // const first = [...test[0].originalBeacons].concat(
  //   test[1].originalBeacons.map(x => vadd({ x: 68, y: -1246, z: -43 }, rotateBy({x:0,y:2,z:0})(x)))
  // ).sort((l, r) => l.x - r.x);

  // // first.forEach(x => log(x));
  // Array.from(new Set(first.map(pointKey))).map(extract).sort(byX);
  // log(first.length);
  // // log(Array.from(final));
  // return final.size;

}    


function areSameBeacons(l, r) {
  if (l.length !== r.length) {
    return false;
  }
  for(let i = 0; i < l.length; i++) {
    if (!pointEqual(l[i], r[i])) return false;
  }
  return true;
}
function pointEqual(l, r) {
  return l.x === r.x && l.y === r.y && l.z === r.z;
}
function normalize(beacons) {

  const first = beacons[0];
  const bounds = createBounds({
    left: first.x,
    right: first.x,
    top: first.y,
    bottom: first.y,
    zMin: first.z,
    zMax: first.z
  });
  for(let b of beacons) {
    bounds.mark(b.x, b.y, b.z);    
  }

  return {
    bounds,
    offset: {x: bounds.left, y: bounds.top, z: bounds.zMin},
    points: beacons.map(b => ({
      x: b.x - bounds.left,
      y: b.y - bounds.top,
      z: b.z - bounds.zMin
    })).sort(byPosition)
  };
}

function byPosition(l, r) {
  if(l.z === r.z) {
    if (l.y === r.y) {
      return l.x - r.x;
    }
    return l.y - r.y;
  }
  return l.z - r.z;
}


function identity(p) { return {...p};};

function rotateYAccessor(rotate, accessor) {
  switch(rotate) {
  case ROTATIONS.none: return accessor;
  case ROTATIONS.one: return ({x, y, z}) => accessor({x: z, y, z: -x});
  case ROTATIONS.two: return ({x, y, z}) => accessor({x: -x, y, z: -z});
  case ROTATIONS.three: return ({x, y, z}) => accessor({x: -z, y, z: x});
  }
  throw new Error(`invalid rotate. ${rotate}`);
};

function rotateXAccessor(rotate, accessor) {
  switch(rotate) {
  case ROTATIONS.none: return accessor;
  case ROTATIONS.one: return ({x, y, z}) => accessor({x, y: -z, z: y});
  case ROTATIONS.two: return ({x, y, z}) => accessor({x, y: -y, z: -z});
  case ROTATIONS.three: return ({x, y, z}) => accessor({x, y: z, z: -y});
  }
}

function rotateZAccessor(rotate, accessor) {
  switch(rotate) {
  case ROTATIONS.none: return accessor;
  case ROTATIONS.one: return ({x, y, z}) => accessor({ x: y, y: -x, z });
  case ROTATIONS.two: return ({x, y, z}) => accessor({ x: -x, y: -y, z });
  case ROTATIONS.three: return ({x, y, z}) => accessor({x: y, y: -x, z });
  }
}

function rotateAccessor(accessor) {
  return ({x, y, z}) => 
    rotateXAccessor(x, 
      rotateYAccessor(y, 
        rotateZAccessor(z, accessor)));
}
function rotate(pos) {
  return rotateAccessor(identity)(pos);
}
