import {loadInput, maxOf} from '../../utils';

function part1() {
    const input = loadInput(2020,10).split('\n').map(x => +x);
    const sorted = [...input].sort((l,r) => l - r);

    const difference = sorted.map((value, index) => index === 0 ? value - 0 : value - sorted[index - 1]);

    const counts = difference.reduce((acc, value) => {
        acc.set(value, (acc.get(value) ?? 0) + 1);
        return acc;
    }, new Map());

    const ones = counts.get(1);
    const threes = counts.get(3) + 1;

    console.log('Part I :',ones * threes);
}

function part2() {
    const input = loadInput(2020,10).split('\n').map(x => +x);
    const sorted = [0, ...input].sort((l,r) => l - r);

    const device = maxOf(input, x => x) + 3;

    sorted.push(device);

    const cache = new Map();
    function findNext(input) {

        const reversed = input.reverse();
        cache.set(reversed[0], 1);
        function inc(parent, child) {
            cache.set(
                parent,
                (cache.get(parent) ?? 0) + cache.get(child)
            );
        }
        for(let i = 0; i < reversed.length - 1; i++) {
            const parent = reversed[i];
            for(let n = 1; n <=3; n++) {
                if (i+n >= reversed.length) break;
                const child = reversed[i+n];
                if (parent - child > 3) break;

                inc(child, parent);
            }
        }
        return cache.get(0);
    }

    const value = findNext(sorted);
    console.log('Part II:', value);
}

part1();
part2();