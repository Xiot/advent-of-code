import {loadInput, minOf, maxOf} from '../../utils';

function part1() {
    const input = loadInput(2020,9).split('\n').map(x => parseInt(x, 10));

    const windowSize = 25;

    let result = -1;
    for(let i = windowSize; i < input.length; i++) {
        if (!has2Sum(input, i-windowSize, i, input[i])) {
            result = input[i];
            break;
        }
    }

    console.log('Part I', result);
}

function has2Sum(input, start, end, target) {
    const cache = new Map();
    for(let i = start; i < end; i++) {
        cache.set(input[i], true);
        if (cache.has(target - input[i])) {
            return true;
        }
    }
    return false;
}

function part2() {
    const input = loadInput(2020,9).split('\n').map(x => parseInt(x, 10));

    const windowSize = 25;

    let brokenIndex = -1;
    for(let i = windowSize; i < input.length; i++) {
        if (!has2Sum(input, i-windowSize, i, input[i])) {
            brokenIndex = i;
            break;
        }
    }

    const target = input[brokenIndex];

    for(let i = 0; i < brokenIndex - 2; i++) {

        let sum = input[i];
        let j = i+1;
        while(sum < target && j < brokenIndex) {
            const next = input[j];
            sum += next;
            if (sum === target) {

                const smallest = minOf(input.slice(i, j), x=> x);
                const largest = maxOf(input.slice(i, j), x=> x);

                console.log('Part II', smallest, largest, i, j, input[i], input[j], smallest + largest);
                return;
            } else if (sum > target) {
                break;
            }

            j++;
        }
    }

    console.log('Part II');
}

part1();
part2();