
import { log, byLine, createBucketMap } from "../../utils";

const PARSE_RE = /p=<(-?\d+),(-?\d+),(-?\d+)>, v=<(-?\d+),(-?\d+),(-?\d+)>, a=<(-?\d+),(-?\d+),(-?\d+)>/;

export const parse = byLine((line, index) => {
  const [x, y, z, vx, vy, vz, ax, ay, az] = PARSE_RE.exec(line).slice(1).map(x => parseInt(x));
  return {
    id: index,
    pos: {x,y,z},
    vel: {x: vx, y: vy, z: vz},
    acc: {x: ax, y: ay, z: az},
    distance() {
      return Math.abs(this.pos.x) + Math.abs(this.pos.y) + Math.abs(this.pos.z);
    }
  };
});

export function part1(input) {

  let i = 0;
  
  while(true) {

    for(let p of input) {
      p.vel = add(p.vel, p.acc);
      p.pos = add(p.pos, p.vel);
    }
    input.sort(byDistance);

    // 1000 is a random large number
    if (i++ > 1000) {
      break;
    }
  }
  return input[0].id;
}

export function part2(input) {

  let i = 0;
  
  while(true) {
    const map = createBucketMap(p => `${p.pos.x},${p.pos.y},${p.pos.z}`);
    for(let p of input) {
      p.vel = add(p.vel, p.acc);
      p.pos = add(p.pos, p.vel);
      map.add(p);
    }
    input = input.filter(p => {
      return map.bucketSize(p) === 1;
    });
    input.sort(byDistance);

    // 1000 is a random large number
    if (i++ > 1000) {
      break;
    }
  }
  return input.length;
}

function byDistance(l, r) {
  return l.distance() - r.distance();
}

function add(l, r) {
  return {
    x: l.x + r.x,
    y: l.y + r.y,
    z: l.z + r.z,
  };
}

