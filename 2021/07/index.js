
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
  // return withBinarySearch(input);
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

// binary search
export function withBinarySearch(input) {
  const moveTo = pos => {
    return input.reduce((sum, value) => {
      let diff = Math.abs(pos - value);
      let cost = sumSeries(diff);
      return sum + cost;
    }, 0);
  };

  const last = maxOf(input);
  const first = minOf(input);

  let left = first;
  let right = last;  
  while (left < right) {
    let mid = Math.floor(left + (right - left) / 2);
    const l1 = moveTo(mid - 1);
    const l0 = moveTo(mid);
    const l2 = moveTo(mid + 1);
    if (l0 < l1 && l0 < l2) {
      return l0;
    }
    if (l1 < l0) {
      right = mid;
    } else {
      left = mid + 1;
    }
  }
  console.log('oops');
}
