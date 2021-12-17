
import { createBounds, createGridMap, log, pointsWithin } from "../../utils";

export const parse = text => {
  const [,x1,x2,y1,y2] = /x=(\d+)\.\.(\d+), y=(-?\d+)\.\.(-?\d+)/.exec(text);
  return createBounds({
    left:  parseInt(x1),
    top: parseInt(y1),
    right: parseInt(x2),
    bottom: parseInt(y2)
  });
};

export function part1(target) {
  log('input', target.toJSON());

  const found = [];

  const logRet = ret => {
    if (!ret.hit) return;    
    const p = `${[String(ret.velocity.x).padStart(3)]}, ${String(ret.velocity.y).padStart(3)}]`;
    log(`${p}: ${ret.code}`);
  };

  let maxY = 0;
  const startVX = Math.floor(target.left / 2);
  for(let vy = 200; vy >= maxY; vy--) {
    log('y', vy, maxY);
    for(let vx = startVX; vx >= 0; vx--) {    
      const ret = fire(target, {x: vx, y: vy});
      logRet(ret);
      if (ret.hit) {1;
        maxY = Math.max(maxY, ret.velocity.y);
        found.push(ret);
      } else if(ret.code === 'SHORT') {
        break;
      }
    }
  }

  log(found);
  const highest = found.sort((l, r) => r.velocity.y - l.velocity.y)[0];
  return highest.highestY;
}


export function part2(target) {

  const logRet = ret => {
    if (!ret.hit) return;    
    const p = `${[String(ret.velocity.x).padStart(3)]}, ${String(ret.velocity.y).padStart(3)}]`;
    log(`${p}: ${ret.code}`);
  };

  let maxY = 0;
  let found = [];

  const startVX = target.right;
  // 125 was the highest Y velocity discovered from part 1
  for(let vy = 125; vy >= -250; vy--) {
    log('y', vy, maxY);
    for(let vx = startVX; vx >= 0; vx--) {    
      const ret = fire(target, {x: vx, y: vy});
      logRet(ret);
      if (ret.hit) {
        maxY = Math.max(maxY, ret.velocity.y);
        found.push(ret);
      } else if(ret.code === 'SHORT') {
        break;
      }
    }
  }
  
  const keyOf = v => `${v.x},${v.y}`;
  log(found.sort((l, r) => {
    if (l.velocity.x === r.velocity.x) {
      return l.velocity.y - r.velocity.y;
    }
    return l.velocity.x - r.velocity.y;
  }).map(f => keyOf(f.velocity)));

  return found.length;

}    


function fire(target, initialVelocity) {
  let pos = {x: 0, y:0};
  let step = 0;
  let velocity = {...initialVelocity};

  const grid = createGridMap();
  for(let [x,y] of pointsWithin(target)) {
    grid.set(x, y, 'T');
  }
  grid.set(0,0, 'S');
  // log(`STEP: ${step}\n${visualizeGrid(grid, (x, y) => grid.get(x, y) ?? '.')}`);
  
  let lastPos = pos;
  let highestY = 0;
  while(true) {
    step++;
    lastPos = {...pos};
    pos.x += velocity.x;
    pos.y += velocity.y;
    grid.set(pos.x, pos.y, '#');

    // log(`STEP: ${step}\n${visualizeGrid(grid, (x, y) => grid.get(x, y) ?? '.')}`);
    highestY = Math.max(highestY, pos.y);
    if (target.contains(pos.x, pos.y)) {
      return {
        hit: true,
        code: 'HIT',
        velocity: initialVelocity,
        highestY,
        step,
        pos,
      };
    }

    if(velocity.x > 0) {
      velocity.x = Math.max(0, velocity.x - 1);
    } else if (velocity.x < 0) {
      velocity.x =Math.max(0, velocity.x + 1);
    } else {
      if (pos.x < target.left) {
        return {
          hit: false,
          code: 'SHORT',
          velocity: initialVelocity,
          step,
          pos,          
        };
      }
    }
    
    if(pos.x > target.right) {
      
      // if (lastPos.y > target.top && pos.y < target.bottom) {
      return {
        hit: false, 
        code: 'OVERSHOOT_X',
        velocity: initialVelocity,
        step,
        pos,          
      };
      // } else if () {
        
      // }
      
    }

    if (pos.y < target.top) {
      return {
        hit: false, 
        code: 'OVERSHOOT_Y',
        velocity: initialVelocity,
        step,
        pos,          
      };
    }
    if (step > 1000) break;

    velocity.y -=1;    
  }
  return {
    hit: false, 
    code: 'STEP_LIMIT',
    velocity: initialVelocity,
    step,
    pos,
  };
}