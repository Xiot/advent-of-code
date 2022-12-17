
import { log, createGridMap, visualizeGrid } from "../../utils";

export const parse = text => text.split('\n').map(line => {
  return line.split(' -> ').map(parts => {
    const [x,y] = parts.split(',').map(x => parseInt(x));
    return {x,y};
  });
});

export function part1(input) {
  
  const grid = createGridMap('.');

  for(let line of input) {
    drawRock(grid, line);
  }

  grid.recalculateBounds();
  grid.set(500,0, '+');

  const floor = grid.bounds.bottom + 2;

  let i = 0;
  while(true) {
    i++;
    if (dropSand(grid, floor) == null) {
      break;
    }
  }

  console.log(
    visualizeGrid(grid, (x, y) => grid.get(x, y))
  );
  return i - 1;
}

function dropSand(grid, floor) {
  let p = {x: 500, y: 0};
  while(true) {
    if (p.y >= floor) return null;

    if (grid.get(p.x, p.y+1) === '.') {
      p = {x: p.x, y: p.y+1};
    
    } else if (grid.get(p.x -1, p.y + 1) === '.') {
      p = {x: p.x - 1, y: p.y+1};
    
    } else if (grid.get(p.x +1, p.y +1) === '.') {
      p = {x: p.x+1, y: p.y+1};
    } else {
      grid.set(p.x, p.y, 'o');
      return p;
    }
  }
}
function dropSandWithFloor(grid, floor) {
  let p = {x: 500, y: 0};
  while(true) {
    if (p.y >= floor) {
      grid.set(p.x, p.y-1, 'o');
      return p;
    };

    if (grid.get(p.x, p.y+1) === '.') {
      p = {x: p.x, y: p.y+1};
    
    } else if (grid.get(p.x -1, p.y + 1) === '.') {
      p = {x: p.x - 1, y: p.y+1};
    
    } else if (grid.get(p.x +1, p.y +1) === '.') {
      p = {x: p.x+1, y: p.y+1};
    } else {
      grid.set(p.x, p.y, 'o');
      return p;
    }
  }
}

function drawRock(grid, lines) {

  for(let i = 1; i < lines.length; i++) {
    const pts = Array.from(points(lines[i-1], lines[i]));
    log(pts);
    for(let {x,y} of pts) {
      grid.set(x, y, '#');
    }
  }

}

function* points(from, to) {

  let p = from;
  yield p;
  while(!(p.x === to.x && p.y === to.y)) {
    const diff = {
      x: Math.sign(to.x - p.x),
      y: Math.sign(to.y - p.y)
    };
    p = {x: p.x + diff.x, y: p.y + diff.y};
    yield p;
  }
}


export function part2(input) {

  const grid = createGridMap('.');

  for(let line of input) {
    drawRock(grid, line);
  }

  grid.recalculateBounds();
  grid.set(500,0, '+');

  const floor = grid.bounds.bottom + 2;

  let i = 0;
  while(true) {
    i++;
    const p = dropSandWithFloor(grid, floor);
    if (p == null) break;
    if (p.x === 500 && p.y === 0) {
      break;
    }
  }

  console.log(
    visualizeGrid(grid, (x, y) => grid.get(x, y))
  );
  return i;
}    
