import { maxOf, minOf } from "./array";

function assertPosition(x, y) {
  if ((typeof x !== 'number') || (typeof y !== 'number')) {
    throw new Error(`Invalid position. ${x}, ${y} [${typeof x}, ${typeof y}]`);
  }
}

export function extendBounds(b, left, top, right, bottom, zMin, zMax) {
  return createBounds({
    left:   b.left + left,
    top:    b.top + top,
    right:  b.right + right,
    bottom: b.bottom + bottom,
    zMin:   b.zMin + (zMin ?? 0),
    zMax:   b.zMax + (zMax ?? 0)
  });
}

export function createBounds(initialBounds, opt = {order: true}) {

  let bounds = null;
  initialBounds = Object.assign({left: 0, right: 0, top: 0, bottom: 0, zMin: 0, zMax: 0}, initialBounds);
  
  if (initialBounds && opt?.order) {    
    bounds = {
      left: Math.min(initialBounds.left, initialBounds.right),
      right: Math.max(initialBounds.left, initialBounds.right),
      top: Math.min(initialBounds.top, initialBounds.bottom),
      bottom: Math.max(initialBounds.top, initialBounds.bottom),
      zMin: Math.min(initialBounds.zMin, initialBounds.zMax),
      zMax: Math.max(initialBounds.zMin, initialBounds.zMax)
    };
  } else if (initialBounds) {
    bounds = initialBounds;
  }

  function set(left, top, right, bottom, zMin, zMax) {
    bounds = {left, top, right, bottom, zMin, zMax};
  }

  return {
    get left() {return bounds?.left ?? 0;},
    get right() {return bounds?.right ?? 0;},
    get top() {return bounds?.top ?? 0;},
    get bottom() {return bounds?.bottom ?? 0; },

    get zMin() {return bounds?.zMin ?? 0; },
    get zMax() {return bounds?.zMax ?? 0; },

    get width() {return !bounds ? undefined : bounds.right - bounds.left + 1;},
    get height() {return !bounds ? undefined : bounds.bottom - bounds.top + 1;},
    get depth() {return this.zMax - this.zMin + 1;},

    toJSON() {
      return bounds;
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
          Math.max(this.zMax, z)
        );
      }
      return this;
    },
    contains(x, y, z = 0) {
      return this.left <= x && x <= this.right 
        && this.top <= y && y <= this.bottom
        && this.zMin <= z && z <= this.zMax;
    },
    get length() {
      return (this.right - this.left + 1) *
      (this.bottom - this.top +1) *
      (this.zMax - this.zMin + 1);
    },
    equals(r) {
      return this.left === r.left 
        && this.right === r.right
        && this.top === r.top
        && this.bottom === r.bottom
        && this.zMin === r.zMin
        && this.zMax === r.zMax;
    }
  };
}

export function loadGrid(data, defaultValue) {
  const grid = createGridMap(defaultValue);
  for(let y = 0; y < data.length; y++) {
    for(let x = 0; x < data[0].length; x++) {
      grid.set(x, y, data[y][x]);
    }
  }
  return grid;
}

export function createGridMap(defaultValue) {
  const cache = new Map();
  const keyOf = (x, y) => `${x},${y}`;
  const parseKey = key => key.split(',').map(v => parseInt(v));
  
  let bounds = createBounds();

  let markOnGet = true;
  return {
    get markOnGet() { return markOnGet;},
    set markOnGet(value) { markOnGet = value; },
    clone() {
      const clone = createGridMap(defaultValue);
      clone.markOnGet = this.markOnGet;
      Array.from(this.entries()).forEach(([{x, y}, value]) => clone.set(x, y, value));
      return clone;
    },
    has(x, y) {
      assertPosition(x, y);
      return cache.has(keyOf(x, y));
    },
    get(x, y) {
      assertPosition(x, y);
      markOnGet && bounds.mark(x, y);

      let value = cache.get(keyOf(x, y));
      if (value != null) { return value; }
      if (defaultValue === undefined) {
        return undefined;
      }
      value = typeof defaultValue === 'function'
        ? defaultValue(x, y)
        : defaultValue;

      return value;
    },
    unset(x, y) {
      cache.delete(keyOf(x,y));
    },
    set(x, y, value) {
      assertPosition(x, y);
      bounds.mark(x, y);

      const valueToSet = typeof value === 'function'
        ? value(this.get(x, y))
        : value;

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
    recalculateBounds() {
      const keys = Array.from(this.keys());
      bounds = createBounds({
        left: minOf(keys, k => k.x),
        right: maxOf(keys, k => k.x),
        top: minOf(keys, k => k.y),
        bottom: maxOf(keys, k => k.y)
      });
      return bounds;
    },
    ring: function*(cx, cy) {
      for(let x = cx-1; x <= cx+1; x++) {
        for(let y = cy-1; y <= cy+1; y++) {
          if (x === cx && y === cy) continue;
          if(bounds.contains(x, y)) {
            yield [{x, y}, this.get(x, y)];
          }
        }
      }
    },
    values() {
      return cache.values();
    },
    keys: function*() {
      for (let key of cache.keys()) {
        const [x, y] = parseKey(key);
        yield {x, y};
      }
    },
    entries: function*() {
      for (let [key, value] of cache.entries()) {
        const [x, y] = parseKey(key);
        yield [{x, y}, value];
      }
    }
  };
}