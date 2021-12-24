
import { isEqual } from "lodash";
import { autoParse, byLine, createBounds, log, pointsWithin, sumOf } from "../../utils";
import { createCube } from "../../utils/cube";

const PARSE_RE = /(on|off) x=(-?[0-9]+)\.\.(-?[0-9]+),y=(-?[0-9]+)\.\.(-?[0-9]+),z=(-?[0-9]+)\.\.(-?[0-9]+)/;
export const parse = byLine(line => {
  
  const [,op,x1,x2,y1,y2,z1,z2] = PARSE_RE.exec(line);

  const x1v = parseInt(x1);
  const x2v = parseInt(x2);
  const y1v = parseInt(y1);
  const y2v = parseInt(y2);
  const z1v = parseInt(z1);
  const z2v = parseInt(z2);

  return {
    op,    
    bounds: createBounds({
      left: Math.min(x1v, x2v),
      right: Math.max(x1v, x2v),
      top: Math.min(y1v, y2v),
      bottom: Math.max(y1v, y2v),
      zMin: Math.min(z1v, z2v),
      zMax: Math.max(z1v, z2v)
    })
  };
});

export function part1(input) {

  const cube = createCube('off');
  cube.markOnGet = false;

  const validRegion = createBounds({
    left: -50, right: 50,
    top: -50, bottom: 50,
    zMin: -50, zMax: 50
  });

  const isValid = bounds => {
    return bounds.left >= validRegion.left 
      &&  bounds.right <= validRegion.right
      && bounds.top >= validRegion.top 
      && bounds.bottom <= validRegion.bottom 
      && bounds.zMin >= validRegion.zMin
      && bounds.zMax <= validRegion.zMax;
  };

  for(let {op, bounds} of input) {
    if (!isValid(bounds)) continue;
    
    for(let point of pointsWithin(bounds)) {      
      cube.set(point[0], point[1], point[2], op);
    }
  }
  const onCount = Array.from(cube.values()).filter(x => x === 'on').length;
  return onCount;
}

export function part2(input) {

  let cubes = [];

  for(let i = 0; i < input.length; i++) {
    const {op, bounds} = input[i];
            
    cubes = cubes.flatMap(c => sub(c, bounds));
    if (op === 'on') {
      cubes.push(bounds);
    }    
  }

  const value = sumOf(cubes, c => c.width * c.height * c.depth);
  return value;

}    

function intersection1d(l1, l2, r1, r2) {
  
  if (l1 <= r1) {
    if (r1 > l2) return null;
    return [Math.max(l1, r1), Math.min(l2, r2)];
  } else {
    if (l1 > r2) return null;
    return [Math.max(l1, r1), Math.min(l2, r2)];    
  }
}

function intersection(l, r) {
  const ix = intersection1d(l.left, l.right, r.left, r.right);
  if (!ix) return null;
  const iy = intersection1d(l.top, l.bottom, r.top, r.bottom);
  if (!iy) return null;
  const iz = intersection1d(l.zMin, l.zMax, r.zMin, r.zMax);
  if (!iz) return null;

  return createBounds({
    left: ix[0],
    right: ix[1],
    top: iy[0],
    bottom: iy[1],
    zMin: iz[0],
    zMax: iz[1]
  });
}

