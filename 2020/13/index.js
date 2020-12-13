import {loadInput, gcd, maxOf, lcm} from '../../utils';

// Copied code for part 2

function part1(input) {
    const lines = input.split('\n');
    const time = parseInt(lines[0], 10);
    const scheudle = lines[1]
        .split(',',)
        .filter(x => x !== 'x')
        .map(x => parseInt(x, 10));

    const earliest = scheudle.reduce((diff, id) => {
        const mod = id - (time % id);
        if (mod < diff.time) {
            diff = {id, time: mod};
        }
        return diff;
    }, {id: -1, time: Number.MAX_SAFE_INTEGER});

    return earliest.id * earliest.time;
}
function part3() {
    let startTime = 0n;
    const line = '17,x,13,19'; startTime = 0n;
    const schedule = line
        .split(',',)
        .map(x => x === 'x' ? 'x' : +x);

    const x = 17;
    const x0 = 0;

    const y = 19;
    const y0 = 3;

    const z = 13;
    const z0 = 2;

    const w = lcm(x, z);


    function stuff(r, x, x0, y, y0) {
        for (let m = 0; m < 1000; m++) {
            const p0 = r*m + x0;
            const p0d = p0 % x;
            // console.log(m, p0, p0d);
            if (p0d !== 0) continue;

            const p1 = r*m + y0;
            const p1d = p1 % y;
            // console.log(m, p1, p1d);
            if (p1d !== 0) continue;

            return m;
            // const start = (r*m+x0);
            // const w = (start + y0) / y;
            // // console.log(m, start, w);
            // if (w === Math.floor(w)) {
            //     return m;
            // }
        }
    }

    function p(m, sch) {
        console.log('p', m, sch);
        const baseValue = m * sch[0];
        for(let i = 0; i < sch.length; i++) {
            if (sch[i] === 'x') continue;
            console.log(i, sch[i], (baseValue + i) / sch[i]);
        }
    }

    // const f = stuff(17, 17, 0, 13, 2);
    // const f1 = stuff(17, 17, 0, 19, 3);
    // const f2 = stuff(17, 13, 2, 19, 3);
    // console.log('f2', f2);

    // // const w0 = lcm(f1, f2);
    // // console.log(w0 );
    // p(f2*17, schedule);

    function callStuff(schedule, i1, i2) {
        return stuff(schedule[0], schedule[i1], i1, schedule[i2], i2);
    }

    const isValid = (multiple, schedule) => {
        const baseValue = multiple * schedule[0];
        // console.log(':', multiple, schedule);
        for(let i = 1; i < schedule.length; i++) {
            const value = schedule[i];
            if (value === 'x') continue;
            if ((baseValue + i) % value !== 0) {
                return false;
            }
        }
        return true;
    };

    const lcmv = (...args) => {
        return args.reduce((multiple, n) => lcm(multiple, n), 1);
    };

    function vis(schedule, start = 0, count = 1000) {
        const formatIdx = n => String(n).padStart(12);
        // const format =

        const f = schedule.map((n, i) => {
            if (n === 'x') return undefined;
            return {n,i};
        }).filter(Boolean);

        const first = schedule[0];
        for(let m = start; m < (start + count); m ++) {
            const t = first * m;

            const matches = f.map(x => {
                return (t + x.i) % x.n === 0;
            });

            console.log(
                formatIdx(m),
                matches.map(mm => mm ? '  D' : '  .').join('')
            );
            if (isValid(m, schedule)) {
                return m;
            }
        }
    }

    // console.log('multiple=', vis([1, 3, 5]));
    // console.log('multiple=', vis([17,'x',13,19]));
    // console.log('multiple=', vis([67,7,59,61], 457, 1));
    // for (let i = 0; i < 10; i++) {
    //     vis([67,7,59,61], 457*i-3, 6);
    //     console.log('--------');
    // }

    function v2(schedule, i1, i2) {
        const first = schedule[0];
        const f = schedule.map((n, i) => {
            if (n === 'x') return undefined;
            return {n,i};
        }).filter(Boolean);

        const times = [];
        for(let m = 0; m < 100000; m++) {
            const t = first * m;

            const matches = f.map(x => {
                return (t + x.i) % x.n === 0;
            });
            if (matches[i1] && matches[i2]) {
                times.push(m);
            }
        }
        return times;
    }

    console.log('v2', v2([67,7,59,61], 2, 3));
    console.log(lcm(67, lcm(59, 61)));

    // const w = [];
    const r = [];
    const s3 = [67,7,59,61];
    const a = lcmv(...s3);
    console.log('m-target', 754018 / 67);
    console.log(a / 67);
    for(let i = 1; i < s3.length - 1; i++) {
        for(let j = i+1; j < s3.length; j++) {
            const q = v2(s3, i, j);
            r.push( (q[2] - q[1]) );
        }
    }
    console.log(r);
    console.log(lcmv(...r) );

    // const s2 = [67,7,59,61];
    // const target = 754018 / s2[0];
    // // const s2 = [17, 'x', 13,19];
    // // const target = 3417 / s2[0];


    // // console.log()
    // // callStuff(s2, 2, 3);
    // // callStuff([1, 3, 5], 1, 2);
    // const f = callStuff(s2, 1, 2);
    // const f2 = callStuff(s2, 2, 3);
    // const f3 = callStuff(s2, 1, 3);
    // console.log(
    //     target,
    //     '\n',
    //     f,
    //     f2,
    //     f3,
    //     '\n',
    //     gcd(f,f2),
    //     gcd(f,f3),
    //     gcd(f2,f3),
    //     '\n',
    //     lcm(f, f2),
    //     lcm(f, f3),
    //     lcm(f2, f3),
    //     lcmv(f,f2,f3),
    // );
    // p(f, s2);
    // p(f2, s2);
    // p(f3, s2);

    // console.log('isvalid', isValid(target, s2));
}

