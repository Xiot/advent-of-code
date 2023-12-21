import { GridMap, Point, byLine, createBounds, loadGrid, log, maxOf, minOf, visualizeGrid } from '../../utils';
type Input = ReturnType<typeof parse>;

export const parse = (text: string) => loadGrid(text, '.');

const DIRS = [
  { x: 0, y: -1 },
  { x: 0, y: 1 },
  { x: 1, y: 0 },
  { x: -1, y: 0 },
];

export function part1(input: Input) {
  const [initialPos] = Array.from(input.entries()).find(e => e[1] === 'S');
  input.set(initialPos.x, initialPos.y, '.');
  input.markOnGet = false;

  let positions = [initialPos];
  for (let i = 0; i < 64; i++) {
    const newPositions = countSpots(input, positions);
    log(`Step ${i + 1}`);
    log(
      visualizeGrid(input, (x, y) => {
        const tile = input.get(x, y);
        if (tile === '#') return '#';
        if (newPositions.some(p => p.x === x && p.y === y)) return 'O';
        return '.';
      }),
    );
    positions = newPositions;
  }
  return positions.length;
}

export function part2(input: Input) {
  const [initialPos] = Array.from(input.entries()).find(e => e[1] === 'S');
  input.set(initialPos.x, initialPos.y, '.');
  input.markOnGet = false;

  let positions = [initialPos];
  for (let i = 0; i < 100; i++) {
    const newPositions = countSpots(input, positions);

    const b = createBounds({
      left: Math.min(input.bounds.left, minOf(newPositions, p => p.x) - 1),
      top: Math.min(input.bounds.top, minOf(newPositions, p => p.y) - 1),
      right: Math.max(input.bounds.right, maxOf(newPositions, p => p.x) + 1),
      bottom: Math.max(input.bounds.bottom, maxOf(newPositions, p => p.y) + 1),
    });

    log(`Step ${i + 1}: ${newPositions.length}`);
    log(
      visualizeGrid(b, (x, y) => {
        const tile = input.get(wrapX(input, x), wrapY(input, y));
        if (tile === '#') return '#';
        if (newPositions.some(p => p.x === x && p.y === y)) return 'O';
        return '.';
      }),
    );
    log();
    positions = newPositions;
  }
  return positions.length;
}

function countSpots(grid: GridMap, initialPoints: Point[]): Point[] {
  const queue = initialPoints.map(p => ({ pos: p, depth: 0 }));

  const steps = new Set<string>();

  while (queue.length > 0) {
    const { pos, depth } = queue.shift();
    if (depth === 2) break;
    if (depth === 1) {
      steps.add(keyOf(pos));
    }

    DIRS.forEach(d => {
      const np = add(pos, d);
      const wrappedX = wrapX(grid, np.x);
      const wrappedY = wrapY(grid, np.y);
      if (grid.get(wrappedX, wrappedY) === '#') return;
      queue.push({ pos: np, depth: depth + 1 });
    });
  }

  return Array.from(steps, hash => {
    const [x, y] = hash.split(',');
    return { x: parseInt(x), y: parseInt(y) };
  });
}

function wrapX(grid: GridMap, x: number) {
  if (x === 0) return 0;

  while (x < 0) {
    x += grid.bounds.width;
  }

  return x % grid.bounds.width;
}

function wrapY(grid: GridMap, y: number) {
  if (y === 0) return 0;

  while (y < 0) {
    y += grid.bounds.height;
  }

  return y % grid.bounds.height;
}

function keyOf(p: Point) {
  return `${p.x},${p.y}`;
}

function add(l: Point, r: Point) {
  return { x: l.x + r.x, y: l.y + r.y };
}
