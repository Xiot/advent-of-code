
import { autoParse, log } from "../../utils";

export const parse = autoParse();

export function part1(input) {  
  const scores = input.map(([them, you]) =>  scoreOf(them, you));  
  log('scores', scores);
  return scores.reduce((sum, v) => sum + v, 0);
}

const scoreOf = (them, you) => {
  const r = result(them, you);
  const yourScore = valueOf(you);
  
  return yourScore + resultScore(r);

};

const valueOf = (item) => {
  switch(item) {
  case 'X': return 1;
  case 'Y': return 2;
  case 'Z': return 3;
  }
  throw new Error(`valueOf: ${item}`);
};

const resultScore = (result) => {
  if (result === 0) return 3;
  if (result === 1) return 6;
  return 0;
};

const result = (them, you) => {
  if (isEqual(them, you)) return 0;
  switch(them) {
  case 'A': return you === 'Y' ? 1 : -1;
  case 'B': return you === 'Z' ? 1 : -1;
  case 'C': return you === 'X' ? 1 : -1;    
  }
  throw new Error('result');
};

const isEqual = (them, you) => {
  switch(them) {
  case 'A': return you === 'X';
  case 'B': return you === 'Y';
  case 'C': return you === 'Z';
  }
  return false;
};

export function part2(input) {
  const scores = input.map(([them, target]) => {
    const you = getTarget(them, target);
    return scoreOf(them, you);

  });  


  log('scores', scores);
  return scores.reduce((sum, v) => sum + v, 0);
}

function getTarget (them, target) {
  if (target === 'X') {
    // need to lose
    switch(them) {
    case 'A': return 'Z';
    case 'B': return 'X';
    case 'C': return 'Y';
    }
    throw new Error('boom');
  } else if(target === 'Y') {
    // need to tie'
    switch(them) {
    case 'A': return 'X';
    case 'B': return 'Y';
    case 'C': return 'Z';
    }
  } else if(target === 'Z') {
    // need to tie'
    switch(them) {
    case 'A': return 'Y';
    case 'B': return 'Z';
    case 'C': return 'X';
    }
  }
  throw new Error(`getTarget: ${them}, ${target}`);
}
    
