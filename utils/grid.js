import {minOf, maxOf} from './array';
import {PriorityQueue} from './data-structures';
import { loadGrid } from './map';

export function* pointsWithin(gridOrBounds) {
  const bounds = gridOrBounds.bounds || gridOrBounds;
  for(let z = bounds.zMin; z <= bounds.zMax; z++) {
    for(let y = bounds.top; y <= bounds.bottom; y++) {
      for(let x = bounds.left; x <= bounds.right; x++) {
        yield [x, y, z];
      }
    }
  }
}

export function visualizeGrid(gridOrBounds, render) {
  const lines = [];
  // Allow the caller to pass a grid or bounds
  const {left = 0, top = 0, bottom, right} = gridOrBounds.bounds || gridOrBounds;

  for(let y = top; y <= bottom; y++) {
    let line = '';
    for(let x = left; x <= right; x++) {
      line += render(x, y);
    }
    lines.push(line);
  }
  return lines.join('\n');
}

export function boundsOfGrid(grid) {
  return {
    left: 0,
    right: grid[0].length - 1,
    top: 0,
    bottom: grid.length - 1,
    width: grid[0].length,
    height: grid.length
  };
}

export function findBounds(input, accessX = p => p[0], accessY = p => p[1]) {
  return {
    left: minOf(input, accessX),
    right: maxOf(input, accessX),
    top: minOf(input, accessY),
    bottom: maxOf(input, accessY),
    get width() {
      return this.right - this.left +1;
    },
    get height() {
      return this.bottom - this.top + 1;
    }
  };
}

// based off of https://medium.com/@adriennetjohnson/a-walkthrough-of-dijkstras-algorithm-in-javascript-e94b74192026
export function dijkstra(grid, start, end) {
  
  if (Array.isArray(grid)) {
    grid = loadGrid(grid);
  }
  
  let times = {};
  let backtrace ={};
  let queue = new PriorityQueue(item => item[1]);

  const keyOf = ({x,y}) => `${x},${y}`;

  const getNeighbors = ({x,y}) => {

    const getInfo = (x, y) => {
      if (!grid.bounds.contains(x, y) ) return null;              
      return {
        pos: {x, y}, 
        cost: grid.get(x, y)
      };        
    };
    return [
      getInfo(x - 1, y), 
      getInfo(x + 1, y), 
      getInfo(x, y - 1), 
      getInfo(x, y + 1)
    ].filter(Boolean).sort((l, r) => l.cost - r.cost);
  };
  
  for(let [x,y] of pointsWithin(grid)) {
    times[keyOf({x,y})] = Number.MAX_SAFE_INTEGER;
  }
  times[keyOf(start)] = 0;

  queue.push([start, 0]);
  while (queue.length > 0) {
    const [pos, cost] = queue.pop();

    const neighbors = getNeighbors(pos);
    neighbors.forEach(n => {
      const time = times[keyOf(pos)] + n.cost;
      if (time < times[keyOf(n.pos)]) {
        times[keyOf(n.pos)] = time;
        backtrace[keyOf(n.pos)] = pos;
        queue.push([n.pos, time]);
      }
    });
  }
  
  let path = [end];
  let lastPos = end;
  while(!(lastPos.x === start.x && lastPos.y === start.y)) {
    const prev = backtrace[keyOf(lastPos)];
    path.unshift(prev);
    lastPos = prev;
  }

  return {
    cost: times[keyOf(end)],
    path
  };
}