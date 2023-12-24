import { Point, Point3, byLine, createBounds, log } from '../../utils';
type Input = ReturnType<typeof parse>;

export const parse = byLine(line => {
  const [pos, vel] = line.split('@').map(x =>
    x
      .trim()
      .split(', ')
      .map(y => parseInt(y)),
  );
  return {
    pos: { x: pos[0], y: pos[1], z: pos[2] } as Point3,
    vel: { x: vel[0], y: vel[1], z: vel[2] } as Point3,
  };
});

export function part1(input: Input) {
  log('input', input);

  const h1 = input[0];
  const h2 = input[1];

  const area =
    process.env.IS_SAMPLE === '1'
      ? createBounds({ left: 7, right: 27, top: 7, bottom: 27 })
      : createBounds({ left: 200000000000000, right: 400000000000000, top: 200000000000000, bottom: 400000000000000 });

  let count = 0;
  for (let a = 0; a < input.length - 1; a++) {
    for (let b = a + 1; b < input.length; b++) {
      const h1 = input[a];
      const h2 = input[b];

      const col = intersect2d(h1, h2);
      if (col == null) continue;
      if (col.u < 0 || col.v < 0) continue;
      if (!area.contains(col.pos.x, col.pos.y)) continue;
      count++;
    }
  }
  return count;
}

export function part2(input: Input) {
  const area =
    process.env.IS_SAMPLE === '1'
      ? createBounds({ left: 7, right: 27, top: 7, bottom: 27 })
      : createBounds({ left: 200000000000000, right: 400000000000000, top: 200000000000000, bottom: 400000000000000 });

  const stone: Ray3d = {
    pos: { x: 24, y: 13, z: 10 },
    vel: { x: -3, y: 1, z: 2 },
  };

  const ret = intersect3d(stone, input[0]);
  log('i3d', ret, posAtTime(input[0], ret.v));

  const w = raysIntersect(input[0].pos, input[0].vel, stone.pos, stone.vel);
  log(w);
  log('ri2', raysIntersect2(stone.pos, stone.vel, input[0].pos, input[0].vel));

  log();

  log(posAtTime(stone, 5));
  log(posAtTime(input[0], 5));

  return 0;
}

type Line2d = {
  pos: Point;
  vel: Point;
};

function intersect2d(l: Line2d, r: Line2d) {
  const dx = r.pos.x - l.pos.x;
  const dy = r.pos.y - l.pos.y;
  const det = r.vel.x * l.vel.y - r.vel.y * l.vel.x;
  if (det === 0) return null;

  const u = (dy * r.vel.x - dx * r.vel.y) / det;
  const v = (dy * l.vel.x - dx * l.vel.y) / det;

  return {
    u,
    v,
    pos: add2d(l.pos, mul2d(l.vel, u)),
  };
}

type Ray3d = {
  pos: Point3;
  vel: Point3;
};

function intersect3d(l: Ray3d, r: Ray3d) {
  const dx = r.pos.x - l.pos.x;
  const dy = r.pos.y - l.pos.y;
  const dz = r.pos.z - l.pos.z;

  // prettier-ignore
  const det = l.vel.x * r.vel.y * l.vel.z 
    - r.vel.x * l.vel.y * r.vel.z
  // + l.vel.x * r.vel.y * l.vel.z;

  if (det === 0) return null;

  // prettier-ignore
  const u = (
    dx * l.vel.y * r.vel.z 
    + l.vel.x * dy * r.vel.z 
    + l.vel.x * r.vel.y * dz
  ) / det;

  // prettier-ignore
  const v = (
    dx * l.vel.y * l.vel.z 
    + l.vel.x * dy * l.vel.z 
    + l.vel.x * l.vel.y * dz
  ) / det;

  return {
    u,
    v,
    pos: add3d(l.pos, mul3d(l.vel, u)),
  };
}

function add2d(l: Point, r: Point) {
  return { x: l.x + r.x, y: l.y + r.y };
}

function mul2d(p: Point, m: number) {
  return { x: p.x * m, y: p.y * m };
}

function add3d(l: Point3, r: Point3) {
  return { x: l.x + r.x, y: l.y + r.y, z: l.z + r.z };
}

function mul3d(p: Point3, m: number) {
  return { x: p.x * m, y: p.y * m, z: p.z * m };
}

function raysIntersect(AP: Point3, AV: Point3, BP: Point3, BV: Point3) {
  // Solve the system of linear equations
  let t =
    ((BP.x - AP.x) * BV.y * AV.z - BP.y * BV.x * AV.z + AV.x * BV.y * (BP.z - AP.z)) /
    (AV.x * BV.y * AV.z - BV.x * AV.y * AV.z);

  let s =
    ((BP.x - AP.x) * AV.y * AV.z + AV.x * (BP.y - AP.y) * AV.z - AV.x * AV.y * (BP.z - AP.z)) /
    (AV.x * BV.y * AV.z - BV.x * AV.y * AV.z);

  // Check if the parameters are within the valid range
  if (t >= 0 && s >= 0) {
    // Calculate the intersection point
    let intersectionPoint = {
      x: AP.x + t * AV.x,
      y: AP.y + t * AV.y,
      z: AP.z + t * AV.z,
    };

    return {
      u: t,
      v: s,
      pos: intersectionPoint,
    };
  } else {
    // No intersection
    return null;
  }
}

function raysIntersect2(AP: Point3, AV: Point3, BP: Point3, BV: Point3) {
  // Solve the system of linear equations
  const det = AV.x * BV.y * AV.z + BV.x * AV.y * BV.z + AV.x * BV.y * AV.z;

  // prettier-ignore
  let t = (
    (BP.x - AP.x) * AV.y * BV.z 
    + AV.x * (BP.y - AP.y) * BV.z 
    + AV.x * BV.y * (AP.z - BP.z)
  ) / det;

  // prettier-ignore
  let s = (
    (BP.x - AP.x) * AV.y * AV.z 
    + AV.x * (BP.y - AP.y) * AV.z 
    + AV.x * AV.y * (AP.z - BP.z)
  ) / det;

  log('ri2a', t, s);
  // Check if the parameters are within the valid range
  if (t >= 0 && s >= 0) {
    // Calculate the intersection point
    let intersectionPoint = {
      x: AP.x + t * AV.x,
      y: AP.y + t * AV.y,
      z: AP.z + t * AV.z,
    };

    return intersectionPoint;
  } else {
    // No intersection
    return null;
  }
}

function posAtTime(ray: Ray3d, time: number) {
  return add3d(ray.pos, mul3d(ray.vel, time));
}
