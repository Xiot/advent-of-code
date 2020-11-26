import {loadInput} from '../../utils';

function part1() {
    const input = loadInput(2017,5).split('\n').map(x => +x);

    let index = 0;
    let steps =0;
    while(index >=0 && index < input.length) {
        steps++;

        const prev = index;
        index += input[index];
        input[prev] +=1;
    }
    console.log('Steps', steps);
}


function part2() {
    const input = loadInput(2017,5).split('\n').map(x => +x);

    let index = 0;
    let steps =0;
    while(index >=0 && index < input.length) {
        steps++;

        const prev = index;
        const value = input[index];
        index += value;

        input[prev] += value >= 3 ? -1 : 1;
    }

    console.log('Part2: Steps', steps);
}

part1();
part2();