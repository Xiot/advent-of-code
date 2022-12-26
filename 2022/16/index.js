
import { autoParse, log, byLine, aStar, sumOf } from "../../utils";

const LINE_RE = /Valve ([a-z]+) has flow rate=(\d+); tunnels? leads? to valves? (.+)/i;
export const parse = byLine(line => {
  const [,valve, rate, tunnels] = LINE_RE.exec(line);
  return {
    name: valve,
    rate: parseInt(rate),
    edges: tunnels.split(', ')
  };
});


/*
  state: {room, pressure, time}
*/

// Not working
export function part3(input) {

  const MAX_TIME = 30;

  const lookup = input.reduce((acc, cur) => ({...acc, [cur.name]: cur}), {});
  
  const valves = input.filter(x => x.rate > 0);

  const w = aStar(
    n => `${n.time}|${n.pressure}|${Object.keys(n.open).sort().join(',')}`,
    {time: 0, room: 'AA', pressure: 0, open: {}},
    n => {
      const atEnd = n.time >= MAX_TIME || (Object.keys(n.open).length === valves.length);      
      return atEnd;
    },
    n => {
      const room = n.room;
      const item = lookup[n.room];
      
      return [
        !n.open[room] && item.rate > 0 ? {
          time: n.time + 1, 
          room: n.room, 
          pressure: n.pressure += item.rate * (MAX_TIME - (n.time + 1)),
          open: {
            ...n.open,
            [n.room]: true
          }
        } : undefined,
        ...(valves
          .filter(edge => !n.open[edge.name] && edge.name !== n.name)
          .map(edge => {
            const distance = distanceBetween(lookup, n.room, edge.name);            
            const arriveTime = n.time + distance;
            const remainingTime = MAX_TIME - arriveTime - 1;
            
            if (arriveTime + 1 > MAX_TIME ) return undefined;
            return {
              time: arriveTime + 1,
              room: edge.name,
              pressure: n.pressure + edge.rate * remainingTime,
              open: {...n.open, [edge.name]: true}
            };
          }))
      ].filter(x => x);
    },
    () => 1,
    n => {
      let potentialPressure = 0;
      const openList = Object.keys(n.open);
      // log(openList);
      const closed = valves.filter(v => !openList.includes(v.name));
      potentialPressure = sumOf(closed, n => n.rate * (MAX_TIME - n.time));
      return potentialPressure - n.pressure;
    },
    {mode: 'min'}
  );
  if (!w) return 'none';
  log(w);
  return w.node.pressure;
}

export function part1(input) {
  const rooms = build(input);

  let results = explore(rooms);
  if (!Array.isArray(results)) results = [results];
  
  results.sort((l, r) => {
    return r.pressure - l.pressure;
  });

  log(results[0]);
  log('done', results.length);

  return results[0].pressure;
}

function testCalculate(rooms) {
  const s = calculate({
    history: [
      {task: 'open', room: 'DD', time: 2},
      {task: 'open', room: 'BB', time: 5},
      {task: 'open', room: 'JJ', time: 9},
      {task: 'open', room: 'HH', time: 17},
      {task: 'open', room: 'EE', time: 21},
      {task: 'open', room: 'CC', time: 24}
    ]
  }, rooms);
  console(`expected: 1651. actual: ${s}`);
}

function calculate(state, rooms, maxTime = 30) {
  let pressure = 0;
  for (let item of state.history) {
    
    const room = rooms[item.room];
    if (item.task === 'open') {
      pressure += (maxTime - item.time) * room.rate;
    }
  }
  return pressure;
}

function distanceBetween(rooms, from, to) {

  if (from === to) return 0;

  const queue = [{room: from, distance: 0}];
  const visited = {};
  while(queue.length > 0) {
    const loc = queue.shift();
    const room = rooms[loc.room];
    if (room == null) {
      log('d.nf', room, loc.room);
    }

    if (loc.room === to) return loc.distance;

    for(let e of room.edges) {
      if (visited[e]) continue;
      visited[e] = true;
      queue.push({room: e, distance: loc.distance + 1});
    }
  }
  throw new Error('path not found');
}

