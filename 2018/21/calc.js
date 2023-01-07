import {log} from '../../utils';

export function calc(r0 = 0) {
  let r1, r2, r3, r4, r5 = 0;
  let c = 0;

  while(r4 === 0) {
    r4 = 123;
    r4 = r4 & 456;
    r4 = r4 === 72 ? 1 : 0;
  }
  r4 = 0;
  while(true) {
    r3 = r4 | 65536;
    r4 = 4332021;
    while(true) {
      r2 = r3 & 255;
      r4 = r4 + r2;
      r4 = r4 & 16777215;
      r4 = r4 * 65899;
      r4 = r4 & 16777215;

      r2 = 256 > r3 ? 1 : 0;
      if (r2 === 0) {
        r2 = 0;
        while(true) {
          r1 = r2 + 1;
          r1 = r1 * 256;
          r1 = r1 > r3 ? 1 : 0;
          if (r1 === 1) {
            r3 = r2;
            // continue lvl1; 
            break;           
          }
          r2 = r2 + 1;          
        }
      } else {
        console.log(++c, r4);
        if (r4 === r0) {
          return r0;
        }
      }
    }
  }
}
