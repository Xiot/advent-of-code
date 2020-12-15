import {loadInput} from '../../utils';

function play(input, maxTurns) {

    const cache = new Map();
    const oldCache = new Map();

    for(let i = 0; i < input.length; i++) {
        cache.set(input[i], i);
    }

    const nums = [...input];

    function say(turn, value) {
        nums.push(value);

        if (cache.has(value)) {
            oldCache.set(value, cache.get(value));
        }

        cache.set(value, turn);
    }

    function getLast() {
        const value = nums[nums.length -1];
        return [
            value, cache.get(value), oldCache.get(value)
        ];
    }

    for(let turn = input.length; turn < maxTurns; turn++) {

        const [last, m1, m2] = getLast();

        if(m2 == null) {
            say(turn, 0);

        } else {
            const value = m1 - m2;

            say(turn, value);
        }

    }
    return getLast()[0];
}

(function solve() {
    const input = loadInput(2020,15).split(',').map(x => +x);
    console.log('Part I :', play(input, 2020));
    console.log('Part II:', play(input, 30000000));
})();