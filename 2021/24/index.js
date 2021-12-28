
import { autoParse, byLine, log } from "../../utils";

export const parse1 = byLine(line => {
  const [op, register, value] = line.split(' ');
  return {
    op,
    register,
    value: value == null ? null
      : isNaN(value) ? value 
        : parseInt(value),
  };
});
export function parseSections(text) {
  return text.split('inp w\n').slice(1).map(chunk => {
    return chunk.split('\n').map(line => {
      const [op, register, value] = line.split(' ');
      return {
        op,
        register,
        value: value == null ? null
          : isNaN(value) ? value 
            : parseInt(value),
      };
    });
  });
}

const reducer = (state, action) => {
  switch(action.op) {
  case 'inp': {
    const value = parseInt(state.model[state.index]);
    // log('inp', value, formatRegisters(state));
    state[action.register] = state[action.register] + value,
    state.index += 1;
    return state;
  }
  case 'add': {
    // log('valueOf', action.value, state.valueOf(action.value), formatRegisters(state));
    state[action.register] = state[action.register] + state.valueOf(action.value);
    return state;    
  }
  case 'mul': {
    state[action.register] = state[action.register] * state.valueOf(action.value);
    return state;    
  }
  case 'div': {
    state[action.register] = Math.floor(state[action.register] / state.valueOf(action.value));
    return state;    
  }
  case 'mod': {
    state[action.register] = state[action.register] % state.valueOf(action.value);
    return state;    
  }
  case 'eql': {
    state[action.register] = state[action.register] === state.valueOf(action.value) ? 1 : 0;
    return state;    
  }
  }
  return state;
};

function createSectionReducer(section, index) {

  const cache = {};
  
  return (state) => {
    const digit = parseInt(state.model[index]);

    const key = `${digit},${state.z}`;

    if (cache[key]) {
      return {...cache[key]};
    }

    state = {...state, w: digit};
    for(let ins of section) {
      // log('bef',' ', '    ', formatRegisters(state));
      state = reducer(state, ins);
      // log(ins.op, ins.register, String(ins.value).padStart(4), formatRegisters(state));
    }
    cache[key] = {...state};
    return state;
  };
}

function createSectionReducer2(section) {

  return (state) => {
    for(let ins of section) {
      // log('bef',' ', '    ', formatRegisters(state));
      state = reducer(state, ins);
      // log(ins.op, ins.register, String(ins.value).padStart(4), formatRegisters(state));
    }

    return state;
  };
}


function formatRegisters(state) {
  return [state.w, state.x, state.y, state.z].map(v => {
    const t = typeof v;
    return String(v).padStart(5) + t[0];
  }).join('');
}

function createSectionProcessor(sections) {
  
  const reducers = sections.map((s, i) => createSectionReducer(s, i));
  
  return (model, override) => {
    let state = createState(model);
    if (override) {
      state = {...state, ...override};
    }
    log.push('model', model);
    let i = 0;
    for(let reducer of reducers) {
      i++;
      log.push('section', i, formatRegisters(state));
      state = reducer(state);
      log.pop('after    ', formatRegisters(state));
    }
    log.pop();
    return state;
  };
}

const cache = {};
const keyOf = (id, target) => `${id}|${target}`;

function findZ(section, targetZ) {

  const key = keyOf(section.id, targetZ);
  if (key in cache) {
    return cache[key];
  }

  const reducer = createSectionReducer2(section);
  // const zeros = [];

  const zeros = [];
  for(let m of generate(1)) {
    for (let z = 100; z >=-100; z--) {
      let state = createState(m, {z, w: parseInt(m)});
      // log(m, z, formatRegisters(state), targetZ, state.z === targetZ);
      state = reducer(state);      
      // log(m, z, formatRegisters(state), targetZ, state.z === targetZ);
      if (state.z === targetZ) {
        zeros.push({w: parseInt(m), z});
        // log('\n\nFOUND\n\n', m, z);
        // yield {w: parseInt(m), z};
      }
    }
  }
  cache[key] = zeros;
  return zeros;
}

