import {createGripMap, loadProgram, execute} from '../common';
import {visualizeGrid} from '../common';
import {isEqual} from 'lodash';

const ColorBlack = 0;
const ColorWhite = 1;

const Direction = {
    up: 0,
    right: 1,
    down: 2,
    left: 3
};

function rotateLeft(current) {
    return (current + 3) % 4;
}
function rotateRight(current) {
    return (current + 1) % 4;
}
function moveOffset(direction) {
    switch(direction) {
    case Direction.up: return {x: 0, y: -1};
    case Direction.right: return {x: 1, y: 0};
    case Direction.down: return {x: 0, y: 1};
    case Direction.left: return {x: -1, y: 0};
    }
}

class Robot {
    position = {x: 0, y: 0};
    direction = Direction.up;

    rotateLeft() {
        this.direction = rotateLeft(this.direction);
    }
    rotateRight() {
        this.direction = rotateRight(this.direction);
    }
    step() {
        const offset = moveOffset(this.direction);
        this.position = {x: this.position.x + offset.x, y: this.position.y + offset.y};
    }
}

async function part1() {
    const input = loadProgram('2019/11');

    const painter = createPainter();
    const wallee = new Robot();

    let writeType = 0;
    const io = {
        read() {
            return painter.color(wallee.position);
        },
        write(value) {
            if (value > 1) {
                throw new Error(`Unknown value: ${value}`);
            }
            if (writeType === 0) {
                // console.log('PAINT', wallee.position, value);
                painter.paint(wallee.position, value);
            } else {
                value === 0
                    ? wallee.rotateLeft()
                    : wallee.rotateRight();
                wallee.step();
                painter.bounds.mark(wallee.position.x, wallee.position.y);
            }

            writeType = (writeType + 1) % 2;
        }
    };

    // const handler = createInteractiveHandler({
    //     // filter(c) {return c.op.code === OpCodes.write;},
    //     handler(c) {
    //         debugPainter(painter, wallee);
    //     }
    // });
    // await stepExecute(input, io, handler);

    await execute(input, io);

    debugPainter(painter, wallee);

    const paintedTiles = Array.from(painter.values())
        .filter(x => x.paintCount >= 1).length;

    console.log(paintedTiles);

    return paintedTiles;
}

async function part2() {
    const input = loadProgram('2019/11');

    const painter = createPainter();
    const wallee = new Robot();

    let writeType = 0;
    const io = {
        read() {
            return painter.color(wallee.position);
        },
        write(value) {
            if (value > 1) {
                throw new Error(`Unknown value: ${value}`);
            }
            if (writeType === 0) {
                // console.log('PAINT', wallee.position, value);
                painter.paint(wallee.position, value);
            } else {
                value === 0
                    ? wallee.rotateLeft()
                    : wallee.rotateRight();
                wallee.step();
                painter.bounds.mark(wallee.position.x, wallee.position.y);
            }

            writeType = (writeType + 1) % 2;
        }
    };

    painter.paint({x: 0, y:0}, ColorWhite);
    await execute(input, io);

    console.log('\nPart II');
    debugPainter(painter, wallee);
}

function visualizeDirection(d) {
    switch(d) {
    case Direction.up: return '^';
    case Direction.down: return 'v';
    case Direction.left: return '<';
    case Direction.right: return '>';
    }
}
function debugPainter(painter, robot) {

    const t = visualizeGrid(painter.bounds, (x, y) => {
        const p = {x,y};

        if (isEqual(p, robot.position)) {
            return visualizeDirection(robot.direction);
        }

        if (!painter.has(p)) {
            return '_';
        }
        return painter.color(p) === ColorBlack ? '.' : '#';
    });
    console.log();
    console.log(t);
    console.log();
}

(async () => {

    await part1();
    await part2();

})().catch(ex => console.log('ERROR', ex));


function createPainter() {
    const cache = createGripMap((x, y) => {
        return {
            x,
            y,
            color: ColorBlack,
            paintCount: 0
        };
    });

    return {
        color(pos) {
            return cache.get(pos.x, pos.y).color;
        },
        paint(pos, color) {
            cache.set(pos.x, pos.y, state => ({
                ...state,
                color,
                paintCount: state.paintCount + 1
            }));
        },
        has(pos) {
            return cache.has(pos.x, pos.y);
        },
        get bounds() {
            return cache.bounds;
        },
        entries() {
            return cache.entries();
        },
        values() {
            return cache.values();
        }
    };
}
