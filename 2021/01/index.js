import {loadInput} from '../../utils';

function part1(input) {
    const depths = input.split('\n').map(x => parseInt(x, 10));
    let inc = 0;
    for(let i = 1; i < depths.length; i++) {
        if (depths[i] > depths[i-1]) {
            inc++;
        }
    }
    return inc;
}

function part2(input) {
    const depths = input.split('\n').map(x => parseInt(x, 10));
    let inc = 0;
    for(let i = 1; i < depths.length - 2; i++) {
        const sum = depths[i] + depths[i+1] + depths[i+2];
        const last = depths[i-1] + depths[i+1-1] + depths[i+2-1];
        if (sum > last) {
            inc++;
        }
    }
    return inc;
}

(function solve() {
    const input = loadInput(2021, 1, 'input');
    console.log('Part I :', part1(input));
    console.log('Part II:', part2(input));
})();
