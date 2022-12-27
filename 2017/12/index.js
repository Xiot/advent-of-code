
import { autoParse, log, byLine } from "../../utils";

export const parse = byLine(line => {
  const [id, edgeText] = line.split(' <-> ');
  return {
    id: parseInt(id), 
    edges: edgeText.split(', ').map(x => parseInt(x))
  };
});

export function part1(input) {
  
  const lookup = input.reduce((acc, cur) => ({...acc, [cur.id]: cur}), {});

  const group = getGroup(lookup, 0);

  return group.size;
}

export function part2(input) {
  const lookup = input.reduce((acc, cur) => ({...acc, [cur.id]: cur}), {});

  const visited = new Map();
  let groupCount = 0;
  for(let p of input) {
    if (visited.has(p.id)) continue;

    log(p.id);
    const g = getGroup(lookup, p.id);
    for(let k of g.keys()) {
      visited.set(k, true);
    }

    groupCount++;
  }
  return groupCount;
}    

function getGroup(lookup, id) {
  

  const queue = [lookup[id]];
  const visited = new Map();  

  while(queue.length > 0) {
    const item = queue.shift();
    visited.set(item.id, true);

    item.edges.forEach(edge => {
      if (visited.get(edge)) return;
      queue.push(lookup[edge]);
    });
  }  
  return visited;
}