export function counterMap() {
    return combineMap(0, (acc, cur) => acc + cur);
}

export function createGroupBy() {
    return combineMap([], (acc, cur) => [...acc, cur]);
}

export function combineMap(defaultValue, reducer) {
    let cache = new Map();

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
        }
    };
}