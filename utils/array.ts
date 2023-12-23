import { minBy, maxBy } from 'lodash';

export function permutations<T>(values: T[]) {
  if (values.length === 0) {
    return [[]];
  }
  if (values.length === 1) {
    return [[...values]];
  }

  const items: T[][] = [];
  for (let i = 0; i < values.length; i++) {
    const item = values[i];
    const others = values.slice(0, i).concat(values.slice(i + 1));
    for (let p of permutations(others)) {
      items.push([item, ...p]);
    }
  }
  return items;
}

export function* combinations<T>(array: T[], length = array.length): Generator<T[]> {
  for (let i = 0; i < array.length; i++) {
    if (length === 1) {
      yield [array[i]];
    } else {
      const remaining = combinations(array.slice(i + 1, array.length), length - 1);
      for (let next of remaining) {
        yield [array[i], ...next];
      }
    }
  }
}

export function maxOf(arr: number[]): number;
export function maxOf<T>(arr: T[], accessor: (item: T) => number): number;
export function maxOf(arr: any[], accessor: (item: any) => number = x => x): number {
  return accessor(maxBy(arr, accessor));
}

export function findMaxOf(arr: number[]): number;
export function findMaxOf<T>(arr: T[], accessor: (item: T) => number): T;
export function findMaxOf(arr: any[], accessor: (item: any) => number = x => x): any {
  return maxBy(arr, accessor);
}

export function minOf(arr: number[]): number;
export function minOf<T>(arr: T[], accessor: (item: T) => number): number;
export function minOf(arr: any[], accessor: (item: any) => number = x => x): number {
  return accessor(minBy(arr, accessor));
}

export function sumOf(arr: number[]): number;
export function sumOf<T>(arr: T[], accessor: (item: T) => number): number;
export function sumOf(arr: any[], accessor: (item: any) => number = x => x): number {
  return arr.reduce((sum, value) => sum + accessor(value), 0);
}
