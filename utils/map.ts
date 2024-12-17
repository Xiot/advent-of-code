import { maxOf, minOf } from './array';
import { Point } from './types';

function assertPosition(x: number, y: number) {
  if (typeof x !== 'number' || typeof y !== 'number') {
    throw new Error(`Invalid position. ${x}, ${y} [${typeof x}, ${typeof y}]`);
  }
}

export type BoundingBox = {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly zMin: number;
  readonly zMax: number;
};

export type Dimensions = {
  readonly width: number;
  readonly height: number;
  readonly depth: number;
};

export type Bounds = BoundingBox &
  Dimensions & {
    toJSON(): BoundingBox & Dimensions;
    valueOf(): BoundingBox;
    mark(x: number, y: number, z?: number): Bounds;
    contains(x: number, y: number, z?: number): boolean;
    equals(other: BoundingBox): boolean;
    readonly length: number;
  };

export function extendBounds(b: Bounds, left: number, top: number, right: number, bottom: number, zMin = 0, zMax = 0) {
  return createBounds({
    left: b.left + left,
    top: b.top + top,
    right: b.right + right,
    bottom: b.bottom + bottom,
    zMin: b.zMin + (zMin ?? 0),
    zMax: b.zMax + (zMax ?? 0),
  });
}

export function createBounds(initialBounds?: Partial<BoundingBox>, opt = { order: true }): Bounds {
  let bounds = null;
  initialBounds = Object.assign({ left: 0, right: 0, top: 0, bottom: 0, zMin: 0, zMax: 0 }, initialBounds);

  if (initialBounds && opt?.order) {
    bounds = {
      left: Math.min(initialBounds.left, initialBounds.right),
      right: Math.max(initialBounds.left, initialBounds.right),
      top: Math.min(initialBounds.top, initialBounds.bottom),
      bottom: Math.max(initialBounds.top, initialBounds.bottom),
      zMin: Math.min(initialBounds.zMin, initialBounds.zMax),
      zMax: Math.max(initialBounds.zMin, initialBounds.zMax),
    };
  } else if (initialBounds) {
    bounds = initialBounds;
  }

  function set(left, top, right, bottom, zMin, zMax) {
    bounds = { left, top, right, bottom, zMin, zMax };
  }

  return {
    get left() {
      return bounds?.left ?? 0;
    },
    get right() {
      return bounds?.right ?? 0;
    },
    get top() {
      return bounds?.top ?? 0;
    },
    get bottom() {
      return bounds?.bottom ?? 0;
    },

    get zMin() {
      return bounds?.zMin ?? 0;
    },
    get zMax() {
      return bounds?.zMax ?? 0;
    },

    get width() {
      return !bounds ? undefined : bounds.right - bounds.left + 1;
    },
    get height() {
      return !bounds ? undefined : bounds.bottom - bounds.top + 1;
    },
    get depth() {
      return this.zMax - this.zMin + 1;
    },

    toJSON() {
      return { ...bounds, width: this.width, height: this.height };
    },
    valueOf() {
      return bounds;
    },

    mark(x, y, z = 0) {
      if (!bounds) {
        set(x, y, x, y, z, z);
      } else {
        set(
          Math.min(this.left, x),
          Math.min(this.top, y),
          Math.max(this.right, x),
          Math.max(this.bottom, y),
          Math.min(this.zMin, z),
          Math.max(this.zMax, z),
        );
      }
      return this;
    },
    contains(x, y, z = 0) {
      return this.left <= x && x <= this.right && this.top <= y && y <= this.bottom && this.zMin <= z && z <= this.zMax;
    },
    get length() {
      return (this.right - this.left + 1) * (this.bottom - this.top + 1) * (this.zMax - this.zMin + 1);
    },
    equals(r) {
      return (
        this.left === r.left &&
        this.right === r.right &&
        this.top === r.top &&
        this.bottom === r.bottom &&
        this.zMin === r.zMin &&
        this.zMax === r.zMax
      );
    },
  };
}

export function loadGrid(data, defaultValue) {
  if (typeof data === 'string') {
    data = data.split('\n');
  }
  const grid = createGridMap(defaultValue);
  for (let y = 0; y < data.length; y++) {
    for (let x = 0; x < data[0].length; x++) {
      grid.set(x, y, data[y][x]);
    }
  }
  return grid;
}

