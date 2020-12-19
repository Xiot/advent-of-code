import {loadInput} from '../../utils';

const ENABLE_LOGGING = true;

function part1(input) {
    const {rules, messages} = parseInput(input);
    console.log(rules);
    console.log(rules.has('4'), rules.has('0'));

    const count = messages.map((msg) => {
        const isMatch = matches(rules, msg);
        console.log(msg, isMatch);
        return isMatch.valid ? 1 : 0;
    }, 0);
    return count.reduce((sum, value) => sum + value);
}

function part2(input) {
    const {rules, messages} = parseInput(input);
    rules.set('8', {
        id: '8',
        type: 'lookup',
        rules: [
            ['42'], ['42', '8'],
        ]
    });
    rules.set('11', {
        id: '11',
        type: 'lookup',
        rules: [
            ['42', '31'],
            ['42', '11', '31']
        ]
    });

    const count = messages.map((msg) => {
        const isMatch = matches(rules, msg);
        console.log(msg, isMatch);
        return isMatch.valid ? 1 : 0;
    }, 0);
    return count.reduce((sum, value) => sum + value);
}

const l = createLog();

function matches(rules, msg) {
    l.push('TOP: ', msg);
    const ret = matchRule(rules, '0', msg);
    l.pop('BOTTOM:', msg, ret);
    l.log('');
    if (msg.length !== ret.length) {
        return {valid: false, code: 'invalid length'};
    }
    return ret;
}

function createLog() {

    let depth = 0;
    const indent =  () =>' '.repeat(depth * 2);
    return {
        push(msg,...args) {
            if (!ENABLE_LOGGING) return;
            console.log(indent(), msg, ...args);
            depth++;
        },
        pop(msg, ...args) {
            if (!ENABLE_LOGGING) return;
            depth --;
            console.log(indent(), msg, ...args);
        },
        log(msg, ...args) {
            if (!ENABLE_LOGGING) return;
            console.log(indent(), msg, ...args);
        }
    };
}

function matchRule(rules, id, msg) {

    const rule = rules.get(id);
    l.push('check', rule.id, rule.type, msg);

    let r;
    switch(rule.type) {
    case 'char':
        r = matchChar(rule, msg, 0);
        break;
    case 'lookup':
        r =  matchRuleset(rules, rule, msg);
        break;
    default:
        throw new Error(`unknown rule '${rule.type}`);
    }

    l.pop('--',id, r, msg);
    return r;
}

function matchRuleset(rules, rule, msg) {

    const found = [];

    for(let i = 0; i < rule.rules.length; i++) {
        let offset = 0;
        const ids = rule.rules[i];
        let count = 0;
        for (let r = 0; r < ids.length; r++) {
            const ret = matchRule(rules, ids[r], msg.slice(offset));
            if (!ret.valid) break;
            offset += ret.length;
            count+=1;
        }

        if (count === ids.length) {
            found.push({
                valid: true, length: offset
            });
        }
    }
    if (found.length === 0) {
        return {valid: false};
    }
    if (found.length === 1) {
        return found[0];
    }
    console.log('FOUND 2', rule.id, msg);
    return found[0];
}

function matchChar(rule, msg, index) {
    return {
        valid: rule.value === msg[index],
        length: 1
    };
}

function parseInput(input) {
    const [rules, data] = input.split('\n\n');
    return {
        rules: parseRules(rules.split('\n')),
        messages: data.split('\n').filter(m => m[0] !== '#')
    };
}

function parseRules(lines) {

    return lines.map(line => {
        let [id, rest] = line.split(':');
        rest = rest.trim();
        if (rest[0] === '"') {
            return {
                id,
                type: 'char',
                value: rest.slice(1, -1),
            };
        }
        return {
            id,
            type: 'lookup',
            rules: rest.trim().split('|').map(l => l.split(' ').map(x => x.trim()).filter(Boolean))
        };
    }).reduce((cache, rule) => {
        cache.set(rule.id, rule);
        return cache;
    }, new Map());
}

(function solve() {
    const input = loadInput(2020, 19, 'sample2');
    // console.log('Part I :', part1(input));
    console.log('Part II:', part2(input));
})();
