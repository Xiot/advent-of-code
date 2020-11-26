import {loadInput} from '../../utils';

const input = loadInput(2017,4).split('\n').map(x => x.split(' '));

function part1(phrases) {
    const isValid = (phrase) => {
        const check = Object.create(null);
        for(let word of phrase) {
            if (check[word]) return false;
            check[word] = true;
        }
        return true;
    };

    const validPhrases = phrases.filter(isValid);
    console.log('Valid', validPhrases.length);
}

function part2(phrases) {
    const isValid = (phrase) => {
        const check = Object.create(null);
        for(let word of phrase) {
            const sorted = word.split('').sort();
            if (check[sorted]) return false;
            check[sorted] = true;
        }
        return true;
    };
    const validPhrases = phrases.filter(isValid);
    console.log('Valid', validPhrases.length);
}

part1(input);
part2(input);