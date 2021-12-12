
import { log } from "../../utils";

export const parse = text => text.split('\n')
  .map(line =>{
    const [,start, end] = /(.+)-(.+)/.exec(line);
    return {start,end};
  } )
  .reduce((nodes, edge) => {
    const node = nodes[edge.start] || (nodes[edge.start] = {name: edge.start, connected: []});
    const target = nodes[edge.end] || (nodes[edge.end] = {name: edge.end, connected: []});
    if (node.name !== 'start') {
      target.connected.push(node);
    }
    if (target.name !== 'start') {
      node.connected.push(target);
    }

    return nodes;
  }, {});

export function part1(network) {
  
  const paths = [];
  const stack = [];
  
  stack.push([network.start, [network.start], {}]);
  while(stack.length > 0) {
    const [node, path, visited] = stack.pop();
    
    for(let target of node.connected) {
      if (target.name === 'end') {
        paths.push([...path, target]);
        continue;
      }      
      if(isLargeCave(target.name) || (isSmallCave(target.name) && !visited[target.name])) {
        stack.push([target, [...path, target], {...visited, [target.name]: true}]);
      }
    }
  }
  log(paths.map(p => p.map(q => q.name).join(' -> ')).join('\n'));
  return paths.length;
}

function isLargeCave(name) {
  return name === name.toUpperCase();
}
function isSmallCave(name) {
  return name === name.toLowerCase();
}

export function part2(network) {

  const paths = [];
  const stack = [];
  
  const canVisit = (visited, name) => {
    if(Object.values(visited).some(x => x > 1)) {
      return !visited[name];
    }
    
    return (visited[name] ?? 0) < 2;
  };

  stack.push([network.start, [network.start], {}]);
  while(stack.length > 0) {
    const [node, path, visited] = stack.pop();
    
    for(let target of node.connected) {
      if (target.name === 'end') {
        paths.push([...path, target]);
        continue;
      }      
      if(isLargeCave(target.name)) {
        stack.push([target, [...path, target], {...visited}]);
      } else if ((isSmallCave(target.name) && canVisit(visited, target.name))) {
        stack.push([target, [...path, target], {...visited, [target.name]: (visited[target.name] ?? 0) + 1}]);
      }
    }
  }
  log(paths.map(p => p.map(q => q.name).join(' -> ')).join('\n'));
  
  return paths.length;
}    
