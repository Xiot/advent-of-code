import {loadInput} from '../../utils';
import unique from 'lodash/uniq';

function part1() {

    const input = loadInput(2020,7).split('\n').map(parseLine);
    const cache = Object.create(null);
    input.forEach(rule => {
        rule.inner.forEach(x => {
            if (x.count === 0) {return;}
            cache[x.color] = [...(cache[x.color] || []), rule.outer];
        });
    });

    const gold = unique(findParents(cache, 'shiny gold'));
    console.log('Part I', gold.length);
}

function part2() {
    const input = loadInput(2020,7).split('\n').map(parseLine);
    const value = requiredBags(input, 'shiny gold');

    console.log('Part II', value - 1);
}

function requiredBags(data, color, depth = 0) {
    let sum = 0;
    const root = data.find(x => x.outer === color);
    if (!root) {
        console.log('not found', color);
        return 1;
    }
    console.log(' '.repeat(depth * 2), color, root);
    for(let bag of root.inner) {
        console.log(' '.repeat(depth * 2),'-', bag.color, bag.count);
        sum += bag.count * requiredBags(data, bag.color, depth + 1);
    }
    console.log(' '.repeat(depth * 2), color, sum);
    return 1 + sum;
}

function findParents(cache, color) {
    let ret = [];
    const parents = cache[color];
    console.log(color, parents);
    if (!parents) return [];

    ret.push(...parents);
    for(let p of parents) {
        ret = [...ret, ...findParents(cache, p)];
    }

    return ret;
}

function parseLine(line) {
    const sections = line.split(' bags contain ');
    const outer = sections[0];

    const parts = sections[1].split(', ');
    const inner = parts.map(p => {
        const parts = /(\d|no) (.+) bag/.exec(p);
        return {
            count: parts[1] === 'no' ? 0 : parseInt(parts[1], 10),
            color: parts[2]
        };
    });
    return {
        outer,
        inner
    };
}

// part1();
part2();