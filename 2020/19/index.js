import {loadInput, createLog} from '../../utils';

const l = createLog();

function part1(input) {
    const {rules, messages} = parseInput(input);

    const count = messages.map((msg) => {
        const isMatch = matches(rules, msg);
        // console.log(msg, isMatch);
        return isMatch ? 1 : 0;
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
        // console.log(msg, isMatch);
        return isMatch ? 1 : 0;
    }, 0);
    return count.reduce((sum, value) => sum + value);
}

function matches(rules, msg) {
    l.push('TOP: ', msg);
    const ret = matchRule(rules, '0', msg);
    l.pop('BOTTOM:', msg, msg.length, ret);
    l.log('');

    return ret.filter(x => x.length === msg.length).length > 0;
}

function matchRule(rules, id, msg) {

    const rule = rules.get(id);
    if (!rule) {
        console.log('rule not found', id);
    }
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

        const left = matchRule(rules, ids[0], msg.slice(offset));
        const validLeft = left.filter(x => x.valid);
        if (ids.length === 1) {
            found.push(...validLeft);
            continue;
        }

        for(let lr of validLeft) {
            const right = matchRule(rules, ids[1], msg.slice(offset + lr.length))
                .filter(r => r.valid);
            if (ids.length === 2) {
                found.push(...right.map(r => ({valid: true, length: lr.length + r.length})));
                continue;
            }
            for (let rr of right) {
                const last = matchRule(rules, ids[2], msg.slice(offset + lr.length + rr.length))
                    .filter(r => r.valid);
                found.push(...last.map(l => ({valid: true, length: lr.length + rr.length + l.length})));
            }
        }
    }

    l.log(found.length);
    if (rule.id === '0') {
        return found;
    }
    return found;
}

function matchChar(rule, msg, index) {
    const valid = rule.value === msg[index];
    return valid
        ? [{valid, length: 1}]
        : [];
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
    const input = loadInput(2020, 19);
    console.log('Part I :', part1(input));
    console.log('Part II:', part2(input));
})();
