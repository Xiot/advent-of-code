import {loadInput} from '../../utils';

function part1() {
    const values = loadInput(2020, 1).split('\n').map(x => parseInt(x));

    const cache = Object.create(null);
    values.forEach(x => {
        cache[x] = x;
        const diff = 2020 - x;
        if (cache[diff]) {
            console.log(x, diff, x * diff);
        }
    });
}

function part2() {
    const values = loadInput(2020, 1).split('\n').map(x => parseInt(x));
    const cache = Object.create(null);
    values.forEach(x => {
        cache[x] = x;
    });

    values.forEach(x => {
        values.forEach(y => {
            const two = x + y;
            const diff = 2020 - two;
            if (cache[diff]) {
                console.log(x, y, diff, x * y * diff);
                return;
            }
        });
    });
}

part1();
part2();