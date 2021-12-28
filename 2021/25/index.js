
import { autoParse, byLine, loadGrid, log, visualizeGrid } from "../../utils";

export const parse = text => {
  const input = byLine(line => line.split(''))(text);
  const grid = loadGrid(input, '.');
  return grid;
};

export function part1(grid) {
  
  log(visualizeGrid(grid, (x, y) => grid.get(x, y)));


  let current = grid.clone();
  let step = 0;
  while(true) {
    step++;
    let moves = 0;

    grid = current;
    current = current.clone();
    for(let y = grid.bounds.top; y <= grid.bounds.bottom; y++) {
      for(let x = grid.bounds.left; x<= grid.bounds.right; x++) {
        const cell = grid.get(x, y);

        const next = {
          x: (x + 1) % grid.bounds.width,
          y,
        };

        if (cell === '>') {
          if(grid.get(next.x, next.y) === '.') {
            current.set(x, y, undefined);
            current.set(next.x, next.y, cell);
            moves++;
          }
        }
      }
    }

    grid = current;
    current = current.clone();
    for(let y = grid.bounds.top; y <= grid.bounds.bottom; y++) {
      for(let x = grid.bounds.left; x<= grid.bounds.right; x++) {
        const cell = grid.get(x, y);
        const next = {
          x,
          y: (y + 1) % grid.bounds.height,
        };

        if (cell === 'v') {
          if(grid.get(next.x, next.y) === '.') {
            current.set(x, y, undefined);
            current.set(next.x, next.y, cell);
            moves++;
          }
        }
      }
    }
    
    
    log();
    log('step', step);
    log(visualizeGrid(current, (x, y) => current.get(x, y)));
    if (moves === 0) break;
  }
  return step;

}

export function part2(input) {

}    
