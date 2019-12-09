import {range, maxBy} from 'lodash';
import {assert, time} from '../common';

// 446 players; last marble is worth 71522 points
const Players = 446;
const Marbles = 71522;

class Node {
    next = null;
    prev = null;
    constructor(value) {
        this.value = value;
    }
}

class CircularLinkedList {
    current = null;
    count = 0;
    head = null;

    constructor() {

    }
    removeCurrent() {
        if(!this.current) { return; }
        const next = this.current.next;
        const prev = this.current.prev;

        prev.next = next;
        next.prev = prev;

        this.current.next = null;
        this.current.prev = null;
        this.current = next;

        this.count -= 1;
    }
    addAfter(value) {
        this.count += 1;
        const newNode = new Node(value);
        if (this.current == null) {
            this.current = newNode;
            this.current.next = newNode;
            this.current.prev = newNode;

            this.head = this.current;
        } else {
            const next = this.current.next;
            this.current.next = newNode;
            next.prev = newNode;
            newNode.prev = this.current;
            newNode.next = next;

            this.current = newNode;
        }
    }
    move(value) {
        if (value === 0) { return; }
        const fn = value < 0 ? n => n.prev : n => n.next;

        for(let x = 0; x < Math.abs(value); x++) {
            this.current = fn(this.current);
        }
    }
    debug() {
        let values = [];
        let num = 0;
        let n = this.head;
        do {
            values.push(n.value);
            num += 1;
            // n = n.next;
            n = n.prev;
        } while(n !== this.head || num > this.count);
        return values;
    }
}

function createLinkedBoard() {
    const board = new CircularLinkedList();
    board.addAfter(0);

    return {
        play(marble) {
            board.move(1);
            board.addAfter(marble);
        },
        rule23() {
            board.move(-7);
            const value = board.current.value;
            board.removeCurrent();
            return value;
        },
        get current() {
            return board.current.value;
        },
        print() {
            const message = board.debug().map(x => String(x)).join(' ');
            console.log(message);
        }
    };
}

function part1(numPlayers, numMarbles, answer) {
    let board = createLinkedBoard();
    let players = range(0, numPlayers).map(x => ({score: 0, index: x}));
    let currentPlayerIndex = 0;


    for(let marble = 1; marble <= numMarbles; marble++) {
        const player = players[currentPlayerIndex];

        if (marble % 23 === 0) {
            // board.print();

            player.score += marble + board.rule23();

        } else {
            board.play(marble);
        }

        currentPlayerIndex = (currentPlayerIndex + 1) % numPlayers;
    }
    const winner = maxBy(players, x => x.score);

    console.log('\nPart I');
    console.log('High Score:', winner.score);
    if (answer) {
        assert(answer, winner.score, 'Score');
    }

}

// 10 players; last marble is worth 1618 points: high score is 8317     y
// 13 players; last marble is worth 7999 points: high score is 146373   n
// 17 players; last marble is worth 1104 points: high score is 2764     y
// 21 players; last marble is worth 6111 points: high score is 54718    y
// 30 players; last marble is worth 5807 points: high score is 37305    y

time('Part I', () =>
    part1(Players, Marbles)
);

time('Part I', () =>
    part1(Players, Marbles * 100)
);
