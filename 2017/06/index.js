import {loadInput} from '../../utils';

function part1() {

    const banks = loadInput(2017,6).split('\t').map(x => +x);

    const cache = Object.create(null);
    const cacheKey = banks => banks.join('|');
    const findBankToDistribute = banks => {
        let maxValue = Number.MIN_SAFE_INTEGER;
        let maxValueIndex = -1;
        for(let i = 0; i < banks.length; i++) {
            if (banks[i] > maxValue) {
                maxValue = banks[i];
                maxValueIndex = i;
            }
        }
        return maxValueIndex;
    };

    let index = 0;
    let steps = 0;
    while(true) {

        if (cache[cacheKey(banks)]) break;
        steps++;

        cache[cacheKey(banks)] = steps;

        index = findBankToDistribute(banks);
        let blocks = banks[index];

        banks[index] = 0;
        while(blocks > 0) {
            index = (index + 1) % banks.length;
            banks[index] += 1;
            blocks--;
        }
    }
    console.log('Part I ', steps);
    console.log('Part II', steps - cache[cacheKey(banks)] + 1);
}

part1();