import fs from 'fs';
import {createGroupBy, assert} from '../common';
import {range, maxBy} from 'lodash';

const re = /^\[((\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}))] (.+)$/;
const idRegEx = /#(\d+)/;

function parseLine(text) {
    const match = re.exec(text);
    const date = {
        year: parseInt(match[2]),
        month: parseInt(match[3]),
        day: parseInt(match[4]),
        hour: parseInt(match[5]),
        minute: parseInt(match[6])
    };
    const message = match[7];
    const result = {
        sortKey: match[1],
        date,
        message
    };

    if (message.endsWith('begins shift')) {
        result.state = 'start';
        result.id = parseInt(idRegEx.exec(message)[1]);
    } else if (message.endsWith('wakes up')) {
        result.state = 'awake';
    } else if (message.endsWith('falls asleep')) {
        result.state = 'asleep';
    }
    return result;
}

const input = fs.readFileSync('./2018/04/input.txt', 'utf-8').split('\n')
    .sort((l, r) => l.localeCompare(r))
    .map(createLogMapper());

function createLogMapper() {
    let lastId = 0;
    return (line) => {
        const log = parseLine(line);
        if(log.id) {
            lastId = log.id;
        } else {
            log.id = lastId;
        };
        return log;
    };
}

function groupById(data) {
    const cache = createGroupBy();
    for(let log of data) {
        cache.append(log.id, log);
    }
    return cache;
}

function createHistogram(id, logs) {
    const histogram = Array.from(new Array(60), () => 0);
    let totalAsleep = 0;
    function inc(minute) {
        histogram[minute] = (histogram[minute] ?? 0) + 1;
        totalAsleep += 1;
    }

    let state = 'awake';
    for(let i = 0; i < logs.length; i++) {
        const log = logs[i];
        if (log.state === 'start') {

            if (state === 'asleep') {
                const lastLog = logs[i - 1];
                range(lastLog.date.minute, 60)
                    .forEach(x => inc(x));
            }

            state = 'awake';
        } else if (log.state === 'asleep') {
            state = 'asleep';
        } else if (log.state === 'awake') {
            state = 'awake';
            const lastLog = logs[i - 1];
            range(lastLog.date.minute, log.date.minute)
                .forEach(x => inc(x));
        }

        if(state === 'asleep') {
            inc(log.date.minute);
        }
    }

    if (state === 'asleep') {
        const lastLog = logs[logs.length - 1];
        range(lastLog.minute, 60)
            .forEach(x => inc(x));
    }

    return {
        id,
        histogram,
        totalSleepTime: totalAsleep,
        logs
    };
}

function* calculateTotalSleep(data) {
    for(let [id, logs] of groupById(data)) {
        yield createHistogram(id, logs);
    }
}

function getSleepiestMinute(entry) {
    const sleepiestMinute = entry.histogram.reduce((max, value, minute) => {
        if (value > max.value) {
            return {minute, value};
        }
        return max;
    }, {minute: 0, value: 0});

    return {
        id: entry.id,
        minute:  sleepiestMinute.minute,
        value: sleepiestMinute.value,
    };
}

function part1() {
    let max = {
        id: 0,
        totalSleepTime: 0,
        histogram: []
    };

    for(let entry of calculateTotalSleep(input)) {
        if (entry.totalSleepTime > max.totalSleepTime) {
            max = entry;
        }
    }

    const sleepiestMinute = getSleepiestMinute(max);

    console.log('\nPart I');
    console.log('Max', max.id, max.totalSleepTime,  sleepiestMinute);
    console.log('Result', max.id * sleepiestMinute.minute);
}

function part2() {
    const result = maxBy(
        Array.from(calculateTotalSleep(input))
            .map(entry => getSleepiestMinute(entry)),
        entry => entry.value);

    console.log('\nPart II');
    console.log('Max', result);
    console.log('Result', result.id * result.minute);

    assert(28198, result.id * result.minute, 'Result');
}

part1();
part2();