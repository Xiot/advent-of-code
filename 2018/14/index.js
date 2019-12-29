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

    const target = '864801';

    let board = buffer(2);
    board.add(3);
    board.add(7);

    let elfIndex1 = 0;
    let elfIndex2 = 1;

    const valueAt = index => board.get(index);
    const endsWith = target => board.last(target.length) === target;
    const t = Date.now();

    while(!endsWith(target)) {
        const sum = valueAt(elfIndex1) + valueAt(elfIndex2);
        for(let c of String(sum)) {
            board.add(parseInt(c));
            if(endsWith(target)) {
                break;
            }
        }
        elfIndex1 = (elfIndex1 + 1 + valueAt(elfIndex1)) % board.length;
        elfIndex2 = (elfIndex2 + 1 + valueAt(elfIndex2)) % board.length;
    }

    console.log('\nPart II');
    console.log('Index', board.length - target.length);
    console.log(` ${Date.now() - t}ms`);

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

function buffer(size) {
    let data = new Array(size);
    let length = 0;

    return {
        get length() { return length; },
        get size() {return size; },
        last(l) {
            return data.slice(length - l, length).join('');
        },
        get(index) { return data[index]; },
        add(value) {
            if (length + 1 > size) {
                data.length = data.length * 2;
                size = data.length;
            }
            data[length++] = value;
        }
    };
};

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