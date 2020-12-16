import {loadInput} from '../../utils';

function part1(input) {

    const [fieldsText, , nearbyText] = input.split('\n\n');

    const fields = fieldsText.split('\n').map(parseRule);
    const tickets = nearbyText.split('\n').slice(1).map(line => line.split(',').map(x => +x));

    const invalidCount = tickets
        .map(t => validateTicket(t, fields))
        .filter(t => !t.valid)
        .reduce((sum, value) => {
            return sum + value.invalidEntries[0];
        }, 0);

    return invalidCount;

}

function validateTicket(ticket, fields) {

    const invalid = ticket.filter(value => !fields.some(field => matchField(field, value)));
    return {
        ticket,
        invalidEntries: invalid,
        valid: invalid.length === 0
    };
}

function matchField(field, value) {

    for(let rule of field.ranges) {
        if (value >= rule.min && value <= rule.max) {
            return true;
        }
    }
    return false;
}

function parseRule(text) {
    const [,name, min1, max1, min2, max2] = /^(.+): (\d+)-(\d+) or (\d+)-(\d+)$/.exec(text);

    return {
        name,
        ranges: [
            {min: +min1, max: +max1},
            {min: +min2, max: +max2}
        ]
    };
}

function part2(input, answerFieldPredicate) {
    const [fieldsText, ticketText, nearbyText] = input.split('\n\n');

    const fields = fieldsText.split('\n').map(parseRule);
    const tickets = nearbyText.split('\n').slice(1).map(line => line.split(',').map(x => +x));

    const validTickets = tickets
        .filter(t => validateTicket(t, fields).valid);

    const sortedFields = [];

    let fieldsToCheck = [...fields];

    for(let i = 0; i < fields.length; i++) {
        const result = {
            matches: [],
            index: i,
        };
        sortedFields.push(result);
    }

    while(fieldsToCheck.length > 0) {
        for(let i = 0; i < fields.length; i++) {

            const result = sortedFields[i];

            const matched = fieldsToCheck.filter(f => validTickets.every(t => matchField(f, t[i])));

            if (matched.length === 1) {
                const single = matched[0];
                fieldsToCheck = fieldsToCheck.filter(f => f.name !== single.name);

                sortedFields.filter(f => f.matches.some(m => m.name === single.name))
                    .forEach(f => {
                        f.matches = f.matches.filter(w => w.name !== single.name);
                    });
            }
            result.matches.push(...matched);
        }
    }

    const myTicket = ticketText.split('\n')[1].split(',').map(x => +x);

    const answer = sortedFields.reduce((ans, f) => {
        const m = f.matches[0];
        if (answerFieldPredicate(m)) {

            console.log(f.index, m.name, myTicket[f.index]);
            return ans * myTicket[f.index];
        }
        return ans;
    }, 1);

    return answer;
}

(function solve() {
    const input = loadInput(2020, 16);
    console.log('Part I :', part1(input));
    console.log('Part II:', part2(input, f => f.name.startsWith('departure')));
})();