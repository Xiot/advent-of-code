import {loadInput, assert, toCharCode} from '../common';
import {sortBy} from 'lodash';

// Step W must be finished before step X can begin.
const parseRegEx = /Step (\w) must be finished before step (\w) can begin./;
const links = loadInput(2018, 7)
    .split('\n')
    .map(line => {
        const [,prev, next] = parseRegEx.exec(line);
        return {
            from: prev,
            to: next
        };
    });

class Node {

    requires = [];
    requiredBy = [];

    constructor(name) {
        this.name = name;
    }
}

class Graph {

    completed = Object.create(null);
    remaining = [];
    inProgress = [];

    nodes = Object.create(null);

    constructor(links) {
        links.forEach(link => this._addLink(link));
        this.remaining = sortBy(Array.from(Object.values(this.nodes)), x => x.name);
    }
    isComplete() {
        return this.remaining.length === 0;
    }

    _addLink(link) {
        const from = this.getNode(link.from);
        const to = this.getNode(link.to);

        from.requiredBy.push(to);
        to.requires.push(from);
    }

    getNode(name) {
        return this.nodes[name] ?? (this.nodes[name] = new Node(name));
    }

    complete(name) {
        const node = typeof name === 'string' ? this.getNode(name) : name;
        this.completed[node.name] = node;
        this.remaining = this.remaining.filter(x => x !== node);
        this.inProgress = this.inProgress.filter(x => x!== node);
    }
    take(node) {
        this.inProgress.push(node);
        return node;
    }

    _isNodeAvailable(node) {
        if (this.inProgress.includes(node)) {
            return false;
        }
        if (this.completed[node.name]) {
            return false;
        }
        return node.requires.every(x => this.completed[x.name]);
    }

    get available() {
        return this.remaining.filter(node => this._isNodeAvailable(node));
    }

    getNext() {
        return this.take(this.available[0]);
    }
}

function part1() {

    const instructions = new Graph(links);

    let next;
    while((next = instructions.getNext())) {
        instructions.complete(next);
    }

    const completedOrder = Object.keys(instructions.completed).join('');

    console.log('\nPart I');
    console.log('Order:', completedOrder);
    assert('GRTAHKLQVYWXMUBCZPIJFEDNSO', completedOrder, 'Order');
}

function taskTime(node) {
    return 60 + toCharCode(node.name) - toCharCode('A') + 1;
}

function createWorkerQueue(maxWorkers) {
    let queue = [];

    return {
        get idleCount() {return maxWorkers - queue.length; },
        get queue() {return queue;},
        dequeue() {
            return queue.shift();
        },
        enqueue(node, endTime) {
            queue = sortBy([...queue, {node, endTime}], x => x.endTime);
        }
    };
}

function part2() {

    const instructions = new Graph(links);

    let time = 0;
    const workers = createWorkerQueue(5);

    while(!instructions.isComplete()) {
        if (instructions.available.length && workers.idleCount > 0) {

            let node = instructions.getNext();
            workers.enqueue(node, time + taskTime(node));

        } else {
            const worker = workers.dequeue();
            if (worker.endTime > time) {
                time = worker.endTime;
            }
            instructions.complete(worker.node);
        }
    }

    console.log('\nPart II');
    const completedOrder = Object.keys(instructions.completed).join('');
    console.log('Order: ', completedOrder);
    console.log('Time Take', time);
    assert(1115, time, 'Time');
}

part1();
part2();
