
import { log, byLine, sumOf } from "../../utils";

export const parse = byLine(line => line);

export function part1(input) {  
  const sum = sumOf(input, snafuToDec);
  return decToSnafu(sum);
}

export function part2() {
  return 'Merry Christmas!';
}    

function snafuToDecDigit(digit) {
  if (!digit) return 0;
  switch(digit) {
  case '=': return -2;
  case '-': return -1;
  case '0': return 0;
  case '1': return 1;
  case '2': return 2;
  }
}
function decDigitToSnafu(digit) {
  switch(digit) {
  case 2: return '2';
  case 1: return '1';
  case 0: return '0';
  case -1: return '-';
  case -2: return '=';
  }
}

function decToSnafu(value) {
    
  let digits = '';

  while(value > 0) {
    let rem = value % 5;
    value = Math.floor(value / 5);

    if (rem >= 3) {
      digits = decDigitToSnafu(rem - 5) + digits;      
      value += 1;

    } else {
      digits = String(rem) + digits;
    }    
  }
  if (value < 0) {
    digits = '1' + digits;
  }

  return digits;

}

function snafuToDec(value) {

  if (value.length === 1) 
    return snafuToDecDigit(value);

  value = reverse(value);
    
  let dec = 0;
  
  for(let i = 0; i < value.length; i++) {
    dec+= Math.pow(5, i) * snafuToDec(value[i]);  
  }  
  return dec;

}
function reverse(s) {
  return String(s).split('').reverse().join('');
}