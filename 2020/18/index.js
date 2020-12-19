import {loadInput} from '../../utils';

function part1(input) {

    const lines = input.split('\n');

    const sum = lines.reduce((sum, line) => {
        const t = tokenize(line);
        const v = evaluateTokensNoOrder(t);
        return sum + v;
    }, 0);
    return sum;
}

function part2(input) {
    const lines = input.split('\n');

    const sum = lines.reduce((sum, line) => {
        const t = tokenize(line);
        const v = evaluateTokensWithOrder(t);
        return sum + v;
    }, 0);
    return sum;
}

function evaluateStackWitOrder(tokens) {
    while(tokens.length > 1) {

        const opIndex = nextOperationIndex(tokens);
        if (opIndex === -1) {
            return tokens[0];
        }
        const result = evaluateAt(tokens, opIndex);
        tokens.splice(opIndex -1, 3, result);
    }
    return tokens[0];
}

function nextOperationIndex(tokens) {
    const index = tokens.indexOf('+');
    if (index !== -1) {
        return index;
    }
    return tokens.indexOf('*');
}

function evaluateAt(tokens, index) {
    const [left, op, right] = tokens.slice(index - 1);
    const value = evaluate(left, op, right);
    return value;
}

function evaluateTokensWithOrder(tokens, depth = 0) {
    const log = (...args) => {}; //console.log(' '.repeat(depth * 4), ...args);
    const stack = [];
    while(tokens.length) {
        const token = tokens.shift();
        if (isDigit(token)) {
            log('num', token);
            stack.push(parseInt(token, 10));

        } else if (isOp(token)) {
            log('op', token);
            stack.push(token);
        } else if (token === '(') {
            log('(');
            stack.push(evaluateTokensWithOrder(tokens, depth + 1));
        } else if (token === ')') {
            return evaluateStackWitOrder(stack);
        }

        log('stack', stack);
    }

    return evaluateStackWitOrder(stack);
}

function evaluateTokensNoOrder(tokens, depth = 0) {
    const log = (...args) => {};// console.log(' '.repeat(depth * 4), ...args);
    const stack = [];
    while(tokens.length) {
        const token = tokens.shift();
        if (isDigit(token)) {
            log('num', token);
            stack.push(parseInt(token, 10));

        } else if (isOp(token)) {
            log('op', token);
            stack.push(token);
        } else if (token === '(') {
            log('(');
            stack.push(evaluateTokensNoOrder(tokens, depth + 1));
        } else if (token === ')') {
            return stack[0];
        }

        if (stack.length === 3) {
            const [right, op, left] = [stack.pop(), stack.pop(), stack.pop()];
            stack.push(evaluate(left, op, right));
        }
        log('stack', stack);
    }
    return stack[0];
}
function evaluate(left, op, right) {

    const result = op === '*'
        ? left * right
        : left + right;
    return result;
}

function tokenize(text) {
    const breath = text.replace(/[(|)]/g, v =>  ' ' + v + ' ');
    return breath.split(/\s+/);
}

function parseOp(state) {
    return {
        type: 'op',
        value: state.current,
    };
}

function isOp(char) {
    return char === '+' || char === '*';
}
function isDigit(char) {
    return char >= '0' && char <= '9';
}

(function solve() {
    const input = loadInput(2020, 18);
    console.log('Part I :', part1(input));
    console.log('Part II:', part2(input));
})();
