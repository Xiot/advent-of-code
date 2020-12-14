import {loadInput} from '../../utils';

function part1(input) {

    const memory = Object.create(null);

    let currentMask = 'X'.repeat(36);
    for(let ins of input) {
        if (ins.op === 'mask') {
            currentMask = ins.value;
            continue;
        }

        memory[ins.address] = applyMask(ins.value, currentMask);
    }

    const sum = Object.values(memory).reduce((sum, bin) => sum + parseInt(bin, 2), 0);
    return sum;
}

function part2(input) {

    const memory = Object.create(null);

    let currentMask = '0'.repeat(36);
    for(let ins of input) {
        if (ins.op === 'mask') {
            currentMask = ins.value;
            continue;
        }

        const addresses = decodeMask(
            toBin(ins.address),
            currentMask
        );
        addresses.forEach(address => memory[address] = ins.value);
    }

    return Object.values(memory).reduce((sum, value) => sum + value, 0);
}

function decodeMask(address, mask, index = mask.length - 1) {

    const results = [];
    if (index < 0) {
        return [address];
    }

    const char = mask[index];

    if (char === '1') {
        results.push(
            ...decodeMask(setBit(address, index, '1'), mask, index -1)
        );
    } else if (char === '0') {
        results.push(...decodeMask(address, mask, index - 1));
    } else {
        results.push(
            ...decodeMask(setBit(address, index, '1'), mask, index -1),
            ...decodeMask(setBit(address, index, '0'), mask, index -1)
        );
    }

    return results;
}

function applyMask(value, mask) {
    let newValue = value.toString(2).padStart(36, '0');
    for(let i = 0; i <= mask.length; i++) {
        newValue = setBit(newValue, i, mask[i]);
    }
    return newValue;
}

function setBit(value, bitPosition, bitValue) {
    if (bitValue === 'X') return value;

    return [...value.slice(0, bitPosition), bitValue, ...value.slice(bitPosition +1)].join('');
}

function parseLine(line) {
    const parts = /^(mem|mask)(?:\[(\d+)\])? = (.+)$/.exec(line);

    const [,op, address, value] = parts;

    if (op === 'mask') {
        return { op, value };
    }
    return {
        op,
        address,
        value: parseInt(value, 10),
    };

}

(function solve() {
    const input = loadInput(2020, 14)
        .split('\n')
        .map(parseLine);

    console.log('Part I :', part1(input));
    console.log('Part II:', part2(input));
})();

function toBin(value) {
    if (typeof value === 'string') {
        value = parseInt(value, 10);
    }
    return value.toString(2).padStart(36, '0');
}
