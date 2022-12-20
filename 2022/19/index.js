
import { autoParse, log, byLine } from "../../utils";
import _ from 'lodash';

const NUMBERS_RE = /(\d+)/g;

export const parse = byLine(line => {
  
  const m = Array.from(line.matchAll(NUMBERS_RE)).map(x => parseInt(x));

  const raw = {
    id: m[0],
    robots: {
      ore: {
        ore: m[1]
      },
      clay: {
        ore: m[2],
      },
      obsidian: {
        ore: m[3],
        clay: m[4]
      },
      geode: {
        ore: m[5],
        obsidian: m[6]
      }
    },
    // total: {
    //   ore: {ore: m[1]},
    //   clay: {},
    //   obsidian: {},
    //   geode: {},
    // }
  };

  // function calcTotal(type) {
  //   let m = raw.total[type];
  //   for(let [key, value] of Object.entries(raw.robots[type])) {
  //     for(let [tk, tv] of Object.entries(raw.total[key])) {
  //       // log('set', {...raw.total}, type, key, tk, value, tv);
  //       if (key === 'ore') {
  //         m[tk] = (m[tk] ?? 0) + raw.robots[type].ore;
  //       } else {
  //         m[tk] = (m[tk] ?? 0) + value * raw.total[key][tk];
  //       }
        
  //     }
  //     // m[key] = (m[key] ?? 0) + raw.total[key]
  //   }
  //   log(type, {...raw.total});

  // }
  
  // calcTotal('clay');
  // calcTotal('obsidian');
  // calcTotal('geode');
  // log('');
  return raw;

});

export function part1(input) {
  // log('input', input);

  const bp = input[1];
  // log(bp);
  // testRun(bp);

  const results = calculate2(bp);
  // log(results);
  return results.geodes;  
}

function test2(bp) {
  // let state = createState();
  // for(let i = 0; i < 24; i++) {
  //   state = 
  // }
}

function testRun(bp) {
  let state = createState();
  state = stuff(state, s => s.advance());
  state = stuff(state, s => s.advance());
  state = stuff(state, s => s.build(bp, 'clay').advance());
  state = stuff(state, s => s.advance());
  state = stuff(state, s => s.build(bp, 'clay').advance());
  state = stuff(state, s => s.advance());
  state = stuff(state, s => s.build(bp, 'clay').advance());
  state = stuff(state, s => s.advance());
  state = stuff(state, s => s.advance());
  state = stuff(state, s => s.advance());

  state = stuff(state, s => s.build(bp, 'obsidian').advance());
  state = stuff(state, s => s.build(bp, 'clay').advance());
  state = stuff(state, s => s.advance());
  state = stuff(state, s => s.advance());
  state = stuff(state, s => s.build(bp, 'obsidian').advance());
  state = stuff(state, s => s.advance());
  state = stuff(state, s => s.advance());
  state = stuff(state, s => s.build(bp, 'geode').advance());
  state = stuff(state, s => s.advance());
  state = stuff(state, s => s.advance());

  state = stuff(state, s => s.build(bp, 'geode').advance());
  state = stuff(state, s => s.advance());
  state = stuff(state, s => s.advance());
  state = stuff(state, s => s.advance());

  log('total', state.geodes);
}

function stuff(state, fn) {
  state = state.collect();
  state = fn(state);
  log(String(state.time).padStart(2), state.geodes, state.key);
  return state;
}

function calculate2(bp) {

  const state = createState({robots: {
    ore: 1,
    clay: 0,
    obsidian: 0,
    geode: 0,
  }, 
  storage: {
    ore: 0,
    clay: 0,
    obsidian: 0,
    geode: 0
  }
  });
  // log(state.toString());
  const cache = new Map();
  cache.set('max', -1);
  return recurse(bp, state, cache);
}

function buildIfAble(bp, state, cache, type) {
  if (!canBuild(bp, type, state)) return undefined; 
  state = state.collect();
  state = state.build(bp, type).advance();
  state = recurse(bp, state, cache);
  // cache.set(state.key, geodes.storage.ore);
  return state;
}

