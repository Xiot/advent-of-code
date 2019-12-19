import {loadInput} from '../common';
// https://www.reddit.com/r/adventofcode/comments/ebai4g/2019_day_16_solutions/

const basePattern = [0, 1, 0, -1];

function part2() {
    const rawInput = '03036732577212944063491565474664';
    const offset = parseInt(rawInput.slice(0, 7));


}

function part1() {
    const input = loadInput(2019, 16)
        .split('')
        .map(x => parseInt(x));

    let phase = input;
    for(let i = 0; i < 100; i++) {
        phase = calculate(phase);
    }
    printPhase(phase);
}
function printPhase(phase) {
    console.log(phase.slice(0, 8).join(''));
}
function calculate(phase) {
    const digits = new Array(phase.length);
    for(let i = 0; i < phase.length; i++) {
        digits[i] = calcDigit(phase, i);
    }
    return digits;
}

function calcDigit(input, digit) {
    const seq = sequence(digit);

    let value = 0;
    for(let j = 0; j < input.length; j++) {
        value += input[j] * seq.next().value;
    }
    return Math.abs(value) % 10;
}

function sequence(digit) {
    const it = rawSequence(digit);
    it.next();
    return it;
}
function* rawSequence(digit) {
    let index = 0;

    while(true) {
        for(let i = 0; i <= digit; i++) {
            yield basePattern[index];
        }
        index = (index + 1) % basePattern.length;
    }
}

part1();