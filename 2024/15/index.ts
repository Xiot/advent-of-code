import { isEqual, uniq, uniqBy } from 'lodash';
import { byLine, createGridMap, GridMap, loadGrid, log, Point, sumOf, visualizeGrid } from '../../utils';
type Input = ReturnType<typeof parse>;

export const parse = (text: string) => {
  const sections = text.split('\n\n');
  return {
    grid: loadGrid(sections[0], '.'),
    directions: sections[1].replaceAll('\n', '').split('') as (keyof typeof DIRECTIONS)[],
  };
};

const DIRECTIONS = {
  v: { x: 0, y: 1 },
  '^': { x: 0, y: -1 },
  '<': { x: -1, y: 0 },
  '>': { x: 1, y: 0 },
} as const;

function add(l: Point, r: Point) {
  return {
    x: l.x + r.x,
    y: l.y + r.y,
  };
}
function mul(l: Point, m: number) {
  return {
    x: l.x * m,
    y: l.y * m,
  };
}

export function part1(input: Input) {
  log(input.directions);
  const robot = input.grid.entries().find(entry => entry[1] === '@');
  log(robot);

  const grid = input.grid;
  let pos = robot[0];
  for (let i = 0; i < input.directions.length; i++) {
    const dir = DIRECTIONS[input.directions[i]];

    const op = canMove1(grid, pos, dir);

    log(`${i} ${input.directions[i]} -------`, op === false ? 'none' : op.op);

    if (op === false) continue;
    if (op.op === 'move') {
      grid.set(pos.x, pos.y, '.');
      grid.set(op.bot.x, op.bot.y, '@');
    } else if (op.op === 'shift') {
      grid.set(pos.x, pos.y, '.');
      grid.set(op.bot.x, op.bot.y, '@');
      grid.set(op.newBox.x, op.newBox.y, 'O');
    }
    pos = op.bot;

    log(visualizeGrid(grid));
    log();
  }

  const gps = grid
    .entries()
    .filter(e => e[1] === 'O')
    .reduce((acc, cur) => {
      return acc + cur[0].y * 100 + cur[0].x;
    }, 0);
  return gps;
}

type Block = {
  id: number;
  pos: Point;
};
export function part2(input: Input) {
  const blank = createGridMap('.');

  let robot: Point;
  const blocks: Block[] = [];
  input.grid.entries().forEach(([pos, val]) => {
    if (isBlock(val)) {
      blank.set(pos.x * 2, pos.y, '.');
      blank.set(pos.x * 2 + 1, pos.y, '.');
      blocks.push({ id: blocks.length, pos: { x: pos.x * 2, y: pos.y } });
      return;
    }
    if (val === '@') {
      robot = { x: pos.x * 2, y: pos.y };
      blank.set(pos.x * 2, pos.y, '.');
      blank.set(pos.x * 2 + 1, pos.y, '.');
      return;
    }
    blank.set(pos.x * 2, pos.y, val);
    blank.set(pos.x * 2 + 1, pos.y, val);
  });

  log(visualizeGrid(apply(blank, robot, blocks)));

  let grid = apply(blank, robot, blocks);
  const MAX = input.directions.length;
  for (let i = 0; i < MAX; i++) {
    const dir = DIRECTIONS[input.directions[i]];

    const op = canMove2(grid, blocks, robot, dir);

    log(`${i} ${input.directions[i]} -------`, op === false ? 'none' : op.op);

    if (op === false) continue;
    if (op.op === 'shift') {
      log(op);
      op.blocks.forEach(b => {
        b.pos = add(b.pos, dir);
      });
    }

    robot = op.bot;
    grid = apply(blank, robot, blocks);
    log(visualizeGrid(grid));
    log('');
  }

  return sumOf(blocks, b => b.pos.x + b.pos.y * 100);
}

function apply(grid: GridMap, robot: Point, blocks: Block[]) {
  const clone = grid.clone();
  blocks.forEach(b => {
    clone.set(b.pos.x, b.pos.y, '[');
    clone.set(b.pos.x + 1, b.pos.y, ']');
  });
  clone.set(robot.x, robot.y, '@');
  return clone;
}

type CanMoveResult = false | { op: 'move'; bot: Point } | { op: 'shift'; bot: Point; newBox: Point };

function canMove1(grid: GridMap, pos: Point, dir: Point): CanMoveResult {
  const newPos = add(pos, dir);
  const ahead = grid.get(newPos.x, newPos.y);
  if (ahead === '#') return false;

  if (ahead === 'O') {
    let isBlocked = false;
    let p = newPos;
    while (true) {
      let b = grid.get(p.x, p.y);
      if (b === '.') break;
      if (b === '#') {
        isBlocked = true;
        break;
      }
      p = add(p, dir);
    }

    if (isBlocked) return false;

    return {
      op: 'shift',
      bot: newPos,
      newBox: p,
    };
  }

  return {
    op: 'move',
    bot: newPos,
  };
}

function isBlock(val: string) {
  return val === 'O' || val === '[' || val === ']';
}

function blockAt(blocks: Block[], pos: Point) {
  return blocks.find(b => {
    if (b.pos.y !== pos.y) return false;
    return pos.x === b.pos.x || pos.x === b.pos.x + 1;
  });
}

function affectedBlocks(grid: GridMap, blocks: Block[], pos: Point, dir: Point) {
  let newPos = add(pos, dir);
  let nextCell = grid.get(newPos.x, newPos.y);
  if (nextCell === '.') return [];
  if (nextCell == '#') return null;

  let first = blockAt(blocks, newPos);
  if (first == null) return [];

  let affected: Block[] = [first];

  if (isEqual(dir, DIRECTIONS['<']) || isEqual(dir, DIRECTIONS['>'])) {
    const nextBlocks = affectedBlocks(grid, blocks, add(newPos, dir), dir);
    if (nextBlocks == null) return null;
    return [...affected, ...nextBlocks];
  }

  if (isEqual(dir, DIRECTIONS['^']) || isEqual(dir, DIRECTIONS['v'])) {
    const leftBlocks = affectedBlocks(grid, blocks, first.pos, dir);
    const rightBlocks = affectedBlocks(grid, blocks, add(first.pos, { x: 1, y: 0 }), dir);

    if (leftBlocks == null || rightBlocks == null) return null;
    const q = uniqBy([...leftBlocks, ...rightBlocks], x => x.id);
    return [first, ...q];
  }

  log(pos, dir);
  throw new Error('uuummm');
}

type CanMove2Result = false | { op: 'move'; bot: Point } | { op: 'shift'; bot: Point; blocks: Block[] };
function canMove2(grid: GridMap, blocks: Block[], pos: Point, dir: Point): CanMove2Result {
  const newPos = add(pos, dir);
  const ahead = grid.get(newPos.x, newPos.y);
  if (ahead === '#') return false;

  if (isBlock(ahead)) {
    let affected = affectedBlocks(grid, blocks, pos, dir);
    if (affected == null) return false;

    return {
      op: 'shift',
      bot: newPos,
      blocks: affected,
    };
  }

  return {
    op: 'move',
    bot: newPos,
  };
}
