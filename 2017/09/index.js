
import { autoParse, log, sumOf } from "../../utils";

export const parse = text => text;

const MATCH_ESCAPE_RE = /!./g;

export function part1(input) {
  // log('input', input);

  const parser = createParser(input);
  
  let score = 0;
  for(let group of parser.next()) {
    // log({...group,});
    // log(group.index, group.length, group.depth);
    log(group.depth, group.index, input.slice(group.index,group.end + 1));
    score += group.depth;
    
  }
  return score;
}

export function part2(input) {

  const cleanText = text => text.replace(MATCH_ESCAPE_RE, '');

  input = cleanText(input);
  // log(clean(input).slice(0,20));
  // log('input', input);

  const parser = createParser(input);
  
  let score = 0;
  for(let group of parser.next()) {
  // log({...group,});
  // log(group.index, group.length, group.depth);
    log(group.depth, group.index, input.slice(group.index,group.end + 1));
    score += group.garbage;
  
  }
  return score;
}    


function createParser(text) {
  
  let root = {
    index: 0,
    groups: [],
    garbage: 0,    
    parent: null,
    depth: 1,
    score: 0,
  };
  let current = root;

  function* next() {

    let garbage = false;
    let escapped = false;

    for(let i = 1; i < text.length; i++) {
      const char = text[i];

      if (escapped) {
        escapped = false;
        continue;
      }

      if (char === '!') {
        escapped = true;
        continue;
      }
      if (garbage) {
        if (char === '>') {
          garbage = false;
        } else {
          current.garbage++;
        }
        continue;
      }

      if (char === '<') {
        if (garbage) continue;
        garbage = true;

      } else if (char === '{') {
        const group = {
          index: i,
          groups: [],
          parent: current,
          garbage: 0,
          depth: current.depth + 1,          
        };
        current.groups.push(group);
        current = group;
     
      } else if (char === '}') {
        current.length = i - current.index + 1;
        current.end = i;

        current.score = sumOf(current.groups, x => x.score);

        yield current;
        current = current.parent;        
      }      
    }    
  }

  return {
    next,
    get root() {return root;}
  };
}