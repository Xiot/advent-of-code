
import { autoParse, log, byLine } from "../../utils";

export const parse = byLine(x => x.split('').map(n => parseInt(n)));

export function part1(input) {
  log('input', input);

  const visible = new Set();

  // left -> right
  for(let y = 0; y < input.length; y++) {
    let lastHeight = -1;
    for(let x = 0; x < input[0].length; x++) {
      const h = input[y][x];
      if (h > lastHeight) {
        lastHeight = h;
        visible.add(keyOf(x, y));
      }
    }
  }

  // right -> left
  for(let y = 0; y < input.length; y++) {
    let lastHeight = -1;
    for(let x = input[0].length -1; x >=0; x--) {
      const h = input[y][x];

      if (h > lastHeight) {
        lastHeight = h;
        visible.add(keyOf(x, y));
      } 
    }
  }

  // top -> bottom
  for(let x = 0; x < input[0].length; x++) {    
    let lastHeight = -1;
    for(let y = 0; y < input.length; y++) {
      const h = input[y][x];
      if (h > lastHeight) {
        lastHeight =h;
        visible.add(keyOf(x, y));
      } 
    }
  }

  // bottom -> top
  for(let x = 0; x < input[0].length; x++) {    
    let lastHeight = -1;
    for(let y = input.length - 1; y >=0; y--) {
      const h = input[y][x];
      if (h > lastHeight) {
        lastHeight =h;
        visible.add(keyOf(x, y));
      } 
    }
  }
  log(visible);
  return visible.size;
}

export function part2(input) {
  log(input);

  let max = 0;
  for(let y = 1; y < input.length; y++) {
    for(let x = 1; x < input[0].length - 1; x++) {
      const score = viewingDistance(input, y, x);
      if (score > max) {
        max = score;
      }
    }
  }

  return max;
}    

function keyOf(x, y) {
  return `${y}|${x}`;
}

function viewingDistance(input, y, x) {
  const mh = input[y][x];
  let lastHeight = mh;

  let left = 0;
  let right = 0;
  let up = 0;
  let down = 0;

  // left
  lastHeight = mh;
  for(let xi = x-1; xi >=0; xi--) {
    const h = input[y][xi];
    if (h < lastHeight) {
      left++;
    } else {
      lastHeight = h;
      left++;
      break;
    }
  }

  // right
  lastHeight = mh;
  for(let xi = x+1; xi < input[0].length; xi++) {
    const h = input[y][xi];
    if (h < lastHeight) {
      right++;
    } else {
      right++;
      break;
    }
  }

  
  // up
  lastHeight = mh;
  for(let yi = y-1; yi >=0; yi--) {
    const h = input[yi][x];
    if (h < lastHeight) {
      up++;
    } else {
      lastHeight = h;
      up++;
      break;
    }
  }

  // down
  lastHeight = mh;
  for(let yi = y+1; yi < input.length; yi++) {
    const h = input[yi][x];
    if (h < lastHeight) {
      down++;
    } else {
      lastHeight = h;
      down++;
      break;
    }
  }

  return left * right * up * down;
}