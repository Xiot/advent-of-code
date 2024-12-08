import { Bounds, byLine, loadGrid, log, Point, visualizeGrid } from '../../utils';
import { createGroupBy } from '../../utils/groups';
type Input = ReturnType<typeof parse>;

export const parse = text => loadGrid(text, '.');

export function part1(grid: Input) {
  grid.markOnGet = false;

  const nodes = grid
    .entries()
    .filter(entry => entry[1] !== '.' && entry[1] !== '#')
    .toArray();

  const g = createGroupBy<Point>();
  nodes.forEach(n => {
    g.append(n[1], n[0]);
  });

  const groups = g.entries().toArray();
  log('groups', groups);
  const w = grid.clone();

  let count = 0;
  let unique = new Set<string>();

  groups.forEach(g => {
    const antinodes = findAntinodes(g[1]).filter(p => grid.bounds.contains(p.x, p.y));
    antinodes.forEach(n => {
      unique.add(keyOf(n));
      w.set(n.x, n.y, '#');
    });
    count += antinodes.length;
    log(g[0], antinodes);
  });
  log(visualizeGrid(w));
  return unique.size;
}

export function part2(grid: Input) {
  grid.markOnGet = false;

  const nodes = grid
    .entries()
    .filter(entry => entry[1] !== '.' && entry[1] !== '#')
    .toArray();

  const g = createGroupBy<Point>();
  nodes.forEach(n => {
    g.append(n[1], n[0]);
  });

  const groups = g.entries().toArray();
  log('groups', groups);
  const w = grid.clone();

  let count = 0;
  let unique = new Set<string>();

  groups.forEach(g => {
    const antinodes = findAntinodeHarmonics(g[1], grid.bounds).filter(p => grid.bounds.contains(p.x, p.y));
    antinodes.forEach(n => {
      unique.add(keyOf(n));
      w.set(n.x, n.y, '#');
    });
    count += antinodes.length;
    log(g[0], antinodes);
  });
  log(visualizeGrid(w));
  return unique.size;
}

function keyOf(p: Point) {
  return `${p.x},${p.y}`;
}
function parseKey(text: string): Point {
  const parts = text.split(',');
  return {
    x: parseInt(parts[0]),
    y: parseInt(parts[1]),
  };
}
function add(p: Point, v: Point) {
  return {
    x: p.x + v.x,
    y: p.y + v.y,
  };
}
function minus(p: Point, v: Point) {
  return { x: p.x - v.x, y: p.y - v.y };
}

function distance(l: Point, r: Point) {
  return {
    x: Math.abs(l.x - r.x),
    y: Math.abs(l.y - r.y),
  };
}

function diff(l: Point, r: Point) {
  return {
    x: l.x - r.x,
    y: l.y - r.y,
  };
}
function negate(p: Point) {
  return {
    x: -p.x,
    y: -p.y,
  };
}

function findAntinodes(positions: Point[]) {
  const antinodes: Set<string> = new Set();

  for (let i = 0; i < positions.length - 1; i++) {
    const l = positions[i];
    for (let j = i + 1; j < positions.length; j++) {
      const r = positions[j];
      const d = diff(l, r);
      log('diff', d);

      antinodes.add(keyOf(add(l, d)));
      antinodes.add(keyOf(minus(r, d)));
    }
  }

  return antinodes
    .entries()
    .map(n => {
      return parseKey(n[0]);
    })
    .toArray();
}

function findAntinodeHarmonics(positions: Point[], bounds: Bounds) {
  const antinodes: Set<string> = new Set();

  for (let i = 0; i < positions.length - 1; i++) {
    const l = positions[i];
    for (let j = i + 1; j < positions.length; j++) {
      const r = positions[j];
      const d = diff(r, l);
      log('diff', d);

      antinodes.add(keyOf(l));
      antinodes.add(keyOf(r));
      const first = repeatWithBounds(l, negate(d), bounds);
      const second = repeatWithBounds(r, d, bounds);

      [...first, ...second].forEach(p => {
        antinodes.add(keyOf(p));
      });
    }
  }

  return antinodes
    .entries()
    .map(n => {
      return parseKey(n[0]);
    })
    .toArray();
}
function repeatWithBounds(p: Point, v: Point, bounds: Bounds) {
  let np = add(p, v);
  const points: Point[] = [];
  while (bounds.contains(np.x, np.y)) {
    points.push(np);
    np = add(np, v);
  }
  return points;
}
