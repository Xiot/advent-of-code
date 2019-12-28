import {loadInput} from '../common';

const rawInput = loadInput(2018,12);
const rawState = '.#####.##.#.##...#.#.###..#.#..#..#.....#..####.#.##.#######..#...##.#..#.#######...#.#.#..##..#.#.#';

const parseRegex = /([.#]{5}) => ([.#])/;
function parseInput(input) {
    return input.split('\n').slice(2)
        .map(line => {
            const match = parseRegex.exec(line);
            return {
                pattern: match[1],
                target: match[2]
            };
        });
}

const patternAt = (state, index) => {
    return Array.from(new Array(5), (_, i) => {
        return state[i - 2 + index] ?? '.';
    }).join('');
};

const rules = parseInput(rawInput);
const runGeneration = state => {

    let nextState = Array.from(new Array(state.length), () => '.');
    for(let i = 2; i < state.length + 2; i++) {
        const value = state[i];
        // const source = state.slice(i - 2, i + 3);
        const source = patternAt(state, i);
        const rule = rules.find(r => r.pattern === source);
        // console.log('       ', source, rule.target);
        nextState[i] = rule?.target ?? value;
    }
    return nextState.join('');
};

const indexSum = (state, offset) => state.split('').reduce((count, char, index) => {
    return count + (char === '#' ? index - offset : 0);
}, 0);

function part1() {
    const offset = 4;
    let initialState = '.'.repeat(offset) + rawState;

    const GENERATION_COUNT = 20;
    let state = initialState;

    for(let gen = 1; gen <= GENERATION_COUNT; gen++) {
        state = runGeneration(state);
        // console.log(`${String(gen).padStart(2)}]`, state);
    }

    const plantSum = indexSum(state, offset);
    console.log('\nPart I');
    console.log('Index Sum', plantSum);

}

function part2() {

    const offset = 4;
    let initialState = '.'.repeat(offset) + rawState;

    const GENERATION_COUNT = 200;
    let state = initialState;


    let lastSum = 0;
    for(let gen = 1; gen <= GENERATION_COUNT; gen++) {
        state = runGeneration(state);
        const h = indexSum(state, offset);
        lastSum = h;
    }

    // The sequence eventually grows linearly
    // so after it stabailizes, just do the math.
    const total = lastSum + (50000000000 - GENERATION_COUNT) * 62;

    console.log('\nPart II');
    console.log('Total', total);
}

// part1();
part2();