function explore(rooms, TOTAL_TIME = 30, exclude = []) {
  
  const queue = [{loc: 'AA', history: [], open: {}, time: 0, pressure: 0}];

  const roomsList = Object.values(rooms);
  const dCache = {};
  function getDistances(from) {
    if (dCache[from]) return dCache[from];
    
    const distances = roomsList.reduce((acc, cur) => {
      return {
        ...acc,
        [cur.name]: distanceBetween(rooms, from, cur.name)
      };
    }, {});
    dCache[from] = distances;
    return distances;
  }


  let max = null;

  while(queue.length > 0) {
    const state = queue.pop();

    const distances = getDistances(state.loc);

    const remaining = roomsList
      .filter(r => !exclude.includes(r.name))
      .filter(r => !state.open[r.name] && r.rate > 0)
      .map(r => {
        return {
          name: r.name,
          distance: distances[r.name],
          time: state.time + 1 + distances[r.name]
        };
      }).filter(r => {
        return r.time < TOTAL_TIME;
      }).sort((l, r) => {
        const pL = (TOTAL_TIME - l.time ) * rooms[l.name].rate;
        const pR = (TOTAL_TIME - r.time) * rooms[r.name].rate;
        return pL - pR;
      });

    if (remaining.length === 0) {

      if (max == null || state.pressure > max.pressure) {
        max = state;
      }

      continue;
    }
    
    for(let o of remaining) {
      queue.push({
        loc: o.name,
        time: o.time,        
        pressure: state.pressure + (TOTAL_TIME - o.time) * rooms[o.name].rate,
        open: {...state.open, [o.name]: true}
      });
      
    }
  }  
  return max;
}


export function part2(input) {

  const rooms = build(input);
  const r = explore(rooms, 26);

  const used = Object.keys(r.open);    
  const r2 = explore(rooms, 26, used);  

  return r.pressure + r2.pressure;
  
}    

function build(rooms) {

  const handles = rooms.reduce((acc, r) => {
    return {...acc, [r.name]: r};
  }, {});

  for(let r of rooms) {
    const node = handles[r.name] ?? {name: r.name, rate: r.rate};
    if (handles[r.name] == null) {
      handles[r.name] = node;
    }

    node.rooms = r.edges.map(x => handles[x]);
  }

  return handles;
}

function explore2(rooms) {

  const TOTAL_TIME = 26;

  const results = [];
  // const queue = [{loc: 'AA', history: [], open: {}, time: 0}];
  const queue = [{
    history: [],
    open: {},
    pressure: 0,
    // time: 0,
    me: {
      name: 'me',
      loc: 'AA',
      time: 0
    }, 
    ele: {
      name: 'ele',
      loc: 'AA',
      time: 0
    }
  }];

  const roomsList = Object.values(rooms);
  const dCache = {};
  function getDistances(from) {
    if (dCache[from]) return dCache[from];
    
    const distances = roomsList.reduce((acc, cur) => {
      return {
        ...acc,
        [cur.name]: distanceBetween(rooms, from, cur.name)
      };
    }, {});
    dCache[from] = distances;
    return distances;
  }

  let max = null;

  // const valueCache = {};

  // function getCacheKey(item) {

  // }

  // function addToCache(item) {

  // }

  while(queue.length > 0) {
    const state = queue.pop();

    const move = state.me.time < state.ele.time ? state.me : state.ele;

    const distances = getDistances(move.loc);

    const remaining = roomsList
      .filter(r => !state.open[r.name] && r.rate > 0)
      .map(r => {
        return {
          name: r.name,
          distance: distances[r.name],
          time: move.time + 1 + distances[r.name]
        };
      }).filter(r => {
        return r.time < TOTAL_TIME;
      }).sort((l, r) => {
        const pL = (TOTAL_TIME - l.time ) * rooms[l.name].rate;
        const pR = (TOTAL_TIME - r.time) * rooms[r.name].rate;
        return pL - pR;
      });

    if (remaining.length === 0) {
      if (max == null || state.pressure > max.pressure) {
        max = state;
      }

      continue;
    }
    
    for(let o of remaining) {
      queue.push({       
        ...state,
        // history: [...state.history, {task: 'open', room: o.name, time: o.time, user: move.name}],
        pressure: state.pressure + (TOTAL_TIME - o.time) * rooms[o.name].rate,
        open: {...state.open, [o.name]: true},
        [move.name]: {
          name: move.name,
          loc: o.name,
          time: o.time,
        }
      });
      
    }
  }
  // return results;
  return max;
}