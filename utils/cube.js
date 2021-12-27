import { createBounds } from "./map";
import { maxOf, minOf } from "./array";

function assertPosition(x, y) {
  if ((typeof x !== 'number') || (typeof y !== 'number')) {
    throw new Error(`Invalid position. ${x}, ${y} [${typeof x}, ${typeof y}]`);
  }
}

export function createCube(defaultValue) {
  const cache = new Map();
  const keyOf = (x, y, z) => `${x},${y},${z}`;
  const parseKey = key => key.split(',').map(v => parseInt(v));
  
  const bounds = createBounds();

  let markOnGet = true;
  return {
    get markOnGet() { return markOnGet;},
    set markOnGet(value) { markOnGet = value; },
    clone() {
      const clone = createCube(defaultValue);
      clone.markOnGet = this.markOnGet;
      Array.from(this.entries()).forEach(([{x, y, z}, value]) => clone.set(x, y, z, value));
      return clone;
    },
    has(x, y, z) {
      assertPosition(x, y, z);
      return cache.has(keyOf(x, y, z));
    },
    get(x, y, z) {
      assertPosition(x, y, z);
      markOnGet && bounds.mark(x, y, z);

      let value = cache.get(keyOf(x, y, z));
      if (value != null) { return value; }
      if (defaultValue === undefined) {
        return undefined;
      }
      value = typeof defaultValue === 'function'
        ? defaultValue(x, y, z)
        : defaultValue;

      return value;
    },
    unset(x, y, z) {
      cache.delete(keyOf(x,y, z));
    },
    set(x, y, z, value) {
      assertPosition(x, y, z);
      bounds.mark(x, y, z);

      const valueToSet = typeof value === 'function'
        ? value(this.get(x, y, z))
        : value;

      if (valueToSet === undefined) {
        cache.delete(keyOf(x, y, z));
      } else {
        cache.set(keyOf(x, y, z), valueToSet);
      }
      return valueToSet;
    },
    get bounds() {
      return bounds;
    },
    recalculateBounds() {
      const keys = Array.from(this.keys());
      this.bounds = createBounds({
        left: minOf(keys, k => k.x),
        right: maxOf(keys, k => k.x),
        top: minOf(keys, k => k.y),
        bottom: maxOf(keys, k => k.y),
        zMin: minOf(keys, k => k.z),
        zMax: maxOf(keys, k => k.z)
      });
      return this.bounds;
    },
    // ring: function*(cx, cy) {
    //   for(let x = cx-1; x <= cx+1; x++) {
    //     for(let y = cy-1; y <= cy+1; y++) {
    //       if (x === cx && y === cy) continue;
    //       if(bounds.contains(x, y)) {
    //         yield [{x, y}, this.get(x, y)];
    //       }
    //     }
    //   }
    // },
    values() {
      return cache.values();
    },
    keys: function*() {
      for (let key of cache.keys()) {
        const [x, y, z] = parseKey(key);
        yield {x, y, z};
      }
    },
    entries: function*() {
      for (let [key, value] of cache.entries()) {
        const [x, y,z] = parseKey(key);
        yield [{x, y, z}, value];
      }
    }
  };
}