
function assertPosition(x, y) {
    if ((typeof x !== 'number') || (typeof y !== 'number')) {
        throw new Error(`Invalid position. ${x}, ${y}`);
    }
}

function createBounds(initialBounds) {
    let bounds = initialBounds;

    function set(left, top, right, bottom) {
        bounds = {left, top, right, bottom};
    }

    return {
        get left() {return bounds?.left;},
        get right() {return bounds?.right;},
        get top() {return bounds?.top;},
        get bottom() {return bounds?.bottom; },

        get width() {return !bounds ? undefined : bounds.right - bounds.left + 1;},
        get height() {return !bounds ? undefined : bounds.bottom - bounds.top + 1;},

        toJSON() {
            return bounds;
        },
        valueOf() {
            return bounds;
        },

        mark(x, y) {
            if (!bounds) {
                set(x, y, x, y);
            } else {
                set(
                    Math.min(this.left, x),
                    Math.min(this.top, y),
                    Math.max(this.right, x),
                    Math.max(this.bottom, y)
                );
            }
            return this;
        }
    };
}

export function createGripMap(defaulValue) {
    const cache = new Map();
    const keyOf = (x, y) => `${x},${y}`;
    const parseKey = key => key.split(',').map(v => parseInt(v));

    const bounds = createBounds();

    return {
        has(x, y) {
            assertPosition(x, y);
            return cache.has(keyOf(x, y));
        },
        get(x, y) {
            assertPosition(x, y);
            bounds.mark(x, y);

            let value = cache.get(keyOf(x, y));
            if (value) { return value; }
            if (defaulValue === undefined) {
                return undefined;
            }
            value = typeof defaulValue === 'function'
                ? defaulValue(x, y)
                : defaulValue;

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