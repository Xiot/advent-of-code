
function assertPosition(x, y) {
    if ((typeof x !== 'number') || (typeof y !== 'number')) {
        throw new Error(`Invalid position. ${x}, ${y}`);
    }
}

export function extendBounds(b, left, top, right, bottom, zMin, zMax) {
    return createBounds({
        left:         b.left + left,
        top: b.top + top,
        right: b.right + right,
        bottom: b.bottom + bottom,
        zMin: b.zMin + (zMin ?? 0),
        zMax: b.zMax + (zMax ?? 0)
    });
}

export function createBounds(initialBounds) {
    let bounds = initialBounds;

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
        }
    };
}

export function createGridMap(defaultValue) {
    const cache = new Map();
    const keyOf = (x, y) => `${x},${y}`;
    const parseKey = key => key.split(',').map(v => parseInt(v));

    const bounds = createBounds();

    return {
        clone() {
            const clone = createGridMap(defaultValue);
            Array.from(this.entries()).forEach(([{x, y}, value]) => clone.set(x, y, value));
            return clone;
        },
        has(x, y) {
            assertPosition(x, y);
            return cache.has(keyOf(x, y));
        },
        get(x, y) {
            assertPosition(x, y);
            bounds.mark(x, y);

            let value = cache.get(keyOf(x, y));
            if (value) { return value; }
            if (defaultValue === undefined) {
                return undefined;
            }
            value = typeof defaultValue === 'function'
                ? defaultValue(x, y)
                : defaultValue;

            return value;
        },
        set(x, y, value) {
            assertPosition(x, y);
            bounds.mark(x, y);

            const valueToSet = typeof value === 'function'
                ? value(this.get(x, y))
                : value;

            cache.set(keyOf(x, y), valueToSet);
        },
        get bounds() {
            return bounds;
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