
import { autoParse, log, byLine, loadGrid, visualizeGrid, createGridMap } from "../../utils";
import Color from 'colors/safe';

export const parse = byLine(line => line.split('').map(x => parseInt(x)));

const colors = [
  Color.gray,
  Color.green,
  Color.green,
  Color.yellow,
  Color.yellow,
  Color.magenta,
  Color.magenta,
  Color.blue,
  Color.red,
  Color.red,
];

export function part1(input) {
  return part1_attempt2(input);

}

export function part2(input) {

}    

function part1_attempt2(input) {

  const grid = loadGrid(input);
  const paths= [];
  
  const keyOf = (x, y) => `${x},${y}`;

  const stack = [];
  stack.push([
    {x: 0, y: 0},
    {'0,0':true},
    [],
    0    
  ]);


  const visited1 = {};
  let lowest = Number.MAX_SAFE_INTEGER;
  while(stack.length > 0) {    

    const [{x, y}, visited, path, cost] = stack.pop();

    // if (visited[keyOf(x, y)]) continue;
    // visited[keyOf(x, y)] = true;
    // log(cost);
    // log(visualizeGrid(grid, (x, y) => visited[keyOf(x, y)] ? 'x' : grid.get(x, y)) + '\n');

    const neighbors = (x, y) => {

      const getInfo = (x, y) => {
        if (!grid.bounds.contains(x, y) || visited[keyOf(x, y)]) return null;              
        // log('c', cost, grid.get(x, y));
        return [
          {x, y}, 
          {...visited, [keyOf(x, y)]: true}, 
          [...path, {x,y}], 
          cost + grid.get(x, y),
          grid.get(x, y)
        ];        
      };
      return [
        getInfo(x-1,y), 
        getInfo(x+1,y), 
        getInfo(x, y-1), 
        getInfo(x,y+1)
      ].filter(Boolean).sort((l, r) => l[4] - r[4]);
    };

    if (x === grid.bounds.right && y === grid.bounds.bottom) {
      // log('found path', cost);
      if (cost < lowest) {
        log('new low', cost);
        log(visualizeGrid(grid, (x, y) => visited[keyOf(x, y)] ? 'x' : grid.get(x, y)));
        log();
        lowest = cost;
      }
      paths.push(cost);
      continue;
    }

    const n = neighbors(x, y);
    // log(n);
    if (x === 0 && y === 0) {
      console.log(n);
    }
    // if (n.length > 0) {
    //   stack.push(n[0]);
    // }
    n.reverse().forEach(info => {
      stack.push(info);
    });
  }

  // log(paths.sort((l, r) => l - r));
  // const lowest1 = paths.sort((l, r) => l - r);
  return lowest;
}

function part1_attempt1(input) {

  // const r = minPath(input, input[0].length - 1, input.length - 1);
  // // log('r', r);
  // return r[r.length -1][r[0].length - 1];


  // log('input', input);
  const grid = loadGrid(input);
  const info = createGridMap(() => ({cost: 999, path: []}));
  
  // const w = astar(grid, )

  const keyOf = (x, y) => `${x},${y}`;
  const stack = [];
  stack.push([{x:0, y: 0}, {[keyOf(0,0)]: true}, [], 0]);

  const paths = [];

  log(visualizeGrid(grid, (x,y) => grid.get(x,y)));
  log();
  
  info.set(0, 0, {cost: 0, path: [{x: 0, y: 0}]});

  const getNeighbors = (x, y) => {
    const getInfo = (x, y) => {
      if (!grid.bounds.contains(x,y)) return;
      return {x,y,cost: grid.get(x, y)};
    };
    return [
      getInfo(x+1, y),
      getInfo(x, y+1),
      getInfo(x-1, y),
      
      getInfo(x, y-1),
      
    ].filter(Boolean);
  };

  for (let x = 0; x <= grid.bounds.right; x++) {
    for(let y = 0; y <= grid.bounds.bottom; y++) {
  
      const currentCost = info.get(x, y);
      // console.log(x,y, currentCost);

      const neighbors = getNeighbors(x, y);
      const sl = x === 2 && y ===3;
      
      sl && log(neighbors);
      
      for(let n of neighbors) {
        const cost = grid.get(n.x, n.y);
        const current = info.get(n.x, n.y);

        sl && log(' ', n, cost, current);

        if (currentCost.cost + cost < current.cost ) {
          info.set(n.x, n.y, {cost: currentCost.cost + cost, path: [...currentCost.path, n]});
        }
      }
    }
  }
  

  const lowest = info.get(info.bounds.right, info.bounds.bottom);
  log(visualizeGrid(info, (x, y) => {
    const f = lowest.path.find(p => p.x === x && p.y === y);
    const colorFn = colors[grid.get(x, y)];
    return colorFn( f ? '#' : '.');    
  }));

  log(visualizeGrid(info, (x, y) => {
    const value = info.get(x, y).cost;
    return String(value).padStart(4);
  }));

  
  return lowest.cost;
}


// ----------------------------------------------------
const minPath = (grid, x, y) => {

  function makeArray(width, height) {
    let outputArray = new Array(height);
    let row         = new Array(width);
    for(let iy = 0; iy < height; iy++) {
      outputArray[iy] = row.slice();
    }
    return outputArray;
  }

  function initArrayBorders(outputArray, grid, width, height)  {
    outputArray[0][0] = 0; //grid[0][0];
    for (let ix = 1; ix < width; ix++) {
      outputArray[ix][0] = outputArray[ix-1][0] + grid[ix][0];
    }  
    for (let iy = 1; iy < height; iy++) {
      outputArray[0][iy] = outputArray[0][iy-1] + grid[0][iy];
    }  
  }

  function fillArray(outputArray, grid, width, height) {
    for (let ix = 1; ix < width; ix++) {
      for (let iy = 1; iy < height; iy++) {
        let minWeight = Math.min(outputArray[ix-1][iy], 
          outputArray[ix][iy-1]);
        outputArray[ix][iy] = minWeight + grid[ix][iy];
      }
    }
  }

  let width = x + 1, height = y + 1;
  let outputArray = makeArray(width, height);
  initArrayBorders(outputArray, grid, width, height);
  fillArray(outputArray, grid, width, height);
  // console.table(outputArray);

  return outputArray; //[x][y];
};
// ----------------------------------------------------
