import {loadInput} from '../../utils';

function part1() {
    const input = loadInput(2017, '01');

    let sum = 0;
    for(let i = 0; i < input.length; i++) {
        let next = (i + 1) % input.length;
        if (input[i] === input[next]) {
            sum += parseInt(input[i]);
        }
    }
    console.log(`Sum: ${sum}`);
}

function part2() {
    const input = loadInput(2017, '01');

    const offset = input.length / 2;

    let sum = 0;
    for(let i = 0; i < input.length; i++) {
        let next = (i + offset) % input.length;
        if (input[i] === input[next]) {
            sum += parseInt(input[i]);
        }
    }
    console.log(`Sum: ${sum}`);
}

part1();
part2();