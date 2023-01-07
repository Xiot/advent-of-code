
import { log, createGridMap, visualizeGrid } from "../../utils";

export const parse = text => text.slice(1, -1);

export function part1(input) {  
  const reader = createReader(input);
  const tokens = reader.read();
  
      
  const {start} = createMapIterative(tokens);
  const grid = createGrid(start);
  
  grid.set(start.x*2, start.y*2, 'X');
  console.log(
    visualizeGrid(grid, (x, y) => grid.get(x, y) ?? '#')
  );
    
  const farthest = findFarthestRoom(start);
  return farthest;
}

function findRoomsFurtherThan(start, target) {
  let count = 0;
  const queue = [{node: start, distance: 0}];
  const visited = new Map();
  visited.set(start.key, true);

  while(queue.length > 0) {
    const {node, distance} = queue.shift();
    if (distance >= target) {
      count++;
    }

    Object.entries(node.doors).forEach(([dir, room]) => {
      if (visited.has(room.key)) return;
      visited.set(room.key, true);
      queue.push({node: room, distance: distance + 1});
    });
  }
  return count;
}

function findFarthestRoom(start) {
  const queue = [{node: start, distance: 0}];
  const visited = new Map();
  visited.set(start.key, true);

  let farthest = 0;

  while(queue.length > 0) {
    const {node, distance} = queue.shift();
    if (distance > farthest) {
      farthest = distance;
    }

    Object.entries(node.doors).forEach(([dir, room]) => {
      if (visited.has(room.key)) return;
      visited.set(room.key, true);
      queue.push({node: room, distance: distance + 1});
    });
  }
  return farthest;
}

function createGrid(node) {
  const queue = [node];
  const visited = new Map();
  visited.set(node.key, true);

  const grid = createGridMap();

  while(queue.length > 0) {
    const node = queue.shift();
    grid.set(node.x*2, node.y*2, '.');
    
    for(let dir of DIRS) {
      const doorPos = add({x: node.x*2, y: node.y*2}, OFFSET[dir]);
      const room = node.doors[dir];

      if (!room) {        
        grid.set(doorPos.x, doorPos.y, '#');
        continue;
      }
      if (visited.has(room.key)) continue;
      visited.set(room.key, true);
      
      grid.set(doorPos.x, doorPos.y, DOORS[dir]);

      queue.push(room);
    };
  }
  return grid;

}

export function part2(input) {
  const reader = createReader(input);
  const tokens = reader.read();
  log(tokens);
  
  
  const {start} = createMapIterative(tokens);
  const grid = createGrid(start);
  
  grid.set(start.x*2, start.y*2, 'X');
  console.log(
    visualizeGrid(grid, (x, y) => grid.get(x, y) ?? '#')
  );
    
  return findRoomsFurtherThan(start, 1000);  
}    

/*

type Dir = N | E | S | W
type Room {
  x: number,
  y: number,
  doors: {
    [Dir]: Room
  }
}
*/
const DOORS = {
  N: '-',
  E: '|',
  S: '-',
  W: '|'
};

const DIRS = 'NESW';
function oppositeOf(dir) {
  const index = (DIRS.indexOf(dir) + 2) % DIRS.length;
  return DIRS[index];
}

const OFFSET = {
  N: {x: 0, y: -1},
  E: {x: 1, y: 0},
  S: {x: 0, y: 1},
  W: {x: -1, y: 0}
};
function isDirection(letter) {
  if (typeof letter !== 'string') return false;
  return DIRS.includes(letter);
}

function createReader(text, startIndex = 0) {
  let index = startIndex;
  // log(text);

  function readSequence() {
    let si = index;
    // log.push('s', index, text[index]);
    
    if (text[index] === ')') {
      // log.pop(`~s ${si}`, [''], text[index]);
      return {type: 'sequence', values: ['']};
    }
    if (text[index] === '(') {
      const opts = readOptions();
      // log.pop(`~s ${si}`, opts, text[index]);
      return opts;
    }
    
    let sequence = [];
    while(index < text.length) {
      const char = text[index];
      if (isDirection(char)) {
        sequence.push(char);

      } else if (char === '(') {
        const opts = readOptions();
        sequence.push(opts);        

      } else if (char === '|') {        
        break;

      } else if (char === ')') {        
        break;

      } else {
        throw new Error('boom');
      }
      index++;
    }
    
    // log.pop(`~s ${si}`,sequence, text[index]);
    return {type: 'sequence', values: sequence};
  }

  function readOptions() {
    let si = index;
    let sequences = [];
    if (text[index] !== '(') 
      throw new Error(`Expected '(' at ${index}. Found ${text[index]})`);
    
    // log.push('o', si, text[index]);

    // move past (
    index++;
    while(index < text.length) {
      let char = text[index];
      // log('ro', index, char);

      const s = readSequence();
      sequences.push(s);

      if (text[index] === ')') {        
        break;
      } else if (text[index] === '|') {
        // continue
      } else {
        throw new Error(`Expected '(' or '|' at ${index}. Found ${text[index]}`);
      }

      index++;
    }

    // log.pop(`~o ${si}`, sequences, text[index]);
    return {type: 'options', choices: sequences};
  }

  return {
    get index() {return index;},
    read() {
      return readSequence();      
    }
  };
}

let nextId = 0;
function createRoom(x, y) {
  return {
    id: nextId++,
    get key() {return keyOf(x, y);},
    x,
    y,
    doors: {},    
  };
}

function keyOf(x, y) {
  return `${x},${y}`;
}
function add(l, r) {
  return {
    x: l.x + r.x,
    y: l.y + r.y
  };
}

function createMapIterative(initialToken) {
  const start = createRoom(0, 0);
  const cache = new Map();  
  cache.set(start.key, start);

  function move(room, dir) {
    if (!dir) return room;
    
    const newPos = add(room, OFFSET[dir]);
    const key = keyOf(newPos.x, newPos.y);
    
    let next = cache.get(key);
    if (!next) {      
      next = createRoom(newPos.x, newPos.y);
      cache.set(next.key, next);
    }    
    room.doors[dir] = next;
    next.doors[oppositeOf(dir)] = room;
    
    return next;
  }

  const queue = [{
    room: start, 
    token: initialToken, 
    offset: 0, 
    onComplete: null,
  }];

  while(queue.length > 0) {
    const {room, token, offset, onComplete} = queue.shift();

    if (token.type === 'sequence') {
      if (offset >= token.values.length) {
        onComplete?.(room);
        continue;
      };

      const next = token.values[offset];
      if (next === '') continue;
      if (isDirection(next)) {
        queue.push({
          room: move(room, next),
          token,
          offset: offset + 1,
          onComplete
        });
      } else if (next.type === 'options') {
        for(let o of next.choices) {
          queue.push({
            room,
            token: o,
            offset: 0,
            onComplete(r) {              
              queue.push({
                room: r,
                token,
                offset: offset + 1
              });
            }
          });
        }
      }
    }
  }
  
  return {
    start,    
    cache
  };
}
