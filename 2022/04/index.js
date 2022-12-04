
import { byLine } from "../../utils";

export const parse = byLine(line => line.split(',').map(p => p.split('-').map(n => parseInt(n))));

export function part1(input) {  
  const overlaps = input    
    .filter(assignments => contains(assignments[0], assignments[1]));  
  return overlaps.length;
}

export function part2(input) {
  const overlaps = input    
    .filter(assignments => hasOverlap(assignments[0], assignments[1]));    
  return overlaps.length;
}    

function contains(left, right) {
  const [l, r] = [left, right].sort((l,r) => {
    const byF = l[0] - r[0];
    if (byF !== 0) return byF;
    return r[1] - l[1];

  });
  return l[0] <= r[0] && r[1] <= l[1];
}

function hasOverlap(left, right) {
  const [l, r] = [left, right].sort((l,r) => {
    const byF = l[0] - r[0];
    if (byF !== 0) return byF;
    return r[1] - l[1];

  });
  return r[0] <= l[1] ;  
}