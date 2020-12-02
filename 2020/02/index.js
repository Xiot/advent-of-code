import {loadInput} from '../../utils';

function part1() {
    const rules = loadInput(2020, 2).split('\n').map(parseLine);

    const count = rules.filter(r => isValid(r)).length;
    console.log('Part I', count);
}

function part2() {
    const rules = loadInput(2020, 2).split('\n').map(parseLine);

    const count = rules.filter(r => positionValid(r)).length;
    console.log('Part II', count);
}

function positionValid(rule) {
    const hasFirst = rule.password[rule.min-1] === rule.char;
    const hasSecond = rule.password[rule.max-1] === rule.char;

    return hasFirst !== hasSecond;
}

function isValid(rule) {
    const count = rule.password.split('').reduce((sum, c) => sum + (c === rule.char ? 1 : 0), 0);
    return rule.min <= count && count <= rule.max;
}

const parser = /(\w+)-(\d+) (\w+): (.+)/;
const parseLine = line => {
    const parts = parser.exec(line);
    return {
        min: parseInt(parts[1], 10),
        max: parseInt(parts[2], 10),
        char: parts[3],
        password: parts[4],
    };
};

part1();
part2();