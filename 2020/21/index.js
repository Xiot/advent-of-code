import {loadInput} from '../../utils';

function part1(input) {
    const data = parseInput(input);

    const noAllergens = findInert(data);
    const timesUsed = data.reduce((sum, r) => {
        return sum + r.ingredients.reduce((s, i) => s + (noAllergens.includes(i) ? 1 : 0), 0);
    }, 0);

    return timesUsed;

}
function findInert(data) {

    const ingredients = createLookup();
    for(let line of data) {
        for(let ing of line.ingredients) {
            ingredients.add(ing, line.allergens);
        }
    }

    const hasAllergens = new Set();

    for(let recipe of data) {
        for(let ing of recipe.ingredients) {

            for (let al of recipe.allergens) {
                const others = data.filter(r => r.allergens.includes(al));
                const withIngredent = others.filter(r => r.ingredients.includes(ing));
                if (others.length === withIngredent.length) {
                    hasAllergens.add(ing);
                }
            }
        }
    }

    const noAllergens = Array.from(ingredients.keys()).filter(x => !hasAllergens.has(x));
    return noAllergens;
}

function createLookup() {
    const cache = new Map();

    return {
        cache,
        clone() {
            const cloned = createLookup();
            for(let [key, value] of this.cache) {
                cloned.set(key, value);
            }
            return cloned;
        },
        get(key) {
            if (!cache.has(key)) {
                cache.set(key, new Set());
            }
            return cache.get(key);
        },
        add(key, value) {
            const set = this.get(key);
            if (Array.isArray(value)) {
                value.forEach(x => set.add(x));

                return this;
            }
            set.add(value);
            return this;
        },
        remove(key, value) {
            const set = this.get(key);
            set.delete(value);
        },
        set(key, value) {
            if (Array.isArray(value) || value instanceof Set) {
                cache.set(key, new Set(value));
                return;
            }

            cache.set(key, new Set([value]));
        },
        has(key) {return cache.has(key);},
        delete(key) {
            cache.delete(key);
        },
        keysWith(value) {
            return Array.from(cache.entries()).filter(([key, list])=> list.has(value)).map(x => x[0]);
        },
        singles() {
            return Array.from(cache.entries()).filter(([key, set]) => set.size === 1).map(x => x[0]);
        },
        keys() { return cache.keys(); },
        toJSON() { return cache; }
    };
}

function part2(input) {
    const data = parseInput(input);

    const allergens = createLookup();
    for(let line of data) {
        for(let allergen of line.allergens) {
            allergens.add(allergen, line.ingredients);
        }
    }
    const ingredients = createLookup();
    for(let line of data) {
        for(let ing of line.ingredients) {
            ingredients.add(ing, line.allergens);
        }
    }

    const inert = findInert(data);

    for(let ing of inert) {
        ingredients.delete(ing);
        allergens.keysWith(ing).forEach(x => {
            allergens.remove(x, ing);
        });
        for(let r of data) {
            if (r.ingredients.includes(ing)) {
                r.ingredients = r.ingredients.filter(i => i !== ing);
            }
        }
    }

    data.sort((l, r) => l.allergens.length - r.allergens.length);

    const reduced = Array.from(allergens.keys()).reduce((acc, key) => {
        const hasDairy = data.filter(x => x.allergens.includes(key));
        const alwasyDairy = hasDairy.reduce((acc, r) => {
            r.ingredients.forEach(i => {
                acc.set(i, (acc.get(i) ?? 0) + 1);
            });
            return acc;
        }, new Map());

        const ee = Array.from(alwasyDairy.entries())
            .filter(([key, value]) => value === hasDairy.length)
            .map(x => x[0]);

        acc.set(key, ee);
        return acc;
    }, createLookup());

    const order = Array.from(reduced.cache.entries())
        .sort((l, r) => l[1].size - r[1].size)
        .map(x => x[0]);

    const known = new Map();
    const ret = reduced.clone();
    for(let i = 0; i < 2; i++) {
        for(let al of order) {
            const ing = ret.get(al);
            if (ing.size === 1) {
                const first = Array.from(ing)[0];
                known.set(al, first);
                ret.keysWith(first).forEach(k => ret.remove(k, first));
            }
        }
    }

    return Array.from(known.entries())
        .sort((l, r) => l[0].localeCompare( r[0]))
        .map(x => x[1])
        .join(',');
}

function parseInput(input) {
    return input.split('\n').map(line => {
        const parts = line.split('(contains');
        const ingredients = parts[0].split(' ').filter(Boolean);
        const allergens = parts[1].slice(0, parts[1].length - 1).split(', ').map(x => x.trim());
        return {
            ingredients,
            allergens
        };
    });
}

(function solve() {
    const input = loadInput(2020, 21);
    console.log('Part I :', part1(input));
    console.log('Part II:', part2(input));
})();