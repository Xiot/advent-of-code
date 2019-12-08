import fs from 'fs';

const input = fs.readFileSync('./2018/01/input.txt', 'utf-8')
    .split('\n')
    .map(Number);

const total = input.reduce((sum, value) => sum + value);
console.log('Total', total);

function* frequencyStream() {
    while(true) {
        yield* input;
    }
}

function findRepeating() {
    const cache = new Set();
    let sum = 0;
    for(let change of frequencyStream()) {
        sum += change;
        if(cache.has(sum)) {
            return sum;
        }
        cache.add(sum);
    }
}

const firstRepeating = findRepeating();
console.log('First Repeating', firstRepeating);