function recurse(bp, state, cache) {
  const MAX_TIME = 24;
  
  // if (cache.has(state.key)) {
  //   const geodes = cache.get(state.key);    
  //   // log('cache.hit', geodes, state.key);
  //   return geodes;
  // }  

  
  log(state.toString());

  if (state.time === MAX_TIME) {
    // if (state.geodes > 0) {
    if (cache.get('max') < state.geodes) {
      cache.set('max', state.geodes);
      log('max.time', cache.get('max'), state.geodes, state.key);
    }      
    // }
    return state;
  }
  // state = state.collect();

  const currentMax = cache.get('max');
  
  const results = [];

  if (canBuild(bp, 'geode', state)) {
    // log('build geode', state.toString());
    state = state.collect();
    state = state.build(bp, 'geode').advance();
    const value = recurse(bp, state, cache);    
    // cache.set(state.key, value);    
    return value;
  }

  if (canBuild(bp, 'obsidian', state)) {
    results.push(buildIfAble(bp, state, cache, 'obsidian'));
    results.push(recurse(bp, state.collect().advance(), cache));
  } else if(canBuild(bp, 'clay', state) && state.storage.clay < bp.robots.obsidian.clay) {
    results.push(buildIfAble(bp, state, cache, 'clay'));
    results.push(recurse(bp, state.collect().advance(), cache));
  
  } else if(canBuild(bp, 'ore', state)) {
    results.push(buildIfAble(bp, state, cache, 'ore'));
    results.push(recurse(bp, state.collect().advance(), cache));
  } else {
    results.push( recurse(bp, state.collect().advance(), cache));
  }

  // for(let [reqType, reqAmount] of Object.entries(bp.robots.geode)) {
  // if (state.storage.ore < bp.robots.geode.ore) {
  //   results.push(buildIfAble(bp, state, cache, 'ore'));
  // }
  // if (state.storage.obsidian < bp.robots.geode.obsidian) {
  //   // log('should build obsidian');
  //   if (canBuild(bp, 'obsidian', state)) {
  //     results.push(buildIfAble(bp, state, cache, 'obsidian'));
  //   } else {
  //     if (state.storage.clay < bp.robots.obsidian.clay) {
  //       // log('should build clay');
  //       if (canBuild(bp, 'clay', state)) {
  //         // log('build clay');
  //         results.push(buildIfAble(bp, state, cache, 'clay'));
  //       }
  //     }
  //   }
  // }
  // results.push(buildIfAble(bp, state, cache, 'ore'));
  
  

  // return results.filter(x => x !== null).sort((l, r) => r - l)[0];
  // log(results);

  return results.sort((l, r) => r.storage.geode - l.storage.geode)[0];
}

function calculate(bp) {
  
  const results = [];
  const MAX_TIME = 24;

  const queue = [createState()];
  while(queue.length > 0) {
    let state = queue.pop();
    log(state.time);
    if (state.time === MAX_TIME) {
      log('MAX_TIME', state.storage.geode);
      results.push(state);
      continue;
    }

    state = state.collect();    

    // if (canBuild(bp, 'ore', state)) {
    //   queue.push(state.build(bp, 'ore').advance());
    // } else {
    //   queue.push(state.advance());
    // }

    queue.push(state.advance());

    if (canBuild(bp, 'ore', state)) {
      queue.push(state.build(bp, 'ore').advance());
    } 
    if (canBuild(bp, 'clay', state)) {
      queue.push(state.build(bp, 'clay').advance());
    }
    if (canBuild(bp, 'obsidian', state)) {
      queue.push(state.build(bp, 'obsidian').advance());
    }
    if (canBuild(bp, 'geode', state)) {
      queue.push(state.build(bp, 'geode').advance());
    }
  }
  return results;
}

export function part2(input) {

}    

function canBuild(bp, type, state) {
  const mats = bp.robots[type];
  for(let [key, value] of Object.entries(mats)) {
    if (state.storage[key] < value) return false;
  }
  return true;
}

function createState(initial) {
  const storage = Object.freeze(initial?.storage == null ? {
    ore: 0,
    clay: 0,
    obsidian: 0,
    geode: 0
  } : {...initial.storage});

  const robots = Object.freeze(initial?.robots == null ? {
    ore: 1,
    clay: 0,
    obsidian: 0,
    geode: 0,
  } : {...initial.robots});

  const time = initial?.time == null ? 0 : initial.time;

  const state = {storage, robots, time};

  function collect() {
    const clonedState = _.cloneDeep(state);
    function inc(resource, diff) {
      const current = _.get(clonedState, ['storage', resource]);
      _.set(clonedState, ['storage', resource], current + diff);
    }

    for(let [key, value] of Object.entries(clonedState.robots)) {
      inc(key, value);
    }
    return createState(clonedState);
  }

  function build(bp, robot) {
    // log('build', robot);
    const clonedState = _.cloneDeep(state);
    function dec(resource, diff) {
      const current = _.get(clonedState, ['storage', resource]);
      _.set(clonedState, ['storage', resource], current - diff);
    }

    const mats = bp.robots[robot];    

    for(let [key, value] of Object.entries(mats)) {
      dec(key, value);
    }
    const current = _.get(clonedState, ['robots', robot]);
    _.set(clonedState, ['robots', robot], current +1);
    return createState(clonedState);
  }

  function advance() {
    const clonedState = _.cloneDeep(state);
    clonedState.time += 1;

    // function inc(resource, diff) {
    //   const current = _.get(clonedState, ['storage', resource]);
    //   _.set(clonedState, ['storage', resource], current + diff);
    // }

    // for(let [key, value] of Object.entries(clonedState.robots)) {
    //   inc(key, value);
    // }
    return createState(clonedState);
  }

  return {
    get key() {
      return [time, '--', storage.ore, storage.clay, storage.obsidian, storage.geode, '--', robots.ore, robots.clay, robots.obsidian, robots.geode].map(x => String(x).padStart(2)).join('|');
    },
    get geodes() {
      return storage.geode;
    },

    // append,
    build,
    collect,
    advance,
    storage,
    robots,
    get time() {return time;},
    toJSON() {return {time, storage, robots};},
    toString() {
      return `${f(time)} ${f(storage.geode)} ${this.key}`;
    }
    // get storage() {return storage;},
    // get machines() {return machines;}
  };
}
function f(v) {
  return String(v).padStart(2);
}