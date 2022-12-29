
import { autoParse, log, byLine, createGridMap, loadGrid, visualizeGrid } from "../../utils";

export const parse = byLine(line => {
  const [left, right] = line.split(' => ');
  const output = right.split('/');
  return {
    size: output.length,
    pattern: left,
    output,
  };
});


const BASE_IMAGE = `.#./..#/###`.split('/');

export function part1(input) {

  let grid = loadGrid(BASE_IMAGE, '.');  
  log(`${0} ------`);
  console.log(
    visualizeGrid(grid)
  );
  log('----------');

  for(let i = 0; i < 5; i++) {

    const size = grid.bounds.width %2 === 0
      ? 2
      : 3;

    const chunks = grid.bounds.width / size;
    const newGrid = createGridMap('.');
    for(let cy = 0; cy < chunks; cy++) {
      for(let cx = 0; cx < chunks; cx++) {

        const img = extract(grid, cx*size, cy*size, size);
        const patterns = patternsOf(img);

        const found = input.find(p => patterns.includes(p.pattern));
        paste(newGrid, cx*found.size, cy*found.size, found.output);
      }
    }
    grid = newGrid;

    log(`${i+1} ------`);
    console.log(
      visualizeGrid(grid)
    );
    log('----------');
  }

  return Array.from(grid.values()).filter(v => v === '#').length;

}

export function part2(input) {

  let grid = loadGrid(BASE_IMAGE, '.');  

  for(let i = 0; i < 18; i++) {

    const size = grid.bounds.width %2 === 0
      ? 2
      : 3;

    const chunks = grid.bounds.width / size;
    const newGrid = createGridMap('.');
    for(let cy = 0; cy < chunks; cy++) {
      for(let cx = 0; cx < chunks; cx++) {

        const img = extract(grid, cx*size, cy*size, size);
        const patterns = patternsOf(img);

        const found = input.find(p => patterns.includes(p.pattern));
        paste(newGrid, cx*found.size, cy*found.size, found.output);
      }
    }
    grid = newGrid;
    
    log(i);    
  }

  return Array.from(grid.values()).filter(v => v === '#').length;

}

function paste(grid, x, y, img) {
  for(let dx = 0; dx < img.length; dx++) {
    for(let dy = 0; dy <img.length; dy++) {
      grid.set(x + dx, y + dy, img[dy][dx]);
    }
  }
}

const patternCache = new Map();
function patternsOf(p) {
  const key = toPattern(p);
  if (patternCache.has(key)) {
    return patternCache.get(key);
  }

  const patterns = [p];

  patterns.push(rotate(p, ROTATE[90]));
  patterns.push(rotate(p, ROTATE[180]));
  patterns.push(rotate(p, ROTATE[270]));

  const allPatterns = [
    ...patterns,
    ...patterns.map(flipX),
    ...patterns.map(flipY),
  ].map(toPattern);

  for(let r of allPatterns) {
    patternCache.set(r, allPatterns);
  }

  return allPatterns;
}

function flipX(p) {
  return p.map(row => [...row].reverse());
}
function flipY(p) {
  return [...p].map(row => [...row]).reverse();
}

function toPattern(p) {
  let pattern = '';
  for(let y = 0; y < p.length; y++) {
    if (y !== 0) pattern += '/';
    for(let x = 0; x < p[0].length; x++) {
      pattern += p[y][x];
    }
  }
  return pattern;
}

function extract(grid, x, y, size) {
  let lines = [];
  for(let dy = 0; dy < size; dy++) {
    let line = '';
    for(let dx = 0; dx < size; dx++) {
      line += grid.get(x+dx, y+dy);
    }
    lines.push(line.split(''));
  }
  return lines;
}

const ROTATE = {
  90: (x, y, size) => ({x: size - y - 1, y: x}),
  180: (x, y, size) => ({x: size - x -1, y: size - y -1}),
  270: (x, y, size) => ({x: y, y: size - x - 1})
};

function rotate(source, fn) {
  const size = source.length;
  const target = Array.from({length: size}, () => Array.from({length: size}));

  for(let sy = 0; sy < size; sy++) {
    for(let sx = 0; sx < size; sx++) {
      const t = fn(sx, sy, size);
      target[t.y][t.x] = source[sy][sx];
    }
  }
  return target;
}
