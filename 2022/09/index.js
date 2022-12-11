
import { autoParse, log, createGridMap, visualizeGrid } from "../../utils";

export const parse = autoParse();

export function part1(input) {
  log('input', input);

  const grid = createGridMap(' ');

  let head = {x: 0, y: 0};
  let tail = {x: 0, y: 0};

  grid.set(0,0,'#');

  for(let [dir, value] of input) {
    for(let i = 0; i < value; i++) {
      head = move(dir, head);
      tail = moveTail(head, tail);
      grid.set(tail.x, tail.y, '#');
    }
  }

  const d = visualizeGrid(grid, (x, y) => {
    if (x === 0 && y === 0) return 's';
    const value = grid.get(x, y);
    return value || ' ';
  });

  console.log(d);
  const l = Array.from(grid.keys());
  log(l.length);
  return l.length;
}

function moveTail(head, tail) {

  const diffX = Math.abs(head.x - tail.x);
  const diffY = Math.abs(head.y - tail.y);
  if (diffX <= 1 && diffY <= 1) return tail;

  if(head.x === tail.x) {
    if (Math.abs(head.y - tail.y) < 2) return tail;
    return {x: tail.x, y: tail.y + Math.sign(head.y - tail.y)};
  }

  if (head.y === tail.y) {
    if (Math.abs(head.x - tail.x) < 2) return tail;
    return {x: tail.x + Math.sign(head.x - tail.x), y: tail.y};
  }

  const dx = Math.sign(head.x - tail.x);
  const dy = Math.sign(head.y - tail.y);
  return {x: tail.x + dx, y: tail.y+ dy};

}

function move(dir, pos) {
  switch(dir) {
  case 'R': return {x:pos.x+1, y:pos.y};
  case 'L': return {x:pos.x-1, y:pos.y};
  case 'U': return {x: pos.x, y: pos.y - 1};
  case 'D': return {x: pos.x, y: pos.y + 1};
  }
}
const keyOf = ({x, y}) => `${x}|${y}`;
export function part2(input) {
  log('input', input);

  const grid = createGridMap(' ');

  const knots = Array.from({length: 10}, () => ({x: 0, y: 0}));

  const tailVisits = new Set();

  grid.set(0, 0, '#');

  for(let [dir, value] of input) {
    for(let i = 0; i < value; i++) {

      knots[0] = move(dir, knots[0]);
      for(let k = 1; k < knots.length; k++) {
        knots[k] = moveTail(knots[k-1], knots[k]);
        grid.set(knots[k].x, knots[k].y, '#');
      }

      tailVisits.add(
        keyOf(knots[knots.length -1])
      );
    }
  }

  const d = visualizeGrid(grid, (x, y) => {    
    const value = grid.get(x, y);

    if (tailVisits.has(keyOf({x,y}))) {
      return '#';
    }
    return ' ';

  });

  console.log(d);
  const l = Array.from(tailVisits);
  console.log('------');
  log(l.length);
  return l.length;
}    
