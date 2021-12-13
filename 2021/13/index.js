
import { autoParse, bySection, createGridMap, log, sumOf, visualizeGrid } from "../../utils";

export const parse = text => {
  const section = bySection()(text); 
  
  return {
    positions: section[0].split('\n').map(line => line.split(',').map(x => parseInt(x))),
    folds: section[1].split('\n').map(line => {
      const [, dir, value] = /([y|x])=(\d+)/.exec(line);
      return {
        axis: dir,
        value: parseInt(value)
      };
    })
  };
};

export function part1(input) {
  const grid = createGridMap(' ');
  for(let pos of input.positions) {
    grid.set(pos[0], pos[1], '#');
  }
  
  let width = grid.bounds.width;
  let height = grid.bounds.height;

  const fold = input.folds[0];
  if (fold.axis === 'y') {

    Array.from(grid.keys()).forEach(({x,y}) => {
      if (y <= fold.value) return;
      if (grid.get(x, y) === '#') {
        grid.set(x, fold.value - (y - fold.value), '#');
      }
      grid.set(x, y, undefined);
    });

    height = fold.value;

  } else if (fold.axis === 'x') {

    Array.from(grid.keys()).forEach(({x,y}) => {
      if (x <= fold.value) return;
      if (grid.get(x, y) === '#') {
        grid.set(fold.value - (x - fold.value),y, '#');
      }
      grid.set(x, y, undefined);
    });

    width = fold.value;
  }
  
  console.log(visualizeGrid({left: 0, top: 0, right: width - 1, bottom: height - 1}, (x, y) => grid.get(x,y)));
  return sumOf(Array.from(grid.values()), v => v === '#' ? 1 : 0);
}

export function part2(input) {
  const grid = createGridMap(' ');
  for(let pos of input.positions) {
    grid.set(pos[0], pos[1], '#');
  }

  let width = grid.bounds.width;
  let height = grid.bounds.height;

  for(let fold of input.folds) {
    if (fold.axis === 'y') {

      Array.from(grid.keys()).forEach(({x,y}) => {
        if (y <= fold.value) return;
        if (grid.get(x, y) === '#') {
          grid.set(x, fold.value - (y - fold.value), '#');
        }
        grid.set(x, y, undefined);
      });
  
      height = fold.value;
  
    } else if (fold.axis === 'x') {
  
      Array.from(grid.keys()).forEach(({x,y}) => {
        if (x <= fold.value) return;
        if (grid.get(x, y) === '#') {
          grid.set(fold.value - (x - fold.value),y, '#');
        }
        grid.set(x, y, undefined);
      });
  
      width = fold.value;
    }
  }
  console.log(`bounds [${width}x${height}]`, grid.bounds.toJSON());
  console.log(visualizeGrid({left: 0, top: 0, right: width - 1, bottom: height - 1}, (x, y) => grid.get(x,y)));
  return sumOf(Array.from(grid.values()), v => v === '#' ? 1 : 0);
}    
