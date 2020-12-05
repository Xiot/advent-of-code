const {loadInput} = require('../../utils');

function part1() {
    const group = loadInput(2020,6).split('\n\n').map(group => group.split('\n'));

    const groupCounts = group.map(g => {
        const m = new Map();
        for(let person of g) {
            for(let q of person) {
                m.set(q, 1);
            }
        }
        return m;
    });
    const totals = groupCounts.reduce((total, g) => {
        for(let e of g.entries()) {
            total.set(e[0], (total.get(e[0]) ?? 0) + 1);
        }
        return total;
    }, new Map());

    const sum = Array.from(totals.entries()).reduce((sum, [key, value]) => {
        return sum +value;
    }, 0);
    const count = totals.size;
    console.log('Part I', sum);
}

const letters = 'abcdefghijklmnopqrstuvwxyz';

function part2() {
    const group = loadInput(2020,6).split('\n\n').map(group => group.split('\n'));

    const groupCounts = group.map(g => {
        const m = new Map();
        for(let person of g) {
            for(let q of person) {
                m.set(q, (m.get(q) ?? 0) + 1);
            }
        }
        m.set('people', g.length);
        return m;
    });

    const totals = groupCounts.reduce((total, g) => {
        const size = g.get('people');
        for(let e of g.entries()) {
            if (e[0] === 'people') continue;
            if (size === e[1])
                total.set(e[0], (total.get(e[0]) ?? 0) + 1);
        }
        return total;
    }, new Map());

    const sum = Array.from(totals.entries()).reduce((sum, [, value]) => {
        return sum +value;
    }, 0);

    console.log('Part I', sum);
}

part1();
part2();