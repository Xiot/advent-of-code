import {loadProgram, execute, toCharCode, toChar} from '../common';

function trim(strings, ...args) {
    const result = [];
    for(let i = 0; i < strings.length; i++) {

        const combined = `${strings[i]}${args[i] ?? ''}`;
        const lines = combined.split('\n')
            .map(line => line.trim())
            .filter(Boolean)
            .filter(line => !line.startsWith('//'));
        result.push(...lines);
    }
    return result.join('\n') + '\n';
}

async function part1() {
    const program = loadProgram('2019/21');

    const input = trim`
        NOT C T
        NOT A J
        OR T J
        AND D J
        WALK
    `;
    console.log(input);

    const it = input[Symbol.iterator]();
    const io = {
        read() {
            const r = it.next();
            return toCharCode(r.value);
        },
        write(value) {
            if (value > 255) {
                return console.log('Damage', value);
            }
            process.stdout.write(toChar(value));
        }
    };

    await execute(program, io);
}

async function part2() {
    const program = loadProgram('2019/21');

    const input = trim`
        NOT C T
        NOT A J
        OR T J
        AND D J
        RUN
    `;
    console.log(input);

    const it = input[Symbol.iterator]();
    const io = {
        read() {
            const r = it.next();
            return toCharCode(r.value);
        },
        write(value) {
            if (value > 255) {
                return console.log('Damage', value);
            }
            process.stdout.write(toChar(value));
        }
    };

    await execute(program, io);
}

(async () => {
    await part2();
})();