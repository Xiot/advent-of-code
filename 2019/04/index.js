const {range} = require('lodash');

/**
 * It is a six-digit number.
 * The value is within the range given in your puzzle input.
 * Two adjacent digits are the same (like 22 in 122345).
 * Going from left to right, the digits never decrease;
 *  they only ever increase or stay the same (like 111123 or 135679).
 */

const input = [245318, 765747];

function isValid(num) {
    const asString = String(num);
    let hasRepeat = false;
    for(let i = 1; i < asString.length; i++) {
        const current = asString[i];
        const previous = asString[i-1];
        hasRepeat = hasRepeat || current === previous;
        if (current < previous) {
            return false;
        }
    }
    return hasRepeat;
}

const captureRepeatRegex = /(\d)\1+/g;

function onlyDoubles(num) {
    const matches = String(num).match(captureRepeatRegex);
    return matches.filter(x => x.length === 2).length > 0;
}

// BruteForce
function countPossible(from, to) {
    return range(from, to + 1)
        .filter(isValid)
        .length;
}

function possibleEx(from, to) {
    return range(from, to + 1)
        .filter(isValid)
        .filter(onlyDoubles);
}

console.log('Valid Count 1:', countPossible(...input));
console.log('Valid Count 2:', possibleEx(...input).length);