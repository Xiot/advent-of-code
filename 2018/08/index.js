import {loadInput, assert} from '../common';
import {range} from 'lodash';

const input = loadInput(2018, 8).split(' ').map(Number);

function createStream(input) {
    let index = -1;
    return {
        read() {
            index += 1;
            return input[index];
        },
        get value() {
            return input[index];
        },
        get index() {
            return index;
        }
    };
}

let i = 0;

function readNode(stream, visitor) {
    const nodeCount = stream.read();
    const metadataCount = stream.read();

    const index = i++;

    const children = range(0, nodeCount).map(() => readNode(stream, visitor));
    const meta = range(0, metadataCount).map(() => stream.read());

    return {
        index,
        children,
        meta,
        data: visitor?.(children, meta, index)
    };
}

function part1() {

    const visitor = (children, meta) => {
        const metaSum = meta.concat(children.flatMap(x => x.data?.metaSum ?? 0))
            .reduce((sum, value) => sum + value);

        return {
            metaSum
        };
    };
    const stream = createStream(input);
    const node = readNode(stream, visitor);

    console.log('\nPart I');
    console.log('Result:', node.data.metaSum);
}

function part2() {

    const visitor = (children, meta) => {

        const value = (children.length === 0
            ? meta
            : meta.map(index => {
                return children[index - 1]?.data?.value ?? 0;
            })
        ).reduce((sum, value) => sum + value);

        return {
            value
        };
    };

    const stream = createStream(input);
    const node = readNode(stream, visitor);

    console.log('\nPart II');
    console.log('Result:', node.data.value);
    assert(21502, node.data.value, 'Value');
}

part1();
part2();