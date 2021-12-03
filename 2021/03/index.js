
import { byLine } from "../../utils";

export const parse = byLine();

export function part1(input) {
  const rows = input.length;
  let gamma = "";
  for(let c = 0; c < input[0].length; c++) {
    const ones = input.reduce((sum, row) => {
      return sum + (row[c] === '1' ? 1 : 0);
    }, 0);

    gamma += ones > (rows / 2) ? "1" : "0";
  }
  const gammaDec = parseInt(gamma, 2);
  const epsilon = gamma.split('').reduce((acc, char) => {    
    return acc += (char === '1' ? '0' : '1');
  }, '');
  const epsilonDec = parseInt(epsilon, 2);
  
  return gammaDec * epsilonDec;
}

export function part2(input) {

  const mostCommon = (arr, i) => {    
    const ones = arr.reduce((sum, row) => {
      return sum + (row[i] === '1' ? 1 : 0);
    }, 0);
    return ones >= (arr.length / 2) ? "1" : "0";
  };

  let oxygen = [...input];
  for(let c = 0; c < input[0].length; c++) {
    const commonBit = mostCommon(oxygen, c);
    
    oxygen = oxygen.filter(row => row[c] === commonBit);
    if (oxygen.length === 1) break;
  }

  let scrubber = [...input];
  for(let c = 0; c < input[0].length; c++) {
    const commonBit = mostCommon(scrubber, c);
    
    scrubber = scrubber.filter(row => row[c] != commonBit);
    if (scrubber.length === 1) break;
  }

  return parseInt(oxygen[0], 2) * parseInt(scrubber[0], 2);
}    
