import { solutionPath } from './utils';

const fs = require('fs');
const path = require('path');

export const initialize = (year, day) => {
  const folder = solutionPath(year, day);

  if (fs.existsSync(folder)) {
    return Promise.resolve();
  }
  // Create the folder
  fs.mkdirSync(folder, { recursive: true });

  const templateFile = path.join(folder, 'index.ts');
  if (!fs.existsSync(templateFile)) {
    fs.writeFileSync(templateFile, createTemplate());
    fs.writeFileSync(path.join(folder, 'sample.txt'), '');
  }
  return Promise.resolve();
};

function createTemplate() {
  return trimLeading(`
  import { byLine, log } from "../../utils";
  type Input = ReturnType<typeof parse>

  export const parse = byLine(line => line);

  export function part1(input: Input) {
    log('input', input);
  }
  
  export function part2(input: Input) {
  
  }    
  `);
}

function trimLeading(text) {
  const lines = text.split('\n');
  const amountToTrim = lines[1].match(/^\s+/)[0].length;

  const leadingSpaceRe = new RegExp(`^\\s{${amountToTrim}}`);
  return lines.map(line => line.replace(leadingSpaceRe, '')).join('\n');
}
