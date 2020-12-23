import {loadInput,maxOf,range} from '../../utils';

function part1(input, moves) {
    let cups = parseInput(input);

    const LENGTH = cups.length;

    let currentIndex = 0;

    for(let i = 0; i < moves; i++) {
        let current = cups[currentIndex];

        const m = pick3(cups, currentIndex);
        const dest = findDestination(m.remaining, current);
        const destIndex = m.remaining.indexOf(dest);

        m.remaining.splice(
            Math.min(destIndex + 1, m.remaining.length),
            0,
            ...m.values
        );
        cups = m.remaining;

        currentIndex = (cups.indexOf(current) + 1) % LENGTH;
    }

    const offset = cups.indexOf(1) + 1;
    const result = range(0, LENGTH - 2).map(i => at(cups, i + offset)).join('');
    return result;
}

function findDestination(cups, value, exclude = []) {
    while(true) {
        value -=1;
        if (exclude.indexOf(value) >= 0) continue;
        if (value <= 0) value = 10;
        if (cups.includes(value)) return value;
    }
}

function pick3(cups, index) {
    const values = range(1,3).map(i => at(cups, index + i));
    const remaining = cups.filter(c => !values.includes(c));
    return {
        values,
        remaining
    };
}

function at(arr, index) {
    return arr[index % arr.length];
}

class Node {
    constructor(value) {
        this.value = value;
    }
    move(offset) {
        if (offset === 0) return this;
        const key = offset < 0 ? 'prev' : 'next';
        let cur = this;
        for(let i =0; i < Math.abs(offset); i++) {
            cur = cur[key];
        }
        return cur;
    }
}
function buildList(cups) {
    let head = new Node(-1);
    const lookup = new Map();

    let cur = head;
    cups.forEach(v => {
        const newNode = new Node(v);
        newNode.prev = cur;
        cur.next = newNode;
        lookup.set(v, cur.next);
        cur = cur.next;
    });
    const last = lookup.get(cups[cups.length - 1]);
    last.next = head.next;
    head.next.prev = last;

    return {
        head,
        lookup
    };
}

function part2(input, moves) {

    const starting = parseInput(input);
    let cups = Array.from(new Array(1_000_000), (x, i) => {
        return i < starting.length ? starting[i] : 10 + i - starting.length;
    });
    let max = maxOf(cups, x => x);

    const {head, lookup} = buildList(cups);

    const findDestinationNode = (current, exclude) => {

        let value = current.value - 1;
        if (value < 1) {
            value = max;
        }
        while(exclude.includes(value)) {
            value --;
            if (value < 1) value = max;
        }
        return lookup.get(value);
    };

    function remove(base, length) {
        const oldNode = base.next;
        const next = base.move(length + 1);
        next.prev.next = null;
        next.prev = base;
        base.next = next;

        return oldNode;
    }

    function insert(base, node, length = 1) {
        const old = base.next;
        base.next = node;
        node.prev = base;

        const last = node.move(length - 1);
        last.next = old;
        old.prev = last;
    }

    function valuesOf(node, length) {
        let values = [];
        let n = node;
        for(let i = 0; i < length; i++) {
            values.push(n.value);
            n = n.next;
        }
        return values;
    }

    let current = head;

    for(let i = 0; i < moves; i++) {

        current = current.next;
        const pick3 = remove(current, 3);
        const destination = findDestinationNode(current, valuesOf(pick3, 3));
        insert(destination, pick3, 3);
    }

    const node1 = lookup.get(1);
    const v = valuesOf(node1.next, 2);
    return v[0] * v[1];
}

function parseInput(input) {
    return input.split('').map(x => parseInt(x, 10));
}

(function solve() {
    const input = loadInput(2020, 23);
    console.log('Part I :', part1(input, 100));
    console.log('Part II:', part2(input, 10_000_000));
})();