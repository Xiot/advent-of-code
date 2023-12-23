import { cloneDeep } from 'lodash';
import { Point3, byLine, createBounds, createBucketMap, createCube, log, visualizeGrid } from '../../utils';
import { calculateLine3 } from '../../utils/line';
type Input = ReturnType<typeof parse>;

export const parse = byLine((line, index) => {
  const [start, end] = line.split('~');
  function toCoords(t: string) {
    const [x, y, z] = t.split(',');
    return {
      x: parseInt(x),
      y: parseInt(y),
      z: parseInt(z),
    };
  }

  const p1 = toCoords(start);
  const p2 = toCoords(end);

  return {
    index,
    p1,
    p2,
    points: Array.from(calculateLine3(p1, p2).points()),
  };
});

type Block = Input[number];

function eq3(l: Point3, r: Point3) {
  return l.x === r.x && l.y === r.y && l.z === r.z;
}

export function part1(input: Input) {
  log(
    'input',
    input.sort((l, r) => {
      const low1 = Math.min(l.p1.z, l.p2.z);
      const low2 = Math.min(r.p2.z, r.p2.z);
      return low1 - low2;
    }),
  );

  for (let b = 1; b < input.length; b++) {
    const block = input[b];
    log(b);
    const lowest = getLowestZ(block);
    if (lowest === 1) continue;

    let lastBlock = block;
    while (true) {
      const c = cloneDeep(lastBlock);
      c.p1.z--;
      c.p2.z--;
      c.points = c.points.map(p => ({ ...p, z: p.z - 1 }));

      let intersect = false;
      for (let i = b - 1; i >= 0; i--) {
        if (intersects(input[i], c)) {
          intersect = true;
          break;
        }
      }
      if (c.p1.z <= 1 || c.p2.z <= 1) break;
      if (intersect) break;
    }
    input[b] = lastBlock;
  }

  const cube = createCube<number>(undefined);
  for (const block of input) {
    const line = calculateLine3(block.p1, block.p2);
    for (const p of line.points()) {
      cube.set(p.x, p.y, p.z, block.index);
    }
  }

  const supportMap = new Map<Block, Block[]>();

  for (const block of input) {
    const supports = block.points.flatMap(p => {
      const above = { ...p, z: p.z + 1 };
      return input.filter(b => b.points.some(bp => eq3(bp, above)));
    });
    supportMap.set(block, Array.from(new Set(supports)));
  }

  for (const [k, v] of supportMap) {
    console.log(
      k.index,
      v.map(x => x.index),
    );
  }

  const b = cube.bounds;
  log(
    visualizeGrid(
      createBounds({
        left: b.left,
        right: b.right,
        top: b.zMax,
        bottom: b.zMin,
      }),
      (x, z) => {
        const value = cube.get(x, 0, z);
        return String(value ?? '.');
      },
      { printColNumbers: true, printRowNumbers: true },
    ),
  );
  log(0, input[0].points);
  log(1, input[1].points);
  log(2, input[2].points);
}

export function part2(input: Input) {}

type Line = {
  p1: Point3;
  p2: Point3;
  points: Point3[];
};
function intersects(l: Line, r: Line) {
  return l.points.some(lp => r.points.some(rp => eq3(lp, rp)));
}
function getLowestZ(b: Block) {
  return Math.min(b.p1.z, b.p2.z);
}
