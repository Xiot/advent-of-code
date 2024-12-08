export interface CombinedMap<T, R> {
  append(key: string, value: T): R;
  get(key: string): R;
  entries(): MapIterator<[string, R]>;
  values(): MapIterator<R>;
  keys(): MapIterator<string>;
  [Symbol.iterator](): MapIterator<[string, R]>;
}

export function counterMap() {
  return combineMap<number, number>(0, (acc, cur) => acc + cur);
}

export function createGroupBy<T>() {
  return combineMap<T, T[]>([], (acc, cur) => [...acc, cur]);
}

export function combineMap<T, R>(defaultValue: R, reducer: (acc: R, cur: T) => R): CombinedMap<T, R> {
  let cache = new Map<string, R>();

  const getValue = key => cache.get(key) ?? defaultValue;

  return {
    append(key, value) {
      const total = reducer(getValue(key), value);
      cache.set(key, total);
      return total;
    },
    get: getValue,
    entries() {
      return cache.entries();
    },
    values() {
      return cache.values();
    },
    keys() {
      return cache.keys();
    },
    [Symbol.iterator]() {
      return cache.entries();
    },
  };
}
