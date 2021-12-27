
import { cloneDeep, isEqual } from "lodash";
import { autoParse, byLine, loadGrid, log, toCharCode, visualizeGrid } from "../../utils";

const MOVE_ENGERY = {
  A: 1,
  B: 10,
  C: 100,
  D: 1000
};

const ROOMS = {
  A: [{x: 3, y: 3, type: 'A', depth: 2}, {x: 3, y: 2, type: 'A', depth: 1}],
  B: [{x: 5, y: 3, type: 'B', depth: 2}, {x: 5, y: 2, type: 'B', depth: 1}],
  C: [{x: 7, y: 3, type: 'C', depth: 2}, {x: 7, y: 2, type: 'C', depth: 1}],
  D: [{x: 9, y: 3, type: 'D', depth: 2}, {x: 9, y: 2, type: 'D', depth: 1}],
};
const HALLWAY = 1;
const ALL_ROOMS = Object.values(ROOMS).flat();
const ROOM_ENTRANCES = [
  {x: 3, y: 1},
  {x: 5, y: 1},
  {x: 7, y: 1},
  {x: 9, y: 1},
];


const NEXT_ID = {
  A: 0,
  B: 0,
  C: 0,
  D: 0
};

function isSamePos(l, r) {
  return l.x === r.x && l.y === r.y;
}
function withSamePosAs(target) {
  return (n) => isSamePos(target, n);
}
const keyOf = n => `${n.x},${n.y}`;
const formatNode = n => {
  const nodeType = n.pod ? n.pod.name : n.isOutsideDoor ? 'D' :  n.isHallway ? 'H' : '.';
  return `${String(n.x).padStart(2)},${String(n.y).padStart(2)}: ${nodeType}`;
};
const byDistance = (l, r) => l.distance - r.distance;

const byPod = (posOrId) => {
  return (pod) => {
    if (typeof posOrId === 'string') {
      return pod.name === posOrId;
    
    } else {
      const {x, y} = posOrId;
      return pod.x === x && pod.y === y;

    }
  };
};

function computeHash(pods) {
  const sorted = [...pods].sort((l, r) => l.name.localeCompare(r.name));
  return sorted.map(p => `${p.x},${p.y}`).join('|');
}

function moveCost(move) {
  const target = move.target ?? move.node;
  if (target.y > 1) {
    return 0;
  }
  const energy = move.distance * MOVE_ENGERY[move.pod.type];
  const multiplier = move.pod.y > 1 ? 1 : 10000;
  return energy * multiplier;
  // return pod.y 
}

class State {
  constructor({nodes, rooms, pods, energy, lastMove}) {
    this.pods = pods;
    this.nodes = nodes;
    this.rooms = rooms;
    this.energy = energy ?? 0;
    this.lastMove = lastMove;    
  }

  clone() {
    return new State({
      nodes: this.nodes,
      rooms: cloneDeep(this.rooms),
      pods: cloneDeep(this.pods),
      energy: this.energy,
      lastMove: this.lastMove
    });
  }

  get hash() {
    if (!this._hash) {
      this._hash = computeHash(this.pods);
    }
    return this._hash;
  }

  _getNextRoom(type) {
    const targetRooms = this.rooms.filter(x => x.type === type).sort((l, r) => r.depth - l.depth);
    const [first, second] = targetRooms;
    return !first.locked ? first 
      : !second.locked ? second
        : null;
  };

  complete() {
    for(let type of ['A', 'B', 'C', 'D']) {
      const nextRoom = this._getNextRoom(type);
      if (nextRoom) return false;
    }
    return true;
  }

  _isInNextRoom(pod) {
    log(pod);
    const room = this._getNextRoom(pod.type);
    return isSamePos(room, pod);
  }

  accept(move) {
    const clone = this.movePod(move.pod, move.target);
    clone.energy += move.distance * MOVE_ENGERY[move.pod.type];
    return clone;
  }

