import {minBy, maxBy} from 'lodash';

export function permutations(values) {
  if (values.length === 0) { return [[]]; }
  if (values.length === 1) { return [[...values]]; }

  const items = [];
  for(let i = 0; i < values.length; i++) {
    const item = values[i];
    const others = values.slice(0, i).concat(values.slice(i+1));
    for(let p of permutations(others)) {
      items.push([item, ...p]);
    }
  }
  return items;
}

export const maxOf = (arr, accessor = x => x) => accessor(maxBy(arr, accessor));
export const minOf = (arr, accessor = x => x) => accessor(minBy(arr, accessor));
export const sumOf = (arr, accessor = x => x) => arr.reduce((sum, value) => sum + accessor(value), 0);
