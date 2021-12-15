
import { autoParse, log, byLine, loadGrid, visualizeGrid, createGridMap, pointsWithin, dijkstra } from "../../utils";
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
  return part1_dijkstra(input);

}

export function part2(input) {
  const originalGrid = loadGrid(input);
  const largeGrid = originalGrid.clone();

  const tileWidth = originalGrid.bounds.width;
  const tileHeight = originalGrid.bounds.height;
  for(let ty = 0; ty < 5; ty++) {
    for(let tx = 0; tx < 5; tx++) {
      if (tx === 0 && ty === 0) continue;
      for(let y = 0; y < tileHeight; y++) {
        for(let x = 0; x < tileWidth; x++) {

          const nextValue = (originalGrid.get(x, y) + tx + ty);
          const newValue = nextValue > 9 ? nextValue - 9 : nextValue;          

          if (x === 4 && y === 0 && ty === 0) {
            log(' ',tx, nextValue, newValue);
          }
          largeGrid.set(
            x + tx * tileWidth, 
            y + ty * tileHeight,
            newValue);
        }
      }
    }
  }

  const lowest = dijkstra(largeGrid, {x: 0, y: 0}, {x: largeGrid.bounds.right, y: largeGrid.bounds.bottom});

  log(visualizeGrid(largeGrid, (x, y) => {
    const f = lowest.path.find(p => p.x === x && p.y === y);
    const colorFn = colors[largeGrid.get(x, y)];
    return colorFn( f ? '#' : '.');    
  }));

  return lowest.cost;  
}    

function part1_dijkstra(input) {
  const grid = loadGrid(input);
  const lowest = dijkstra(grid, {x:0, y:0}, {x: input[0].length-1, y: input.length-1});

  log(visualizeGrid(grid, (x, y) => {
    const f = lowest.path.find(p => p.x === x && p.y === y);
    const colorFn = colors[grid.get(x, y)];
    return colorFn( f ? '#' : '.');    
  }));

  return lowest.cost;
}

function part1_cost_map(input) {

  const grid = loadGrid(input);
  const info = createGridMap(() => ({cost: 999, path: []}));

  const keyOf = (x, y) => `${x},${y}`;
  const stack = [];
  stack.push([{x:0, y: 0}, {[keyOf(0,0)]: true}, [], 0]);

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

  let lowest = Number.MAX_SAFE_INTEGER;
  while(stack.length > 0) {    

    const [{x, y}, visited, path, cost] = stack.pop();

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
    if (x === 0 && y === 0) {
      console.log(n);
    }

    n.reverse().forEach(info => {
      stack.push(info);
    });
  }

  return lowest;
}