  movePod(pod, target) {

    if (this._isOccupied(target)) {
      throw new Error(`${target.x}, ${target.y} is occupied`);
    }

    const clone = this.clone();
    const clonnedPod = clone.pods.find(byPod(pod));
    const targetNode = clone.nodes.find(withSamePosAs(target));

    const nextRoom = clone._getNextRoom(pod.type);
    // if(pod.name === 'B1')
    //   log('_nextRoom', pod.name, nextRoom, targetNode.x, targetNode.y);
    clonnedPod.locked = isSamePos(nextRoom, targetNode);
    nextRoom.locked = clonnedPod.locked;
    clonnedPod.x = target.x;
    clonnedPod.y = target.y;
    // if(pod.name === 'B1')
    //   log('_nextRoom', clonnedPod.locked);
    clone.lastMove = pod.name;

    return clone;    
  }

  possibleMoves(d) {
    const possible = [];
    for(let pod of this.pods) {
      // d && log('possibleMoves', pod.name, pod.locked, pod.x, pod.y, this.lastMove);
      if (pod.locked) continue;
      if (this.lastMove && this.lastMove === pod.name) continue;
      const nextMoves = this._podPossibleNextMoves(pod, d)
        .map(m => ({pod, target: m.node, distance: m.distance}))
        .map(m => ({...m, cost: moveCost(m)}));
      d && log('possible', pod.name, nextMoves.length);
      possible.push(...nextMoves);
    }
    d && log('  ', possible.length);
    return possible.sort((l, r) => l.cost - r.cost);
    // return possible.sort((l, r) => {
    //   const targetRoomLeft = this._getNextRoom(l.pod.type);
    //   const targetRoomRight = this._getNextRoom(r.pod.type);

    //   const leftInRoom = isSamePos(l.target, targetRoomLeft);
    //   const rightInRoom = isSamePos(r.target, targetRoomRight);
    //   if (leftInRoom && rightInRoom) return 0;
    //   if (leftInRoom && !rightInRoom) return -1;
    //   if (!leftInRoom && rightInRoom) return 1;

    //   return l.distance - r.distance;
    // });
  }

  _isOccupied(pos) {
    return !!this.pods.find(withSamePosAs(pos));
  }

  _isValid(pod, target) {

    if (target.isOutsideDoor) return false;
    if (this._isOccupied(target)) return false;

    const room = this.rooms.find(withSamePosAs(target));
        
    if (room) {
      if (room.type !== pod.type) return false;
      if (room.depth === 1 && !this.rooms.find(x => x.type === pod.type && x.depth === 2).locked) return false;
    }
    return true;
  }

  _podPossibleNextMoves(pod, d) {
    d && log('_podPossibleNextMoves', pod.name, pod.x, pod.y, pod.locked);
    if (pod.locked) {
      // d && log('pod locked', pod.name);
      return [];
    }
    
    const startNode = this.nodes.find(n => isSamePos(pod, n));

    const stack = [[startNode, 0]];
    const visited = {[keyOf(pod)]: true};
    
    const possible = [];

    while(stack.length > 0) {
      const [target, distance] = stack.pop();
      
      // d && log('pod', pod.name, target.x, target.y, target.isOutsideDoor, this._isOccupied(target) );
      //!isSamePos(target, pod) && !target.isOutsideDoor && !this._isOccupied(target)
      if (this._isValid(pod, target)) {
        d && log(' ', target.x, target.y);
        possible.push({node: target, distance});
      }
      // d && log(' ', target.x, target.y);

      for(let n of target.neighbors) {
        const key = keyOf(n);
        if (key in visited) continue;
        visited[key] = true;
        
        if (this._isOccupied(n)) continue;

        // const room = this.rooms.find(withSamePosAs(n));
        
        // if (room) {
        //   if (room.type !== pod.type) continue;
        //   if (room.depth === 1 && !this.rooms.find(x => x.type === pod.type && x.depth === 2).locked) continue;
        // }

        stack.push([n, distance + 1]);
      }
    }

    const filtered =  possible.filter(p => {
      if (pod.y === 1) return p.node.y !== 1;
      return true;
    });
    d && log('  count', possible.length, filtered.length);
    return filtered;
  }

