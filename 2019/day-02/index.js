const fs = require('fs');

const load = (noun, verb) => {
    const data = fs.readFileSync('./day-02/input.txt', 'utf-8').split(',').map(Number);
    data[1] = noun
    data[2] = verb
    return data;
}
const data = load(12, 2);

const calculate = (data) => {
    for(let index = 0; index < data.length; index += 4) {
        const opcode = data[index];
        const num1 = data[data[index+1]];
        const num2 = data[data[index+2]];
        const target = data[index+3];
        if (opcode === 99) {
            return data[0];
        } else if (opcode === 1) {
            data[target] = num1 + num2;
        } else if (opcode === 2) {
            data[target] = num1 * num2;
        } else {
            throw new Error('foo');
        }
    }
}
console.log(calculate(load(12,2)));

const findTarget = (target) => {
    for(let n = 0; n <= 99; n++) {
        for(let v = 0; v <= 99; v++) {
            const result = calculate(load(n,v));
            if (result === target) {
                return [n,v]
            }
        }
    }
}

const [n, v] = findTarget(19690720);
console.log(n, v);
console.log(n * 100 + v)