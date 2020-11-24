import {loadInput, minOf, maxOf} from '../../utils';

function part1() {
    const grid = loadInput('2017/02').split('\n').map(row => row.split('\t').map(c => parseInt(c)));

    const sum = grid.reduce((sum, row) => sum + (maxOf(row, x => x) - minOf(row, x => x)), 0);
    console.log(`Sum: ${sum}`);
}

function part2() {
    const grid = loadInput('2017/02').split('\n').map(row => row.split(/\s/).map(c => parseInt(c)));

    function divide(left, right) {
        [left, right] = [left, right].sort((l, r) => l - r);
        if (right % left === 0) {
            return right / left;
        }
        return null;
    }

    function rowChecksum(row) {
        for(let i = 0; i < row.length - 1; i++) {
            for(let j = i+1; j < row.length; j++) {
                const value = divide(row[i], row[j]);
                if (value != null) {
                    console.log('  ', value);
                    return value;
                }
            }
        }
        throw new Error('no value');
    }

    const sum = grid.reduce((sum, row, index) => {
        const checksum = rowChecksum(row);
        console.log('row', index, checksum);
        return sum + checksum;

    }, 0);
    console.log(`Sum: ${sum}`);
}

part1();
part2();