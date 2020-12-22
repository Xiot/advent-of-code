import {loadInput} from '../../utils';

function part1(input) {
    const [p1, p2] = parseInput(input);

    while(p1.cards.length && p2.cards.length) {
        const p1Card = p1.cards.shift();
        const p2Card = p2.cards.shift();

        const winner = p1Card > p2Card ? p1 : p2;
        const [wc, lc] = [p1Card, p2Card].sort((l,r) => r - l);
        winner.cards.push(wc, lc);
    }

    const winner = p1.cards.length > 0 ? p1 : p2;
    const length = winner.cards.length;

    return winner.cards.reduce((sum, card, index) => {
        return sum + card * (length - index);
    }, 0);
}

function part2(input) {
    const [p1, p2] = parseInput(input);

    const roundHashKey = (l, r) => `${l.join(',')}|${r.join(',')}`;

    function recursiveCombat(d1, d2, depth = 0) {
        const cache = new Map();
        while(d1.length && d2.length) {

            const roundKey = roundHashKey(d1, d2);
            if (cache.has(roundKey)) {
                return 1;
            }
            cache.set(roundKey, true);

            const p1Card = d1.shift();
            const p2Card = d2.shift();

            if (d1.length >= p1Card && d2.length >= p2Card) {

                // console.group('Game ', depth, p1Card, p2Card, d1.length, d2.length);
                const winnerId = recursiveCombat(
                    d1.slice(0, p1Card),
                    d2.slice(0, p2Card),
                    depth + 1);
                // console.log('Winner', winnerId);

                const winner = winnerId === 1 ? d1 : d2;
                const [wc, lc] = winnerId === 1 ? [p1Card, p2Card] : [p2Card, p1Card];
                winner.push(wc, lc);
                // console.log('r', round+1, winnerId, p1Card, p2Card, d1, d2, d1.length, d2.length);

            } else {

                const [wc, lc] = [p1Card, p2Card].sort((l,r) => r - l);
                const winner = p1Card > p2Card ? d1 : d2;

                winner.push(wc, lc);
                // console.log(round+1, p1Card > p2Card ? 1 : 2,  p1Card, p2Card, d1,d2,d1.length, d2.length);
            }
        }
        return d1.length === 0 ? 2 : 1;
    }

    const w = recursiveCombat(p1.cards, p2.cards);

    const winner = w === 1 ? p1 : p2;
    const length = winner.cards.length;

    console.log(p1);
    console.log(p2);
    return winner.cards.reduce((sum, card, index) => {
        return sum + card * (length - index);
    }, 0);
}

function parseInput(input) {
    const players = input.split('\n\n');
    return players.map(x => {
        return {
            id: x[7],
            cards: x.split('\n').slice(1).map(x => parseInt(x, 10))
        };
    });
}

(function solve() {
    const input = loadInput(2020, 22);
    console.log('Part I :', part1(input));
    console.log('Part II:', part2(input));
})();