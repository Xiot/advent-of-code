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