// Brute Force
function part2(input, startTime = 0n) {

    // const line = '17,x,13,19'; startTime = 0n;
    // const line = '67,7,59,61'; startTime = 0n;
    // const line = '67,x,7,59,61'; startTime = 0n;
    // const line = '67,7,x,59,61'; startTime = 0n;
    // const line = '1789,37,47,1889'; startTime = 0n;
    const line = input.split('\n')[1]; //startTime = 100000000000000n;

    const schedule = line
        .split(',',)
        .map(x => x === 'x' ? 'x' : BigInt(x));

    // console.log(startTime, schedule[0], startTime % schedule[0]);
    // startTime = startTime / schedule[0] * schedule[0];
    // console.log(startTime);



    // return;

    const largest = maxOf(schedule, x => x);
    const idOffset = schedule.indexOf(largest);
    // startTime = startTime / largest * largest - BigInt(idOffset);
    startTime = (startTime / BigInt(schedule[0])) * BigInt(schedule[0]);
    // console.log(largest);
    // return largest;

    const length = BigInt(schedule.length);
    const lastIndex = length - 1n;

    let t = BigInt(startTime);
    let i = 0n;
    while (true) {
        i++;

        // console.log(i, i % 1000n);
        t += largest; //BigInt(schedule[0]);
        // console.log(t);
        if (i % 1000000n === 0n) console.log(t);

        for (let offset = 0n; offset < length; offset++) {
            const id = schedule[offset];
            if (id === 'x') { continue; }
            const current = t + BigInt(offset);
            // console.log(t, offset, id, current % id);
            if (current % id !== 0n) break;
            if (offset === lastIndex) {
                return t;
            }
        }
        // break;
        // if (t > 4000n) break;
        // 100000000000000
        // 928759076872
    }
}

function part4(input) {
    // https://gist.github.com/warriordog/4e2b79266851306f356ffe82519fff82

    function absmod(a, n) {
        while (a < 0) {
            a += n;
        }
        return a % n;
    }
    const schedules = input.split('\n')[1]
        .split(',')
        .map((x,i) => ({id: parseInt(x, 10), index: i}))
        .filter(x => !Number.isNaN(x.id))
        .sort((l, r) => r.id - l.id)
        .map(x => ({
            id: BigInt(x.id),
            offset: BigInt(absmod(x.id - x.index, x.id)),
            index: x.index
        }));

    let offset = schedules[0].id;
    let timestamp = schedules[0].offset;
    for(let i = 1; i < schedules.length; i++) {
        const bus = schedules[i];
        while(timestamp % bus.id !== bus.offset) {
            timestamp += offset;
        }
        offset *= bus.id;
    }
    return timestamp;

}

(function solve() {
    const input = loadInput(2020, 13);

    console.log('Part I      :', part1(input));
    // console.log('Part II', part2(input, 600600000000000n), );
    // 600689120448303n
    // console.log('Part III', part3());
    console.log('Part II (dq):', part4(input));
})();