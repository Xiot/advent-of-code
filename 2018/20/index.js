
import { autoParse, log, createGridMap, visualizeGrid, maxOf, minOf } from "../../utils";

export const parse = parseInput;

export function part1(input) {  
  const reader = createReader(input);
  const tokens = reader.read();
  // log(tokens);
  
  // return minLengthOf(tokens);
  // return maxLengthOf([ [ 'N', 'E', 'W', 'S' ], [ '' ] ]);
  
  // return; 
  const {start, nodes, cache} = createMap(tokens);  
  const grid = createGrid(start);
  
  grid.set(start.x*2, start.y*2, 'X');
  console.log(
    visualizeGrid(grid, (x, y) => grid.get(x, y) ?? '#')
  );
  
  // const e = cache.get('1,0');
  // log(e);

  const farthest = findFarthestRoom(start);
  return farthest;
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
  return DIRS.includes(letter);
}

function parseInput(text) {
  text = text.slice(1, -1);
  log(text);
  return text;
}

// (EEENWNW

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
    paths: [],
    path: ''
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

function createMap(initialToken) {
  const start = createRoom(0, 0);
  const cache = new Map();  
  cache.set(start.key, start);

  function move(room, dir) {
    if (!dir) return room;
    
    const newPos = add(room, OFFSET[dir]);
    const key = keyOf(newPos.x, newPos.y);
    
    let next = cache.get(key);
    if (!next) {
      // log('create', newPos, key);
      next = createRoom(newPos.x, newPos.y);
      next.path = room.path ?? '';
      cache.set(next.key, next);
    }    
    room.doors[dir] = next;
    next.doors[oppositeOf(dir)] = room;

    // log('move', room.key.padStart(6), dir, next.key, Object.keys(room.doors), Object.keys(next.doors));

    next.path += dir;
    next.paths.push((room.path ?? '') + dir);
    return next;
  }

  function appendSequence(room, sequence) {
    
    let rooms = [room];
    for(let m of sequence.values) {      
      if (typeof m === 'string') {
        for(let i = 0; i < rooms.length; i++) {
          rooms[i] = move(rooms[i], m);
        }
      } else if (m.type === 'options') {
        let newRooms = [];
        for (let i = 0; i < rooms.length; i++) {
          newRooms.push(...appendOptions(rooms[i], m));
        }
        rooms = newRooms;
      }      
    }
    return rooms;
  }

  function appendOptions(room, option) {    
    let newRooms = [];    
    for(let m of option.choices) {
      if (m.type === 'sequence') {                
        newRooms.push(...appendSequence(room, m));        
      } else if (m.type === 'options') {                
        newRooms.push(...appendOptions(room, m));        
      }
    }
    
    return newRooms;
  }

  return {
    start,
    nodes: appendSequence(start, initialToken),
    cache
  };

}

// function gen(text, startIndex = 0) {
//   let index = startIndex;


//   function readSequence() {

//     if (text[index] === ')') return '';

//     let sequence = [text[index]];
//     while(index < text.length - 1) {
//       const char = text[++index];
//       if (isDirection(char)) {        
//         sequence.push(char);
//       } else if (char === '(') {        
//         sequence.push(readOptions());
//         break;
//       } else if (char === '|') {
//         break;
//       }
//     }
//     return sequence;
//   }

//   function readOptions() {
//     let sequences = [];
//     if (text[index] !== '(') 
//       throw new Error(`Expected '(' at ${index}. Found ${text[index]})`);

//     while(true) {
//       let char = text[++index];      
//       if (char === ')') break; 
//       if (char === '|') index++;     
//       sequences.push(readSequence());
//       if (index >= text.length - 1 ) break;
//     }
//     return sequences;
//   }

//   return {
//     get index() {return index;},
//     read() {
//       return readSequence();      
//     }
//   };
// }