
import { autoParse, byLine, loadGrid, log, visualizeGrid } from "../../utils";

export const parse = byLine(line => line.split('').map(x => parseInt(x)));

export function part1(input) {

  const grid = loadGrid(input);

  let flashes = 0;

  const wrap = (x, y) => ({x,y,key: `${x},${y}`});
  console.log(visualizeGrid(grid, (x,y) => grid.get(x, y)));
  console.log();

  for(let step = 0; step < 100; step++) {

    let flashing = [];
    for(let [{x, y}, energy] of grid.entries()) {
      const newEnergy = energy+1;
      
      grid.set(x, y, newEnergy);
      if (newEnergy > 9) {

        flashing.push(wrap(x, y));
        flashes += 1;
      }
    }

    let i = 0;
    while(i < flashing.length) {
      const {x,y} = flashing[i];
      for(let dx = -1; dx <=1; dx++) {
        for(let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue;
          if (!grid.bounds.contains(x + dx, y + dy)) {

            continue;
          }
          const newEnergy = grid.set(x + dx, y + dy, v => v + 1);
          if (newEnergy > 9) {
            const o = wrap(x+dx, y+dy);
            if (flashing.some(i => i.key === o.key)) {
              continue;
            };
            flashing.push(o);
            flashes += 1;
          }
        }
      }
      i++;
    }

    for(let {x,y} of flashing) {
      grid.set(x, y, 0);
    }

    console.log(`Step ${step +1}\n` + visualizeGrid(grid, (x,y) => grid.get(x, y) + ' '));
    console.log();
  }
  console.log('flashes', flashes);
  return flashes; 
}

export function part2(input) {

  const grid = loadGrid(input);

  const wrap = (x, y) => ({x,y,key: `${x},${y}`});
  console.log(visualizeGrid(grid, (x,y) => grid.get(x, y)));
  console.log();

  let step = 0;
  while(true) {

    let flashing = [];
    for(let [{x, y}, energy] of grid.entries()) {
      const newEnergy = energy+1;
      
      grid.set(x, y, newEnergy);
      if (newEnergy > 9) {

        flashing.push(wrap(x, y));
      }
    }

    let i = 0;
    while(i < flashing.length) {
      const {x,y} = flashing[i];
      for(let dx = -1; dx <=1; dx++) {
        for(let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue;
          if (!grid.bounds.contains(x + dx, y + dy)) {

            continue;
          }
          const newEnergy = grid.set(x + dx, y + dy, v => v + 1);
          if (newEnergy > 9) {
            const o = wrap(x+dx, y+dy);
            if (flashing.some(i => i.key === o.key)) {
              continue;
            };
            flashing.push(o);
          }
        }
      }
      i++;
    }

    for(let {x,y} of flashing) {
      grid.set(x, y, 0);
    }

    console.log(`Step ${step +1}`, flashing.length, grid.bounds.length);
    if (flashing.length === grid.bounds.length) {
      return step + 1;
    }
    
    // console.log(`Step ${step +1}`);

    step++;
    if (step > 1_000_000) return 'never';
  }
}    
