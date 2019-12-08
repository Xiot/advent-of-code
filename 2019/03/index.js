
const {min} = require('lodash');
const fs = require('fs');

const input = fs.readFileSync('./day-03/input.txt', 'utf-8')
    .split('\n')
    .map(line =>
        line.split(',')
            .map(item => ({
                direction: item[0],
                count: parseInt(item.slice(1))
            }))
    );

// crappy way
const [first,second] = input;
const key = (x, y) => `${x}|${y}`;
const visited = Object.create(null);
const visit = ({x, y}, pass, steps) => visited[key(x, y)] = {pass, steps};
const visitedBy = ({x, y}) => visited[key(x, y)] || {};

const moveFn = {
    U: (x, y) => ({x, y: y+1}),
    D: (x, y) => ({x, y: y-1}),
    L: (x, y) => ({x: x-1, y}),
    R: (x, y) => ({x: x+1, y}),
};
const move = ({x,y}, direction) => {
    return moveFn[direction](x,y);
};

function* traverse(path) {
    let pos = {x: 0, y: 0};
    for(let segment of path) {
        for(let i = 0; i < segment.count; i++) {
            yield pos = move(pos, segment.direction);
        }
    }
}

let steps1 = 0;
for (let p of traverse(first)) {
    visit(p, 1, ++steps1);
}
const crosses = [];
let steps2 = 0;
for (let p of traverse(second)) {
    steps2++;
    const info = visitedBy(p);
    if (info.pass === 1) {
        crosses.push({...p, steps1: info.steps, steps2});
    }
}

const distance = ({x, y}) => Math.abs(x) + Math.abs(y);
const combinedSteps = ({steps1, steps2}) => steps1 + steps2;

console.log(min(crosses.map(distance)));
console.log(min(crosses.map(combinedSteps)));