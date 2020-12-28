import {loadInput} from '../../utils';

function part1(input) {
    const [cardKey, doorKey] = input.split('\n').map(line => parseInt(line));

    const cardLoop = calculateCardLoopSize(7, cardKey);

    console.log();
    const doorLoop = calculateCardLoopSize(7, doorKey);

    console.log(cardLoop, doorLoop);
    const k = calculateKey(cardKey, doorLoop);

    return calculateKey(doorKey, cardLoop);
}

function calculateKey(subjectNumber, loopSize) {
    let value = 1;

    for(let l = 0; l < loopSize; l++) {
        value *= subjectNumber;
        value = value % 20201227;
    }

    return value;
}

function calculateCardLoopSize(subjectNumber, key) {
    let value = 1;

    let l = 0;
    while(true) {
        l++;
        value *= subjectNumber;
        value = value % 20201227;

        if (value === key) {
            return l;
        }
    }
}

function part2(input) {

}

(function solve() {
    const input = loadInput(2020, 25);
    console.log('Part I :', part1(input));
    console.log('Part II:', part2(input));
})();