  // trying to focus on a single letter.
  // see what would be blocking moving the selected letters to the proper room.
  target(type) {

    const rooms = this.rooms.filter(x => x.type === type && !x.locked);
    const pods = this.pods.filter(p => p.type === type && !p.locked);
    if (pods.length === 0) return [];

    // log(rooms);

    return [];

  }
}

function distanceTravelled(l, r) {
  let dist = 0;
  if (l.y > 1) {
    dist += l.y - 1;
  }
  dist += Math.abs(l.x - r.x);
  if (r.y > 1) {
    dist += r.y - 1;
  }
  return dist;
}

/*

    */

export const parse = text => {
  const lines = text.split('\n').map(line => line.split(''));
  const grid = loadGrid(lines, ' ');
  
  const pods = [];
  const nodes = [];
  const rooms = [];

  for(let [pos, c] of grid.entries()) {
    if (c === ' ' || c === '#') continue;    

    const node = {
      x: pos.x,
      y: pos.y,
      isHallway: pos.y === 1,
      isOutsideDoor: [3,5,7,9].includes(pos.x) && pos.y === 1,
      neighbors: [],      
    };

    nodes.push(node);
    
    if (c === '.') continue;
    grid.set(pos.x, pos.y, '.');

    const depth = pos.y - 2;
    const roomType = pos.x === 3 ? 'A'
      : pos.x === 5 ? 'B'
        : pos.x === 7 ? 'C'
          : pos.x === 9 ? 'D'
            : null;
    
    node.locked = c === roomType && depth === 1;
    node.room = {type: roomType, x: pos.x, y: pos.y, depth: pos.y === 2 ? 1 : 2, locked: node.locked };
    node.pod = {
      type: c,
      id: ++NEXT_ID[c],
      name: `${c}${NEXT_ID[c]}`,
      x: pos.x,
      y: pos.y,
      locked:  node.locked,
    };

    rooms.push(node.room);
    pods.push(node.pod);
  }
  
  for(let n of nodes) {
    n.neighbors = nodes.filter(m => 
      (m.x === n.x && Math.abs(n.y - m.y) === 1) ||
      (m.y === n.y && Math.abs(n.x - m.x) === 1)
    );
  }

  return {
    grid,
    initialState: new State({nodes, rooms, pods})
  };
};

const BLOCKS = [
  {x: 1, y: 1}, // 0
  {x: 2, y: 1}, // 1

  {x: 3, y: 1}, // 2    A
  {x: 3, y: 2}, // 3
  {x: 3, y: 3}, 

  {x: 4, y: 1}, // 5
  
  {x: 5, y: 1}, // 6    B
  {x: 5, y: 2}, // 7
  {x: 5, y: 3}, // 8

  {x: 6, y: 1}, // 9
  
  {x: 7, y: 1}, // 10   C
  {x: 7, y: 2}, // 11
  {x: 7, y: 3}, // 12
  
  {x: 8, y: 1}, // 13

  {x: 9, y: 1}, // 14   D
  {x: 9, y: 2}, // 15
  {x: 9, y: 3}, // 16
  
  {x: 10, y: 1}, // 17
  {x: 11, y: 1}, // 18
  
];

