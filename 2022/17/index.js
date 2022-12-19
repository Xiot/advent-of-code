
import { autoParse, log, createGridMap, range, visualizeGrid, minOf, createBounds } from "../../utils";

export const parse = text => text.split('');

const rocks = [
  {name: '-',
    width: 4,
    height: 1,
    blocks: [
      {x: 0, y: 0},
      {x: 1, y: 0},
      {x: 2, y: 0},
      {x: 3, y: 0}
    ]
  },
  {name: '+',
    width: 3,
    height: 3,
    blocks: [
      {x: 1, y: 0},
      {x: 0, y: 1},
      {x: 1, y: 1},
      {x: 2, y: 1},
      {x: 1, y: 2}
    ]},
  {
    name: 'L',
    width: 3,
    height: 3,
    blocks: [
      {x: 2, y: 0},
      {x: 2, y: 1},
      {x: 0, y: 2},
      {x: 1, y:2},
      {x:2, y:2}
    ]
  },
  {name: '|',
    width: 1,
    height: 4,
    blocks: [
      {x: 0, y:0},
      {x: 0, y: 1},
      {x: 0, y: 2},
      {x: 0, y:3}
    ]},
  {name: '0',
    width: 2,
    height: 2,
    blocks: [
      {x: 0, y: 0},
      {x: 1, y: 0},
      {x: 0, y: 1},
      {x: 1, y: 1}
    ]}
];

const WIDTH = 7;

export function part1(input) {

  const grid = createGridMap('.');
  for(let x of range(0, 6)) {
    grid.set(x, 0, '=');
  }

  let blockIndex = 0;
  let x = 2;
  let y = grid.bounds.top - 4;

  let count = 0;

  const BLOCK_STOP = global.args.inputName === 'sample.txt' ? 11 : 2022;

  //for(let dir of input) {
  let dirIndex = -1;
  while(true) {
    dirIndex = (dirIndex +1) % input.length;
    const dir = input[dirIndex];

    let block = rocks[blockIndex];

    // wind
    if (dir === '>' && !collisionCheck(grid, block, x+1, y)) {
      if(block.width + x < WIDTH) x++;
    } else if (dir === '<') {
      if (x - 1 >= 0 && !collisionCheck(grid, block, x-1, y)) {
        x--;
      } 
    }        

    // move down
    if (collisionCheck(grid, block, x, y + 1)) {
      for(let b of block.blocks) {
        grid.set(x + b.x, y + b.y, block.name);
      }
      
      count ++;
      if (count === BLOCK_STOP) break;

      blockIndex = (blockIndex +1) % rocks.length;
      
      x = 2;
      y = grid.bounds.top - 3 - rocks[blockIndex].height;     
      
    }  else {
      y++;
    }

  }
  return -grid.bounds.top;
}

function debug(grid, block, x, y) {
  const clone = grid.clone();
  for(let bit of block.blocks) {
    clone.set(x + bit.x, y+bit.y, '#');
  }
  console.log();
  console.log(
    visualizeGrid(clone, (x,y) => clone.get(x,y))
  );
}

function collisionCheck(grid, block, x, y) {
  for(let bit of block.blocks) {
    if (grid.has(x + bit.x, y+bit.y)) return true;
  }
  return false;
}

export function part2(input) {


  let grid = createGridMap('.');
  for(let x of range(0, 6)) {
    grid.set(x, 0, '=');
  }

  let blockIndex = 0;
  let x = 2;
  let y = grid.bounds.top - 4;

  let count = 0;

  const BLOCK_STOP = 1000000000000;
  
  // let pattern = null;

  let dirIndex = -1;
  let first = true;

  let patterns = [];
  let found = null;

  while(true) {
    dirIndex = (dirIndex +1) % input.length;
    const dir = input[dirIndex];

    let block = rocks[blockIndex];

    if (dirIndex === 0 ) {
      log('repeat', count, blockIndex, -grid.bounds.top);
      
      if (first) {
        first = false;
      } else {
        let pattern = {count, blockIndex, height: -grid.bounds.top};
        const f = patterns.find((p => {
          return p.blockIndex === pattern.blockIndex;
        }));

        if (f) {
          found = {...f, offset: {block: pattern.count - f.count, height: pattern.height - f.height}};
          // break;
        } else {
          patterns.push(pattern);
        }
      }

      // if (pattern == null && !first) {
      //   pattern = {count, blockIndex, height: -grid.bounds.top};
      // } else if (pattern && pattern.blockIndex === blockIndex) {
      //   pattern = {count, blockIndex, blockDiff: count , heightDiff: (-grid.bounds.top) - pattern.height, height: -grid.bounds.top};
      //   log('p', pattern);
      //   // break;
      // }
      // first = false;
    }

    // wind
    if (dir === '>' && !collisionCheck(grid, block, x+1, y)) {
      if(block.width + x < WIDTH) x++;
    } else if (dir === '<') {
      if (x - 1 >= 0 && !collisionCheck(grid, block, x-1, y)) {
        x--;
      } 
    }        

    // move down
    if (collisionCheck(grid, block, x, y + 1)) {
      for(let b of block.blocks) {
        try {
          grid.set(x + b.x, y + b.y, block.name);
        } catch(ex) {
          log(count, x + b.x, y + b.y, block, `${x+b.x},${y+b.y}`);
          throw ex;
        }
      }

      if (grid.bounds.height > 10000) {
        const b = createBounds({
          ...grid.bounds.toJSON(),
          bottom: grid.bounds.top + 200
        });
        grid = grid.prune(b);
      }
      
      count ++;
      if (count === BLOCK_STOP) break;

      blockIndex = (blockIndex +1) % rocks.length;
      
      x = 2;
      y = grid.bounds.top - 3 - rocks[blockIndex].height;     
      
    }  else {
      y++;
    }

  }
  log(found);
  log(grid.bounds);

  const repeat = Math.floor(BLOCK_STOP / found.offset.block);
  log(repeat);

  const h = found.offset.height + repeat * found.offset.height;

  const b = createBounds({
    ...grid.bounds.toJSON(),
    bottom: grid.bounds.top + 200
  });
  grid = grid.prune(b);

  // return -grid.bounds.top;
  return h;
}    

/*
  1514285714288
  1533333333318
  1866666666676
*/

function collisionCheckFloor(floor, block, x, y) {
  for(let bit of block.blocks) {
    const py = y + bit.y;
    if (floor.some(fy => fy <= py)) return true;
  }
  return false;
}