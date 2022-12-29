import {log} from '../../utils';


function isPrime(value) {
  for(let i = 2; i < value / 2; i++) {
    if (value % i === 0) return false;
  }
  return true;
}

// 1000 - high
//  916 - high
//  501 - low
export function calc() {
  let a,b,c,d,e,f,g,h = 0;

  log('prime', isPrime(18));
  let pc = 0;

  a = 1;
  b = 67;
  c = b;

  b *= 100;
  b -= -100000;
  c = b;
  c -= -17000;

  log('diff', (c - b) / 17);
  while(true) {
    f = 1;
    d = 2;

    log('isprime', b, isPrime(b));
    if (!isPrime(b)) {      
      f = 0;
    } else {
      pc++;
    }
    // while(true) {
    //   e = 2;

    //   // while(true) {
    //   //   // g = d; 
    //   //   // g *= e;
    //   //   // g -= b;
    //   //   if ( (d*e - b) === 0) {
    //   //     f = 0;
    //   //   }
    //   //   e -= -1;
    //   //   g = e;
    //   //   g -= b;
    //   //   if (e - b === 0) break;
    //   // }
    //   // if (b % d === 0) {
    //   //   f = 0;
    //   // }
    //   if (!isPrime(b)) {
    //     f = 0;  
    //   }

    //   d -= -1;
    //   g = d;
    //   g -=b;
    //   if (d - b === 0) break;
    // }

    if (f === 0) {
      log('inc', h + 1);      
      h+=1;
    }

    // g = b;    // 27
    // g -= c;   // 28
    if (b === c) {   // 29
      log('h', h);
      log('pc', pc, 1000 - pc);
      return h;
    }
    
    b += 17;
  }
}