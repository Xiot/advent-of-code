import {minBy, maxBy} from 'lodash';

export function* pointsWithin(item) {
  for(let z = item.zMin; z <= item.zMax; z++) {
    for(let y = item.top; y <= item.bottom; y++) {
      for(let x = item.left; x <= item.right; x++) {
        yield [x, y, z];
      }
    }
  }
}

export function visualizeGrid(gridOrBounds, render) {
  const lines = [];
  // Allow the caller to pass a grid or bounds
  const bounds = gridOrBounds.bounds || gridOrBounds;

  for(let y = bounds.top; y <= bounds.bottom; y++) {
    let line = '';
    for(let x = bounds.left; x <= bounds.right; x++) {
      line += render(x, y);
    }
    lines.push(line);
  }
  return lines.join('\n');
}

export const maxOf = (arr, accessor) => accessor(maxBy(arr, accessor));
export const minOf = (arr, accessor) => accessor(minBy(arr, accessor));

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