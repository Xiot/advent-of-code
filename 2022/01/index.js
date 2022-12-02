
import { autoParse, log } from "../../utils";

export const parse = data => data.split('\n\n').map(x => x.split('\n').map(y => parseInt(y))); //autoParse();

const sumOf = data => data.reduce((sum, value) => sum + value, 0);

export function part1(input) {  
  const totals = input.map(x => sumOf(x)).sort((l, r) => r - l)[0];  
  return totals;

}

export function part2(input) {
  const totals = input.map(x => sumOf(x)).sort((l, r) => r - l).filter((_,i) => i <= 2);
  return sumOf(totals);
}    
