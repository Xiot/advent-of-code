import {loadInput} from '../../utils';

const required = ['byr', 'iyr', 'eyr', 'hgt', 'hcl', 'ecl', 'pid'];

const rules = {
    byr: text => {
        if (!/^\d{4}$/.test(text)) { return false; }
        const value = parseInt(text, 10);
        return value >= 1920 && value <= 2002;
    },
    iyr: text => {
        if (!/^\d{4}$/.test(text)) { return false; }
        const value = parseInt(text, 10);
        return value >= 2010 && value <= 2020;
    },
    eyr: text => {
        if (!/^\d{4}$/.test(text)) { return false; }
        const value = parseInt(text, 10);
        return value >= 2020 && value <= 2030;
    },
    hgt: text => {
        const match = /^(\d+)(cm|in)$/.exec(text);
        if (!match) return false;
        const [,value, unit] = match;
        if (unit === 'cm') {
            return value >= 150 && value <= 193;
        } else if (unit === 'in') {
            return value >= 59 && value <= 76;
        }
    },
    hcl: text => {
        return /^#[0-9a-f]{6}$/.test(text);
    },
    ecl: text => {
        return /^(amb|blu|brn|gry|grn|hzl|oth)$/.test(text);
    },
    pid: text => {
        return /^\d{9}$/.test(text);
    },
    cid: text => true,
};

function part1() {
    const passports = loadInput(2020,4).split('\n\n').map(parsePassport);

    const valid = passports.reduce((sum, p) => {
        return sum + (hasRequiredFields(p, required) ? 1 :0);
    }, 0);

    console.log('Part I', valid);
}

function hasRequiredFields(passport, required) {
    return required.every(key => key in passport);
}

function parsePassport(data) {
    return data.split(/\n|\s/).reduce((obj, chunk) => {
        const [key, value] = chunk.split(':');
        obj[key] = value;
        return obj;
    }, {});
}

function isValid(passport) {
    return required.every(key => rules[key](passport[key]));
}

function part2() {
    const passports = loadInput(2020,4).split('\n\n').map(parsePassport);

    const valid = passports.filter(p => hasRequiredFields(p, required)).filter(isValid).length;

    console.log('Part II', valid);
}

part1();
part2();