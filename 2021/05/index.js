
import { autoParse, byLine, createGridMap, visualizeGrid } from "../../utils";

export const parse = byLine(line => {
  const re = /([0-9]+),([0-9]+) -> ([0-9]+),([0-9]+)/;
  const m = line.match(re);
  return {
    from: {
      x: parseInt(m[1]), 
      y: parseInt(m[2])
    }, 
    to: {
      x: parseInt(m[3]), 
      y: parseInt(m[4])
    }
  };
});

export function part1(input) {
  
  const grid = createGridMap(0);
  for(let {from, to} of input) {

    if(from.x === to.x) {
      // horizontal
      const startY = Math.min(from.y, to.y);
      const endY = Math.max(from.y, to.y);     

      for(let y = startY; y <= endY; y++) {
        grid.set(from.x, y, grid.get(from.x, y) + 1);
      }
    } else if(from.y === to.y) {
      const startX = Math.min(from.x, to.x);
      const endX = Math.max(from.x, to.x);
      for(let x = startX; x <= endX; x++) {
        grid.set(x, from.y, grid.get(x, from.y) + 1);
      }
    }
  }
  const text = visualizeGrid(grid.bounds, (x, y) => {
    return String(grid.get(x, y) ?? '.');
  });
  
  const items = Array.from(grid.entries()).filter(([pos, value]) => value >= 2);
  return items.length;
}

export function part2(input) {
  const grid = createGridMap(0);
  
  for(let {from, to} of input) {

    const stepX = from.x === to.x ? 0 : from.x < to.x ? 1 : -1;
    const stepY = from.y === to.y ? 0 : from.y < to.y ? 1 : -1;

    const steps = Math.max(
      (Math.abs(from.x - to.x)) + 1,
      (Math.abs(from.y - to.y)) + 1,
    );      
    for(let i = 0; i < steps; i++) {
      const [x,y] = [from.x + i * stepX, from.y + i * stepY];
      grid.set(x,y, grid.get(x, y) + 1);
    }
  }
  
  const text = visualizeGrid(grid.bounds, (x, y) => {
    return String(grid.get(x, y) ?? '.');
  });
  // console.log(text);

  const items = Array.from(grid.entries()).filter(([pos, value]) => value >= 2);
  return items.length;
}    
