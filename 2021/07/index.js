
import { maxOf, minOf, sumSeries } from "../../utils";

export const parse = text => text.split(',').map(x => parseInt(x));

export function part1(input) {
  
  const moveTo = pos => {
    return input.reduce((sum, value) => sum + Math.abs(pos - value), 0);
  };
  
  const last = maxOf(input, x => x);
  const first = minOf(input, x => x);

  let minFuel = Number.MAX_SAFE_INTEGER;
  let minIndex = -1;
  for(let i = first; i <= last; i++) {
    const sum = moveTo(i);
    console.log(i, sum);
    if (sum < minFuel) {
      minFuel = sum;
      minIndex = i;
    }
  }

  return minFuel;
}

export function part2(input) {

  const moveTo = pos => {
    return input.reduce((sum, value) => {
      let diff = Math.abs(pos - value);
      let cost = sumSeries(diff);
      return sum + cost;
    }, 0);
  };
  
  const last = maxOf(input, x => x);
  const first = minOf(input, x => x);

  let minFuel = Number.MAX_SAFE_INTEGER;

  for(let i = first; i <= last; i++) {
    const sum = moveTo(i);
    
    if (sum < minFuel) {
      minFuel = sum;
    } else {
      return minFuel;
    }
  }

  return minFuel;
}    
