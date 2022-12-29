
import { autoParse, log } from "../../utils";

export const parse = text => {
  const par = text.split('\n\n');
  const steps = parseInt(/(\d+)/.exec(par[0])[1]);

  // log(par.slice(1));

  return {
    steps,
    states: par.slice(1).map(parseDescription).reduce((acc, cur) => ({...acc, [cur.state]: cur}), {})
  };

};

const DESCRIPTION_RE = /state ([A-Z]).+?Write the value (\d+).+?slot to the (\w+).+?state ([A-Z]).+?Write the value (\d+).+?slot to the (\w+).+?state ([A-Z])/s;
function parseDescription(text) {
  
  const match = DESCRIPTION_RE.exec(text);
  const [,state, value0,move0,continue0, value1, move1, continue1] = match;
  return {
    state,
    conditions: [
      {write: parseInt(value0), move: move0, continue: continue0},
      {write: parseInt(value1), move: move1, continue: continue1}
    ]
  };

}

export function part1(input) {
  
  const tape = new Map();

  let pos = 0;
  let state = input.states.A;  

  for(let s = 0; s < input.steps; s++) {
    const value = tape.get(pos) ?? 0;
    const op = state.conditions[value];
    tape.set(pos, op.write);
    state = input.states[op.continue];
    pos += op.move === 'left' ? 1 : -1;
  }

  const checksum = Array.from(tape.values()).filter(x => x === 1).length;
  return checksum;

}

export function part2(input) {

}    