export function part1(input) {
  const {initialState, grid} = input;

  const visualizeState = state => {
    return visualizeGrid(grid, (x, y) => {
      const p = state.pods.find(withSamePosAs({x,y}));
      if (p) return p.name;
      const s = grid.get(x, y);
      if (s === '#' || s === ' ')
        return '  ';
      return x % 2 === 0 ? '--' : '__';
    });
  };
  
  let state = initialState;
  log(visualizeState(state));
  log();

  const isSample = process.env.AOC_INPUT.endsWith('sample.txt');
  // // sample
  // const steps = isSample ? [
  //   ['B2', 5],
  //   ['C1', 11],
  //   ['D2', 9],
  //   ['B2', 8],
  //   ['B1', 7],
  //   ['D1', 13],
  //   ['A2', 17],
  //   ['D2', 16],
  //   ['D1', 15],
  //   ['A2', 3]
  // ] : 
  //   [
  //     ['D1', 13],
  //     ['A2', 17],      
  //     ['D1', 16],
  //     ['A1', 9],
  //     ['D2', 15],            
  //     ['A1', 1],
  //     ['B1', 5],
  //     ['C2', 12],
  //     ['B1', 8],
  //     ['C1', 11],
  //     ['B2', 7],
  //     ['A1', 4],
  //     ['A2', 3]
  //   ];
  // // 11322
  // // [
  // //   ['D1', 17],
  // //   ['A1', 0],
  // //   ['A2', 1],
  // //   ['D1', 16],
  // //   ['D2', 15],
  // //   ['C1', 12],
  // //   ['B1', 5],
  // //   ['C2', 11],
  // //   ['B1', 8],
  // //   ['B2', 7],
  // //   ['A2', 4],
  // //   ['A1', 3]
  // // ];

  // log(visualizeState(state));
  // log();
  // for(let [podName, index] of steps) {
  //   const target = BLOCKS[index];
  //   const pod = state.pods.find(byPod(podName));
  //   const distance = distanceTravelled(pod, target);
  //   log(pod.name, index, distance);    
  //   state = state.accept({pod, target, distance});
  //   log(state.hash);
  //   log(visualizeState(state));
  // }
  // log(state.energy);
  // log(state.complete());
  // log(state.pods.map(p => {
  //   return `${p.name}  ${p.x},${p.y}: ${p.locked}`;
  // }));
  // return state.energy;


  // ------------------------

  // state.

  // ------------------------


  const hashes = [
    '3,3|9,3|3,2|4,1|5,2|7,3|9,2|5,3',
    '3,3|9,3|3,2|4,1|7,2|7,3|9,2|5,3',
    '3,3|9,3|3,2|4,1|7,2|7,3|9,2|6,1'
  ];
  
  // const cache = {};

  const logMove = move => {
    const index = BLOCKS.findIndex(withSamePosAs(move.target));
    log(' ', move.pod.name, String(index).padStart(2), move.distance, move.cost);
  };

  const compute = state => {
    const stack = [[state, []]];
    let i  = 0;

    const cache = {};
    const completed = {};
    let s = Date.now();

    let best = Number.MAX_SAFE_INTEGER;

    while(stack.length > 0) {      
      i++;      
      
      const [state, seen] = stack.pop();

      let debug = hashes.includes(state.hash); //false; //i === 150000 || i === 150001;

      const moves = state.possibleMoves(debug).reverse();
      // log(i);
      // if (i % 3 === 0) {
      //   moves.forEach(m => logMove(m)); 
      // }
      // log(visualizeState(state));
      // if (i % 10000 === 0) {
      if( debug ) {
        log(i, 'moves', state.energy, state.hash);
        moves.forEach(m => logMove(m)); 

        log(visualizeState(state));
      }
      if (i % 10_000 === 0) {
        log(i, (i / (Date.now() - s)).toFixed(2),state.energy, best, stack.length);
      }

      if (!cache[state.hash] || cache[state.hash] < state.energy) {
        cache[state.hash] = state.energy;        
      }

      // if ((state.energy > cache[state.hash])) {
      //   // already seen this layout and the current one is worse
      //   continue;
      // }

      for(let move of moves) {
        const next = state.accept(move);

        // if (seen.includes(next.hash)) continue;      

        if (next.complete()) {
          if (next.energy < best) {
            log(i, 'complete', next.energy, best, next.hash);
            // log(visualizeState(next));
            completed[next.hash] =  next;
            best = next.energy;
            
          }
          
        } else  {
          stack.push([next, [...seen, next.hash]]);
        }
      }
      // if (i === 150000)
      //   break;
    }
    log(Object.values(completed).length);
    return Object.values(completed).sort((l, r) => l.energy - r.energy)[0]?.energy;
  };

  return compute(initialState);

}

export function part2(input) {

}    
