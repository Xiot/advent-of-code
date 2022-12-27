
import { autoParse, log, byLine, maxOf, range } from "../../utils";

export const parse = byLine(line => {
  const [depth, range] = line.split(': ').map(x => parseInt(x));
  return {depth, range, index: 0, dir: 1};
});

export function part1(input) {
  log('input', input);

  const layers = maxOf(input, x => x.depth);
  log(layers);

  const caught = [];

  for(let l = 0; l <= layers; l++) {
    visualize(input, l);    

    for(let s of input) {            
      if (l === s.depth && s.index === 0) {        
        caught.push(s);
      }      
      s.index = s.index + s.dir;
      if (s.index === 0) {        
        s.dir = 1;
      } else if (s.index === s.range - 1) {        
        s.dir = -1;
      }      
    }
  }  
  return caught.reduce((acc, cur) => acc + cur.depth * cur.range, 0);
}

function visualize(layers, time) {
  log(`${time}-------`);
  for(let layer of layers) {
    log(
      String(layer.depth).padStart(2), 
      range(0, layer.range - 1)
        .map(r => `[${layer.index === r ? 'S' : ' '}]`)
        .join(' ')
    );
  }
  log('-------');
}

export function part2(input) {

  const hit = input.map(f => {
    return {
      mul: f.range * 2 - 2,
      offset: f.depth,
      hitAt(time) {
        return this.indexAt(time) === 0;        
      },
      indexAt(time) {
        const w = (time + this.offset) % this.mul;
        if (w < f.range) {
          return w;
        } else {
          return Math.abs(w - (this.mul));
        }        
      }
    };
  });

  let t = 0;
  while(true) {

    const isCaught = hit.some(x => x.hitAt(t));
    if (!isCaught) return t;

    t++;
  }

}    

function check(input) {
  
  const layers = maxOf(input, x => x.depth);
  log(layers);

  const caught = [];

  for(let l = 0; l <= layers; l++) {
    visualize(input, l);    

    for(let s of input) {            
      if (l === s.depth && s.index === 0) {        
        caught.push(s);
      }      
      s.index = s.index + s.dir;
      if (s.index === 0) {        
        s.dir = 1;
      } else if (s.index === s.range - 1) {        
        s.dir = -1;
      }      
    }
  }  
  return caught;
  // return caught.reduce((acc, cur) => acc + cur.depth * cur.range, 0);
}