function* findZr(sections, targetZ = 0) {
  // log('zr', targetZ);
  if (sections.length === 0) return '';
  const [current, ...rest] = sections;

  for(let targets of findZ(current, targetZ)) {
      
    if (sections.length === 1) {
      yield String(targets.w);
    } else {
      for(let other of findZr(rest, targets.z)) {
        yield String(targets.w) + other;
      }
    }
  }
  
}

function * findComplete(sections) {
  const [first, ...reducers] = [...sections].reverse();
  log(first);
  let zeros = findZ(first, 0);
  log(zeros);

  for(let q of zeros) {

  }

  yield null;
}

function modelValidator(sections) {
  const [first, ...reducers] = [...sections].reverse().map((s,i) => {s.id = i; return s;}); //.map((s, i) => createSectionReducer(s, i)).reverse();
  log(first);
  let zeros = findZ(first, 0);
  log(zeros);
  
  for(let reducer of reducers) {

  }

}

export function part3(input) {
  // const sections = parseSections(input);
  // const cpu = createSectionProcessor(sections);
  
  // for(let model of generate(1)) {
  //   const state = cpu(model, {z: 68});
  //   log('root', model, state.z);
  // }

  const sections = parseSections(input)
    .reverse()
    .map((s,i) => {s.id = i; return s;})
    ;
  log('length', sections.length);
  // const take = sections.slice(0, 3);

  const it = findZr(sections.slice(-1), 20);
  for(let n of it) {
    log(n);
  }
  return 0;
  // const first = it.next();
  // log(first);
  // log(cache);
  // return first?.value;

  // for(let r of findZr(sections)) {
  //   // if (r.length === sections.length) {
  //   log('results', r);
  //   // }
  // }

  // const zeros = modelValidator(sections);
  // log(zeros);
  // const si = sections.length - 1;
  // const test = createSectionReducer(sections[si], 0);

  // const zeros = [];
  // for(let m of generate(1)) {
  //   for (let z = 1000; z >=-1000; z--) {
  //     let state = createState(m, {z});
  //     state = test(state);
  //     if (state.z === 0) {
  //       zeros.push({w: m, z});
  //     }
  //   }
  // }
  // log(zeros);

  // let c = 0;
  // let s = Date.now();
  // for(let model of generate(14)) {
  //   c++;
  //   if (c % 10_000 === 0) {
  //     log(c, model, (c / (Date.now() - s ) ).toFixed(2) );
  //   }
  //   // let state = createState(model);
  //   const state = cpu(model);
  //   if (state.z === 0) return model;
  // }

}

export function part1(input) {
  // log('input', input);
  // const d = generate(1);
  // log(d);

  let c = 0;
  let s = Date.now();
  for(let model of generate(14)) {
    c++;
    if (c % 10_000 === 0) {
      log(c, model, (c / (Date.now() - s ) ).toFixed(2) );
    }
    let state = createState(model);

    for(let ins of input) {
      state = reducer(state, ins);
    }
    // log(nums, state.w, state.x, state.y, state.z);
    if (state.z === 0) return state.model;
  }
}

export function part2(input) {

}    

function createState(model, override = {}) {
  return {
    model,
    index: 0,
    w: 0,
    x: 0,
    y: 0,
    z: 0,
    ...override,
    valueOf(id) {      
      if (id == null) {
        return null;
      }
      if (typeof id === 'number') {
        return id;
      }
      const v = this[id];
      if (typeof v !== 'number') {
        log('ERROR', id, v, this);
        throw new Error('not a number');
      }
      return v;
    }
  };
}

function* generate(length) {
  if (length === 0) return yield '';
  for(let i = 9; i >= 1; i--) {
    for(let rest of generate(length - 1)) {
      yield String(i) + rest;
    }
  }
}