function sub(l, r) {

  const i = intersection(l, r);
  if (i == null) return [l];

  const ret = [];

  ret.push(
    // z = 0, y  = 0, x = 1..3    
    createBounds({left: l.left,      right: i.left -1, top: l.top,        bottom: i.top - 1,    zMin: l.zMin,      zMax: i.zMin - 1}, {order: false}),
    createBounds({left: i.left,      right: i.right,   top: l.top,        bottom: i.top - 1,    zMin: l.zMin,      zMax: i.zMin - 1}, {order: false}),
    createBounds({left: i.right + 1, right: l.right,   top: l.top,        bottom: i.top - 1,    zMin: l.zMin,      zMax: i.zMin - 1}, {order: false}),
    createBounds({left: l.left,      right: i.left -1, top: i.top,        bottom: i.bottom,     zMin: l.zMin,      zMax: i.zMin - 1}, {order: false}),
    createBounds({left: i.left,      right: i.right,   top: i.top,        bottom: i.bottom,     zMin: l.zMin,      zMax: i.zMin - 1}, {order: false}),
    createBounds({left: i.right + 1, right: l.right,   top: i.top,        bottom: i.bottom,     zMin: l.zMin,      zMax: i.zMin - 1}, {order: false}),
    createBounds({left: l.left,      right: i.left -1, top: i.bottom + 1, bottom: l.bottom,     zMin: l.zMin,      zMax: i.zMin - 1}, {order: false}),
    createBounds({left: i.left,      right: i.right,   top: i.bottom + 1, bottom: l.bottom,     zMin: l.zMin,      zMax: i.zMin - 1}, {order: false}),
    createBounds({left: i.right + 1, right: l.right,   top: i.bottom + 1, bottom: l.bottom,     zMin: l.zMin,      zMax: i.zMin - 1}, {order: false}),
    
    // // z = 0, y  = 0, x = 1..3
    createBounds({left: l.left,      right: i.left -1, top: l.top,        bottom: i.top - 1,    zMin: i.zMin,      zMax: i.zMax}, {order: false}),
    createBounds({left: i.left,      right: i.right,   top: l.top,        bottom: i.top - 1,    zMin: i.zMin,      zMax: i.zMax}, {order: false}),
    createBounds({left: i.right + 1, right: l.right,   top: l.top,        bottom: i.top - 1,    zMin: i.zMin,      zMax: i.zMax}, {order: false}),
    createBounds({left: l.left,      right: i.left -1, top: i.top,        bottom: i.bottom,     zMin: i.zMin,      zMax: i.zMax}, {order: false}),
    
    createBounds({left: 0, right: -1}, {order: false}), // filter out the middle
    createBounds({left: i.right + 1, right: l.right,   top: i.top,        bottom: i.bottom,     zMin: i.zMin,      zMax: i.zMax}, {order: false}),
    createBounds({left: l.left,      right: i.left -1, top: i.bottom + 1, bottom: l.bottom,     zMin: i.zMin,      zMax: i.zMax}, {order: false}),
    createBounds({left: i.left,      right: i.right,   top: i.bottom + 1, bottom: l.bottom,     zMin: i.zMin,      zMax: i.zMax}, {order: false}),
    createBounds({left: i.right + 1, right: l.right,   top: i.bottom + 1, bottom: l.bottom,     zMin: i.zMin,      zMax: i.zMax}, {order: false}),

    createBounds({left: l.left,      right: i.left -1, top: l.top,        bottom: i.top - 1,    zMin: i.zMax + 1,  zMax: l.zMax}, {order: false}),
    createBounds({left: i.left,      right: i.right,   top: l.top,        bottom: i.top - 1,    zMin: i.zMax + 1,  zMax: l.zMax}, {order: false}),
    createBounds({left: i.right + 1, right: l.right,   top: l.top,        bottom: i.top - 1,    zMin: i.zMax + 1,  zMax: l.zMax}, {order: false}),
    createBounds({left: l.left,      right: i.left -1, top: i.top,        bottom: i.bottom,     zMin: i.zMax + 1,  zMax: l.zMax}, {order: false}),
    createBounds({left: i.left,      right: i.right,   top: i.top,        bottom: i.bottom,     zMin: i.zMax + 1,  zMax: l.zMax}, {order: false}),
    createBounds({left: i.right + 1, right: l.right,   top: i.top,        bottom: i.bottom,     zMin: i.zMax + 1,  zMax: l.zMax}, {order: false}),
    createBounds({left: l.left,      right: i.left -1, top: i.bottom + 1, bottom: l.bottom,     zMin: i.zMax + 1,  zMax: l.zMax}, {order: false}),
    createBounds({left: i.left,      right: i.right,   top: i.bottom + 1, bottom: l.bottom,     zMin: i.zMax + 1,  zMax: l.zMax}, {order: false}),
    createBounds({left: i.right + 1, right: l.right,   top: i.bottom + 1, bottom: l.bottom,     zMin: i.zMax + 1,  zMax: l.zMax}, {order: false}),
    
  );

  return ret.filter(b => b.depth > 0 && b.width > 0 && b.height > 0);
}