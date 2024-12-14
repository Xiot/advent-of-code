import { byLine, GridMap, loadGrid, log, maxOf, minOf, Point } from '../../utils';
type Input = ReturnType<typeof parse>;

export const parse = (text: string) => loadGrid(text, '.');

export function part1(input: Input) {
  input.markOnGet = false;

  const regions = findRegionsTake2(input);
  log('RESULTS');
  log(regions);

  const cost = regions.reduce((acc, cur) => {
    return acc + cur.area * cur.perimiter;
  }, 0);
  log('count', regions.length);
  return cost;
}

function pad(num) {
  return String(num).padStart(3);
}

export function part2(input: Input) {
  input.markOnGet = false;

  const regions = findRegionsTake2(input);
  log('RESULTS');
  log(regions);

  let sum = 0;
  let cost = 0;
  regions.forEach(r => {
    const sides = countSides(r, input);
    log(r.type, pad(r.area), pad(sides), pad(sides * r.area));
    sum += sides;
    cost += sides * r.area;
  });

  return cost;
}

function countSides(region: Region, grid: GridMap) {
  const left = minOf(region.cells, c => c.x);
  const right = maxOf(region.cells, c => c.x);
  const top = minOf(region.cells, c => c.y);
  const bottom = maxOf(region.cells, c => c.y);

  let sides = 0;

  // top
  for (let y = top; y <= bottom; y++) {
    let newSide = true;
    let rowSides = 0;
    for (let x = left; x <= right; x++) {
      if (!region.cells.some(c => keyOf(c) === keyOf({ x, y }))) {
        newSide = true;
        continue;
      }

      if (grid.get(x, y) !== region.type) {
        newSide = true;
        continue;
      }
      if (grid.get(x, y - 1) === region.type) {
        newSide = true;
        continue;
      }
      if (newSide) {
        rowSides++;
        newSide = false;
      }
    }
    log('top', y, rowSides);
    sides += rowSides;
  }

  // bottom
  for (let y = top; y <= bottom; y++) {
    let newSide = true;
    let rowSides = 0;
    for (let x = left; x <= right; x++) {
      if (!region.cells.some(c => keyOf(c) === keyOf({ x, y }))) {
        newSide = true;
        continue;
      }
      if (grid.get(x, y) !== region.type) {
        newSide = true;
        continue;
      }
      if (grid.get(x, y + 1) === region.type) {
        newSide = true;
        continue;
      }
      if (newSide) {
        rowSides++;
        newSide = false;
      }
    }
    log('bottom', y, rowSides);
    sides += rowSides;
  }

  // left
  for (let x = left; x <= right; x++) {
    let newSide = true;
    let rowSides = 0;
    for (let y = top; y <= bottom; y++) {
      if (!region.cells.some(c => keyOf(c) === keyOf({ x, y }))) {
        newSide = true;
        continue;
      }
      if (grid.get(x, y) !== region.type) {
        newSide = true;
        continue;
      }
      if (grid.get(x - 1, y) === region.type) {
        newSide = true;
        continue;
      }
      if (newSide) {
        rowSides++;
        newSide = false;
      }
    }
    log('left', x, rowSides);
    sides += rowSides;
  }

  // right
  for (let x = left; x <= right; x++) {
    let newSide = true;
    let rowSides = 0;
    for (let y = top; y <= bottom; y++) {
      if (!region.cells.some(c => keyOf(c) === keyOf({ x, y }))) {
        newSide = true;
        continue;
      }
      if (grid.get(x, y) !== region.type) {
        newSide = true;
        continue;
      }
      if (grid.get(x + 1, y) === region.type) {
        newSide = true;
        continue;
      }
      if (newSide) {
        rowSides++;
        newSide = false;
      }
    }
    log('right', x, rowSides);
    sides += rowSides;
  }

  return sides;
}

const DIRECTIONS = {
  north: { x: 0, y: -1 },
  south: { x: 0, y: 1 },
  west: { x: -1, y: 0 },
  east: { x: 1, y: 0 },
};
const ORDERED = [DIRECTIONS.north, DIRECTIONS.east, DIRECTIONS.south, DIRECTIONS.west];

type Region = {
  type: string;
  area: number;
  perimiter: number;
  cells: Point[];
};

function add(l: Point, r: Point) {
  return {
    x: l.x + r.x,
    y: l.y + r.y,
  };
}

const DIRS = [DIRECTIONS.north, DIRECTIONS.west];
const keyOf = (p: Point) => `${p.x},${p.y}`;

function findRegionsTake2(input: GridMap) {
  let seen = new Set<string>();

  const regions: Region[] = [];

  for (let y = 0; y <= input.bounds.bottom; y++) {
    for (let x = 0; x <= input.bounds.right; x++) {
      if (input.get(x, y) === '.') continue;
      if (seen.has(keyOf({ x, y }))) continue;

      const region = regionSearch(input, { x, y });
      region.cells.forEach(p => seen.add(keyOf(p)));
      regions.push(region);
    }
  }
  return regions;
}

function regionSearch(input: GridMap, p: Point) {
  const type = input.get(p.x, p.y);
  const queue = [p];
  const points = [p];
  let perimiter = 4;

  const seen = new Set<string>();
  seen.add(keyOf(p));

  while (queue.length > 0) {
    const cur = queue.pop();
    ORDERED.forEach(d => {
      const newPoint = add(cur, d);
      if (!input.bounds.contains(newPoint.x, newPoint.y)) return;

      if (input.get(newPoint.x, newPoint.y) !== type) return;
      if (seen.has(keyOf(newPoint))) return;
      seen.add(keyOf(newPoint));

      const n = ORDERED.filter(d => points.some(p => keyOf(p) === keyOf(add(newPoint, d))));

      if (n.length === 1) {
        perimiter += 2;
      } else if (n.length === 2) {
        perimiter += 0;
      } else if (n.length === 3) {
        perimiter -= 2;
      } else if (n.length === 4) {
        perimiter -= 4;
      }

      points.push(newPoint);
      queue.push(newPoint);
    });
  }

  return {
    type,
    cells: points,
    perimiter,
    area: points.length,
  };
}

function findRegionsTake1(input: GridMap) {
  const regions: Region[] = [];

  function findRegionWith(type: string, x: number, y: number) {
    return regions.find(r => {
      if (r.type !== type) return false;
      return r.cells.some(c => c.x === x && c.y === y);
    });
  }

  for (let y = 0; y <= input.bounds.bottom; y++) {
    for (let x = 0; x <= input.bounds.right; x++) {
      const type = input.get(x, y);
      let dirs = DIRS.map(d => ({ point: add({ x, y }, d), dir: d })).filter(p =>
        input.bounds.contains(p.point.x, p.point.y),
      );

      let ref = dirs
        .map(p => ({ point: p, region: findRegionWith(type, p.point.x, p.point.y) }))
        .find(r => r.region != null);

      if (ref == null) {
        regions.push({
          type,
          area: 1,
          perimiter: 4,
          cells: [{ x, y }],
        });
      } else {
        const region = ref.region;
        region.area += 1;
        region.cells.push({ x, y });
        const n = DIRS.filter(d => {
          return region.cells.some(c => keyOf(c) === keyOf(add({ x, y }, d)));
        });

        if (n.length === 1) {
          region.perimiter += 2;
        }
      }
    }
  }
  return regions;
}
