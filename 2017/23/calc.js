import {log} from '../../utils';

// 1000 - high
//  501 - low
export function calc() {
  let a,b,c,d,e,f,g,h = 0;

  a = 1;
  b = 67;
  c = b;

  b *= 100;
  b -= 100000;
  c = b;
  c -= -17000;

  log('diff', (c - b) / 17);
  while(true) {
    f = 1;
    d = 2;

    // op - b is always mod 2
    // if (b % 2 === 0) {
    // d*e - b === 0
    // d*e === b
    // d * e === b
    e = b;
    if (d * e === b) {
      f = 0;
    }
    // log('l', b, c);
    // }

    // --op
    // not needed - just calculating f
    // while(true) {
    //   e = 2;        // 11

    //   // op
    //   // f = b % 2 === 0 ? 0 : 1;
    //   if (b % 2 === 0) {
    //     f = 0;
    //   }
    //   // --op

    // not needed
    // while(true) {
    //   // g = d;   // 12
    //   // g *= e;  // 13
    //   // g -= b;  // 14
    //   g = d * e - b;
    //   if (g === 0) {
    //     f = 0;
    //   }
    //   // e -= -1;
    //   e += 1;
    //   // g = e;
    //   // g -= b;
    //   g = e - b;
    //   // if (g === 0) break;
    //   if (e === b) break;
    // }
    // --

    //   // d -= -1;    // 21
    //   d += 1;
    //   // g = d;
    //   // g -=b;
    //   g = d - b;
    //   if (g === 0) break;
    // }

    if (f === 0) {
      // log('inc', h);
      // h-= -1;
      h+=1;
    }

    g = b;    // 27
    g -= c;   // 28
    if (b === c) {   // 29
      log(h);
      return h;
    }
    // b-=-17;
    b += 17;
  }
}