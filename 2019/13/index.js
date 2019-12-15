import {loadProgram, execute, executeIterator, visualizeGrid, createGripMap} from '../common';
import chalk from 'chalk';

const Tile = {
    empty: 0,
    wall: 1,
    block: 2,
    paddle: 3,
    ball: 4
};

function createIo(board, readFn) {

    let tuple = [];
    let score = 0;

    let ball = undefined;
    let paddle = undefined;

    return {
        read() {
            return readFn();
        },
        write(value) {
            tuple.push(value);
            if (tuple.length !== 3) {
                return;
            }
            const [x, y, tile] = tuple;
            tuple = [];
            board.set(x, y, value);
        },
        get score() {
            return score;
        },
        get ball() {
            return ball;
        }
    };
}

function createGameBoard() {
    const grid = createGripMap((x, y) => {
        return {x, y, tile: 0};
    });

    let score = 0;
    let ball = {x: 0, y: 0};
    let paddle = {x: 0, y: 0};

    return {
        get ball() { return ball; },
        get paddle() { return paddle; },
        get score() { return score; },

        set(x, y, tile) {

            if (x === -1 && y === 0) {
                score = tile;
                return;
            }

            if (tile === Tile.ball) {
                ball = {x, y};
            } else if (tile === Tile.paddle) {
                paddle = {x, y};
            }

            grid.set(x, y, {x, y, tile});
        },
        tileAt(x, y) {
            return grid.get(x, y).tile;
        },
        get bounds() { return grid.bounds; },
        entries() {
            return grid.entries();
        },
        values() {
            return grid.values();
        }
    };
}

async function part1() {
    const program = loadProgram('2019/13');

    const board = createGameBoard();
    const io = createIo(board);

    await execute(program, io);

    const blockCount = Array.from(board.values()).filter(b => b.tile === Tile.block).length;
    printGrid(board);
    console.log('\nPart I');
    console.log('Blocks:', blockCount);
}

async function part2() {
    const program = loadProgram('2019/13');

    // Add some quarters
    program[0] = 2;

    const board = createGameBoard();
    const io = createIo(board, () => {
        if (board.paddle.x < board.ball.x) {
            return 1;
        } else if (board.paddle.x > board.ball.x) {
            return -1;
        }
        return 0;
    });

    await execute(program, io);

    printGrid(board);

    console.log('\nPart II');
    console.log('Score', board.score);

}

function printGrid(grid) {
    const text = visualizeGrid(grid.bounds, (x, y) => {
        const tile = grid.tileAt(x, y);
        switch(tile) {
        case Tile.empty: return ' ';
        case Tile.wall: return chalk.bgWhite(' ');
        case Tile.block: return chalk.bgBlueBright(' ');
        case Tile.paddle: return chalk.bgRed(' ');
        case Tile.ball: return chalk.bgWhiteBright(' ');
        }
    });
    console.log();
    console.log(text);
    console.log();
}

(async () => {
    // await part1();
    await part2();
})();