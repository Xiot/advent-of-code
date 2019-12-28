import chalk from 'chalk';

function part1() {
    const data = expandingArray();
    data.add(3);
    data.add(7);

    let elf1Index = 0;
    let elf2Index = 1;

    const target = 864801;

    for(let i = 0; i < target + 10; i++) {
        const recipe1 = data.get(elf1Index);
        const recipe2 = data.get(elf2Index);
        const sum = recipe1 + recipe2;
        for(let c of String(sum)) {
            data.add(parseInt(c));
        }

        elf1Index = data.index(elf1Index + 1 + recipe1);
        elf2Index = data.index(elf2Index + 1 + recipe2);
    }
    const result = Array.from(data.slice(target, target+10)).join('');
    console.log('\nPart I');
    console.log(result);
}

function part2() {
    const data = expandingArray();
    data.add(3);
    data.add(7);

    let elf1Index = 0;
    let elf2Index = 1;

    const target = '864801';

    // for(let i = 0; i < target + 10; i++) {
    let e = 0;
    while(true) {
        // if (e++ > 40) { break; }

        const current = data.last(target.length);
        // console.log(current);
        if (current === target) {
            console.log('found', data.length - target.length);
            break;
        }

        const recipe1 = data.get(elf1Index);
        const recipe2 = data.get(elf2Index);
        const sum = recipe1 + recipe2;
        for(let c of String(sum)) {
            data.add(parseInt(c));
        }

        elf1Index = data.index(elf1Index + 1 + recipe1);
        elf2Index = data.index(elf2Index + 1 + recipe2);
    }

    // const result = Array.from(data.slice(target, target+10)).join('');
    // console.log(result);
}

// part1();
part2();

function print(data, elf1, elf2) {

    let text = '';
    for(let i = 0; i < data.length; i++) {
        const value = data.get(i);

        const color = i === elf1
            ? chalk.yellow
            : i === elf2
                ? chalk.green
                : chalk.white;

        text += color(value);
    }
    return text;
}

function expandingArray() {
    const data = new Map();
    let length = 0;

    return {
        index(index) { return index % length; },

        get(index) { return data.get(index); },
        add(value) {
            data.set(length++, value);
        },
        get length() { return length; },
        values() {
            return data.values();
        },
        slice: function*(start, end = length) {
            for(let i = start; i < end; i++) {
                yield data.get(i);
            }
        },
        last(num) {
            let text = '';
            for(let i = Math.max(0, length - num); i < length; i++) {
                text += String(data.get(i));
            }
            return text;
        }
    };
}