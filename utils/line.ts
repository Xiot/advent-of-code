import { gcd } from './numbers';

type Point = {
  x: number;
  y: number;
};

export const calculateLine = (from: Point, to: Point) => {
  const diffX = to.x - from.x;
  const diffY = to.y - from.y;

  const steps = gcd(Math.abs(diffX), Math.abs(diffY));
  const stepX = diffX / steps;
  const stepY = diffY / steps;

  return {
    from,
    to,
    step: {
      x: diffX / steps,
      y: diffY / steps,
      count: steps + 1,
    },
    points: function* () {
      for (let i = 0; i < steps + 1; i++) {
        yield { x: from.x + i * stepX, y: from.y + i * stepY } as Point;
      }
    },
  };
};

type Point3 = {
  x: number;
  y: number;
  z: number;
};
export const calculateLine3 = (from: Point3, to: Point3) => {
  const diffX = to.x - from.x;
  const diffY = to.y - from.y;
  const diffZ = to.z - from.z;

  const steps = gcd(gcd(Math.abs(diffX), Math.abs(diffY)), Math.abs(diffZ));
  const stepX = diffX / steps;
  const stepY = diffY / steps;
  const stepZ = diffZ / steps;

  return {
    from,
    to,
    step: {
      x: diffX / steps,
      y: diffY / steps,
      z: diffZ / steps,
      count: steps + 1,
    },
    points: function* () {
      for (let i = 0; i < steps + 1; i++) {
        yield { x: from.x + i * stepX, y: from.y + i * stepY, z: from.z + i * stepZ } as Point3;
      }
    },
  };
};
