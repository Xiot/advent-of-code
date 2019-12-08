import fs from 'fs';

const input = fs.readFileSync('./2018/02/input.txt', 'utf-8').split('\n');

function countLetterMatches(id) {

    const cache = new Map();

    for(let letter of id) {
        cache.set(letter, (cache.get(letter) ?? 0) + 1);
    }
    const values = new Set(Array.from(cache.values()).filter(x => x === 2 || x === 3));

    return [
        values.has(2) ? 1 : 0,
        values.has(3) ? 1 : 0
    ];
}

const counts = input.reduce((counts, id) => {
    const matches = countLetterMatches(id);
    return [counts[0] + matches[0], counts[1] + matches[1]];
}, [0,0]);

const checksum = counts[0] * counts[1];
console.log('Checksum:', checksum);

const getDiff = (left, right) => {
    const diff = [];
    for(let i =0; i < left.length; i++) {
        if (left[i] !== right[i]) {
            diff.push(i);
        }
    }
    return diff;
};

function bruteForce(data) {
    for(let i = 0; i < data.length - 1; i++) {
        for(let j = i+1; j < data.length; j++) {
            const left = data[i];
            const right = data[j];
            const diffIndexes = getDiff(left, right);
            if (diffIndexes.length === 1) {
                return left.slice(0, diffIndexes[0]) + left.slice(diffIndexes[0] + 1);
            }
        }
    }
}

const commonLetters = bruteForce(input);
console.log('Common Letters', commonLetters);