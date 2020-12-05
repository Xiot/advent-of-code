import { first } from 'lodash';
import {loadInput} from '../../utils';

function part1() {
    const input = loadInput(2020, 5).split('\n')
        .map(findSeat);

    const maxId = input.reduce((max, pass) => {
        if (pass.id > max.id) {
            return pass;
        }
        return max;
    }, {id: 0});

    console.log('Part I', maxId);

}

function findSeat(pass) {
    let low = 0;
    let high = 127;

    for (let i = 0; i < 7; i ++) {
        const action = pass[i];
        const mid = low + Math.floor((high - low) / 2);
        if (action === 'F') {
            high = mid;
        } else {
            low = mid + 1;
        }

    }
    const row = low;

    low = 0;
    high = 7;
    for(let i = 0; i < 3; i++) {
        const action = pass[7+i];
        const mid = low + Math.floor((high - low) / 2);
        if (action === 'L') {
            high = mid;
        } else {
            low = mid + 1;
        }
    }

    const seat = low;
    return {
        pass,
        row,
        seat,
        id: row * 8 + seat
    };
}

function part2() {
    const input = loadInput(2020, 5).split('\n')
        .map(findSeat);

    const sorted = input
        .sort((l, r) => l.id - r.id)
        .filter(x => x.row > 0 && x.row < 127);

    const offset = sorted[0].id;
    const firstMissing = sorted.find((p, i) => p.id !== offset + i);
    console.log(firstMissing);
    // sorted.forEach(p => {
    //     console.log(p.id, p.row, p.seat);
    // });

    const index = sorted.indexOf(firstMissing);
    console.log(sorted.slice(index - 2, index + 2));
}

part1();
part2();

// console.log(findSeat('FBFBBFFRLR')); // 44,5
// console.log(findSeat('BFFFBBFRRR')); // 70, 7
// console.log(findSeat('FFFBBBFRRR')); // 14, 7
// console.log(findSeat('BBFFBBFRLL')); // 102, 4