
import { range } from "lodash";
import { clearOutputPath, createGridMap, loadGrid, log, visualizeGrid, writeOutputFile } from "../../utils";

export const parse = text => {
  const [algorithm, image] = text.split('\n\n');

  const data = image.split('\n').map(x => x.split(''));
  return {
    algorithm,
    data
  };
};

export function part1(input) {
  log('input', input);
  const grid = loadGrid(input.data, '.');
  grid.markOnGet = false;

  const BORDER_SIZE = 1;

  
  log('INITIAL');
  log(visualizeGrid(grid, (x,y) => grid.get(x,y)));
  log();
  clearOutputPath();

  const v = getValueAt(grid, {x:2, y:2});
  log(v, input.algorithm[v]);

  const applyPixel = (source, destination, x, y) => {
    const value = getValueAt(source, {x,y});
    // log(x, y, value, input.algorithm[value]);
    destination.set(x, y, input.algorithm[value]);
  };

  const apply = source => {
    const image = createGridMap(input.algorithm[0]);
    image.markOnGet = false;
    for(let y = source.bounds.top - BORDER_SIZE; y <= source.bounds.bottom + BORDER_SIZE; y++) {
      for(let x = source.bounds.left - BORDER_SIZE; x <= source.bounds.right + BORDER_SIZE; x++) {
        
        applyPixel(source, image, x, y);
      }
    }
    return image;
  };

  let image = createGridMap('.');
  image.markOnGet = false;
  image = grid;
  for(let i = 0; i < 2; i++) {
    image = apply(image);
    log(`STEP ${i+1}`);
    log(visualizeGrid(image, (x,y) => image.get(x,y)));
    writeOutput(i+1, image);
  }

  log();
  
  return Array.from(image.values()).filter(x => x === '#').length;

}

export function part2(input) {
  const DEFAULT_PIXEL = '.';
  const COUNT = 2;

  log('input', input);
  const grid = loadGrid(input.data, DEFAULT_PIXEL);
  grid.markOnGet = false;

  const BORDER_SIZE = 1;

  
  log('INITIAL');
  log(visualizeGrid(grid, (x,y) => grid.get(x,y)));
  log();

  const applyPixel = (source, destination, x, y) => {
    const value = getValueAt(source, {x,y});
    destination.set(x, y, input.algorithm[value]);
  };

  const apply = (source, i) => {
    const defaultPixel = i % 2 === 0 ? input.algorithm[0] : input.algorithm[input.algorithm.length - 1];
    const image = createGridMap(defaultPixel);
    image.markOnGet = false;
    for(let y = source.bounds.top - BORDER_SIZE; y <= source.bounds.bottom + BORDER_SIZE; y++) {
      for(let x = source.bounds.left - BORDER_SIZE; x <= source.bounds.right + BORDER_SIZE; x++) {
        
        applyPixel(source, image, x, y);
      }
    }
    return image;
  };
  clearOutputPath();

  let image = createGridMap(DEFAULT_PIXEL);
  image.markOnGet = false;
  image = grid;
  for(let i = 0; i < COUNT; i++) {
    image = apply(image, i);    
    writeOutput(i+1, image);
  }

  log();

  return Array.from(image.values()).filter(x => x === '#').length;
}    

function writeOutput(step, grid) {
  writeOutputFile(`step-${step}.txt`, visualizeGrid(grid, (x,y) => grid.get(x,y)));
}

function getValueAt(grid, pos) {
  let text = '';
  for(let y of range(-1, 2)) {
    for(let x of range(-1, 2)) {
      text += grid.get(pos.x + x, pos.y + y) === '#' ? '1' : '0';
    }
  }
  return parseInt(text, 2);
}