
import { autoParse, log, byLine, createGridMap, visualizeGrid } from "../../utils";

const LINE_RE = /x=(-?\d+), y=(-?\d+).+x=(-?\d+), y=(-?\d+)/i;

export const parse = byLine(line => {
  const m = LINE_RE.exec(line);

  const sensor = {
    x: parseInt(m[1]),
    y: parseInt(m[2]),
  };
  const beacon = {
    x: parseInt(m[3]),
    y: parseInt(m[4])
  };
  const distance = Math.abs(beacon.x - sensor.x) + Math.abs(beacon.y - sensor.y);
  return {
    sensor,
    beacon  ,
    distance    
  };
});

export function part1(input) {
  // log('input', input);

  const grid = createGridMap('.');
  for(let line of input) {
    grid.set(line.sensor.x, line.sensor.y, 'S');
    grid.set(line.beacon.x, line.beacon.y, 'B');
  }

  const y = global.args.inputName === 'sample.txt' ? 10 : 2000000;
  log(y);
  fillLine(y, grid, input);  
  const count =countFilled(grid, y);

  // console.log(
  //   visualizeGrid(grid, (x, y) => grid.get(x, y), {printRowNumbers: true})
  // );
  return count;
}

function countFilled(grid, y) {
  let sum = 0;
  for(let x = grid.bounds.left; x <= grid.bounds.right; x++) {
    const v = grid.get(x, y);
    if (v === '#' || v === 'S') {
      sum++;
    }
  }
  return sum;
}

function fillLine(rowNo, grid, items) {

  for(let item of items) {
    for(let x = item.sensor.x - item.distance; x < item.sensor.x + item.distance; x++) {
      const d = distanceBetween(item.sensor, {x, y: rowNo});
      if (d <= item.distance) {

        if (!grid.has(x, rowNo)) {
          grid.set(x, rowNo, '#');
        }
      }
    }
  }
}

function distanceBetween(left, right) {
  return Math.abs(right.x - left.x) + Math.abs(right.y - left.y);
}

export function part2(input) {

  const grid = createGridMap('.');
  for(let line of input) {
    grid.set(line.sensor.x, line.sensor.y, 'S');
    grid.set(line.beacon.x, line.beacon.y, 'B');
  }

  const max = global.args.inputName === 'sample.txt' 
    ? {x: 20, y: 20}
    : {x: 4000000, y: 4000000};

  let result = null;
  for(let y = 0; y <= max.y; y++) {
    const ranges = fillLine2(y, grid, input);    
    if (ranges.length > 1) {
      result = {x: ranges[0][1]+1, y};
      break;
    }
  }

  log('Hole', result);

  return result.x * 4000000 + result.y;
}    

function fillLine2(y, grid, items) {

  let groups = [];

  for(let item of items) {
    const yRange = [item.sensor.y - item.distance, item.sensor.y + item.distance];
    if (y < yRange[0] || y > yRange[1]) continue;

    const yDistance = Math.abs(item.sensor.y - y);
    const diff = item.distance - yDistance;
    const xRange = [item.sensor.x - diff, item.sensor.x + diff];

    groups.push(xRange);
  }

  return mergeRanges(groups);
}

function mergeRanges(ranges) {

  if (ranges.length === 1) {
    return ranges;
  }

  ranges.sort((l, r) => {
    if (l[0] === r[0]) {
      return l[1] - r[1];
    }
    return l[0] - r[0];
  });

  let merged = [];
  let prev = ranges[0];
  for(let i = 1; i < ranges.length; i++) {
    const cur = ranges[i];
    if (cur[0] <= prev[1] + 1) {
      prev = [prev[0], Math.max(prev[1], cur[1])];
    } else {
      merged.push(prev);
      prev = [...cur];
    }
  }
  merged.push(prev);
  return merged;
}