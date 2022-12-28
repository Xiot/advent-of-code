
import { autoParse, log, createCircle } from "../../utils";

export const parse = text => parseInt(text);

export function part1(input) {
  log('input', input);
  const buffer = createCircle([0]);
  let current = buffer.head;
  for(let i = 1; i <= 2017; i++) {
    current = buffer.walk(current, input);
    current = buffer.insertAfter(current, {value: i});
  }  
  return current.next.value;
}

function print(list, current) {  
  return list.values().map(i => current.value === i ? `(${i})` : i).join(' ');
}

// Brute Force - 257s
export function part2(input) {
  const COUNT = 50000000;
  const buffer = createCircle([0]);
  const head = buffer.head;
  let current = buffer.head;
  for(let i = 1; i <= COUNT; i++) {
    current = buffer.walk(current, input);
    if (current.value === 0) {
      log(i);
    }
    current = buffer.insertAfter(current, {value: i});
  }  
  return head.next.value;
}    