export function createGridMap(defaultValue: string | ((x: number, y: number) => string)): GridMap {
  const cache = new Map<string, string>();
  const keyOf = (x: number, y: number) => `${x},${y}`;
  const parseKey = (key: string): [x: number, y: number] =>
    // @ts-expect-error - type will be fine
    key.split(',').map(v => parseInt(v) as [x: number, y: number]);

  let bounds = createBounds();

  let markOnGet = true;
  return {
    get markOnGet() {
      return markOnGet;
    },
    set markOnGet(value) {
      markOnGet = value;
    },
    clone(this: GridMap) {
      const clone = createGridMap(defaultValue);
      clone.markOnGet = markOnGet;

      Array.from(this.entries()).forEach(([{ x, y }, value]) => clone.set(x, y, value));
      return clone;
    },
    empty(this: GridMap, x: number, y: number) {
      assertPosition(x, y);
      return this.get(x, y) === defaultValue;
    },
    has(x: number, y: number) {
      assertPosition(x, y);
      return cache.has(keyOf(x, y));
    },
    get(...args: any[]) {
      let x, y;
      if (typeof args[0] === 'number') {
        x = args[0];
        y = args[1];
      } else if (typeof args[0] === 'object' && 'x' in args[0]) {
        x = args[0].x;
        y = args[0].y;
      } else {
        throw new Error('invalid pos');
      }

      assertPosition(x, y);
      markOnGet && bounds.mark(x, y);

      let value = cache.get(keyOf(x, y));
      if (value != null) {
        return value;
      }
      if (defaultValue === undefined) {
        return undefined;
      }
      value = typeof defaultValue === 'function' ? defaultValue(x, y) : defaultValue;

      return value;
    },
    unset(x: number, y: number) {
      cache.delete(keyOf(x, y));
    },
    set(x: number, y: number, value: undefined | string | ((prev: string) => string | undefined)) {
      assertPosition(x, y);
      bounds.mark(x, y);

      const valueToSet = typeof value === 'function' ? value(this.get(x, y)) : value;

      if (valueToSet === undefined) {
        cache.delete(keyOf(x, y));
      } else {
        cache.set(keyOf(x, y), valueToSet);
      }
      return valueToSet;
    },
    get bounds() {
      return bounds;
    },
    recalculateBounds(this: GridMap) {
      const keys = Array.from(this.keys());
      bounds = createBounds({
        left: minOf(keys, k => k.x),
        right: maxOf(keys, k => k.x),
        top: minOf(keys, k => k.y),
        bottom: maxOf(keys, k => k.y),
      });
      return bounds;
    },
    ring: function* (cx: number, cy: number) {
      for (let x = cx - 1; x <= cx + 1; x++) {
        for (let y = cy - 1; y <= cy + 1; y++) {
          if (x === cx && y === cy) continue;
          if (bounds.contains(x, y)) {
            yield [{ x, y }, this.get(x, y)];
          }
        }
      }
    },
    values() {
      return cache.values();
    },
    keys: function* () {
      for (let key of cache.keys()) {
        const [x, y] = parseKey(key);
        yield { x, y };
      }
    },
    entries: function* (): Generator<[{ x: number; y: number }, string]> {
      for (let [key, value] of cache.entries()) {
        const [x, y] = parseKey(key);
        yield [{ x, y }, value];
      }
    },
    prune(bounds: BoundingBox) {
      const clone = createGridMap(defaultValue);
      for (let x = bounds.left; x <= bounds.right; x++) {
        for (let y = bounds.top; y <= bounds.bottom; y++) {
          if (cache.get(keyOf(x, y))) {
            clone.set(x, y, cache.get(keyOf(x, y)));
          }
        }
      }
      return clone;
    },
    get length() {
      return cache.size;
    },
  };
}

export function createBucketMap<T, K = string>(keyFn: (item: T) => K) {
  const cache = new Map<K, T[]>();
  return {
    add(value: T) {
      const key = keyFn(value);
      let bucket = cache.get(key);
      if (!bucket) {
        bucket = [];
        cache.set(key, bucket);
      }
      bucket.push(value);
    },
    getBucketFor(item: T) {
      const key = keyFn(item);
      let bucket = cache.get(key);
      if (bucket) return bucket;

      bucket = [];
      cache.set(key, bucket);
      return bucket;
    },
    values() {
      return cache.values();
    },
    keys() {
      return cache.keys();
    },
    entries() {
      return cache.entries();
    },
    bucketSize(value) {
      const key = keyFn(value);
      const bucket = cache.get(key);
      return bucket?.length ?? 0;
    },
    get size() {
      return cache.size;
    },
  };
}

export type GridMapEntry = [{ x: number; y: number }, string];
export interface GridMap {
  markOnGet: boolean;

  empty(x: number, y: number): boolean;
  has(x: number, y: number): boolean;
  get(pos: Point): string | undefined;
  get(x: number, y: number): string | undefined;
  unset(x: number, y: number): void;
  set(
    x: number,
    y: number,
    value: string | undefined | ((prev: string | undefined) => string | undefined),
  ): string | undefined;

  values(): IterableIterator<string>;
  keys(): IterableIterator<{ x: number; y: number }>;
  entries(): Generator<GridMapEntry>;

  readonly bounds: Bounds;
  recalculateBounds(): Bounds;
  ring(cx: number, cy: number): Generator<GridMapEntry>;

  clone(): GridMap;
  prune(bounds: BoundingBox): GridMap;

  readonly length: number;
}
