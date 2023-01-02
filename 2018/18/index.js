
import { autoParse, log, loadGrid, visualizeGrid } from "../../utils";

export const parse = text => {
  const grid = loadGrid(text, ' ');
  grid.markOnGet = false;
  return grid;
};

const OPEN = '.';
const TREE = '|';
const LUMBERYARD = '#';

function createCounts() {
  return {
    [OPEN]: 0,
    [TREE]: 0,
    [LUMBERYARD]: 0
  };
}

export function part1(input) {
  
  let prev = input;
  for(let turn = 0; turn < 10; turn++) {
    const grid = prev.clone();

    for(let y = 0; y < grid.bounds.height; y++) {
      for(let x = 0; x < grid.bounds.width; x++) {

        const value = prev.get(x, y);

        const counts = Array.from(prev.ring(x,y))
          .reduce((acc, [pos, token]) => {
            return {
              ...acc,
              [token]: acc[token] + 1
            };
          }, createCounts());

        if (value === OPEN) {
          if (counts[TREE] >= 3) {
            grid.set(x, y, TREE);
          }
        } else if (value === TREE) {
          if (counts[LUMBERYARD] >= 3) {
            grid.set(x, y, LUMBERYARD);
          }
        } else if (value === LUMBERYARD) {
          if (!(counts[LUMBERYARD] >= 1 && counts[TREE] >= 1)) {
            grid.set(x, y, OPEN);
          }
        }
              
      }
    }
    log(`TURN ${turn+1}`);
    console.log(
      visualizeGrid(grid)
    );
    log('----------');
    prev = grid;
  }

  const counts = Array.from(prev.values()).reduce((acc, cur) => {
    return {
      ...acc,
      [cur]: acc[cur] + 1
    };
  }, createCounts());

  log(counts);
  return counts[LUMBERYARD] * counts[TREE];

}

function countTokens(grid) {
  return Array.from(grid.values()).reduce((acc, cur) => {
    return {
      ...acc,
      [cur]: acc[cur] + 1
    };
  }, createCounts());
}
function computeHash(grid) {
  // const counts = Array.from(grid.values()).reduce((acc, cur) => {
  //   return {
  //     ...acc,
  //     [cur]: acc[cur] + 1
  //   };
  // }, createCounts());
  // const raw = 
  return Array.from(grid.values()).join('');
}

export function part2(input) {

  const cache = new Map();
  const initialTokens = countTokens(input);
  cache.set(computeHash(input), {turn: 0, tokens: initialTokens});

  let prev = input;
  let prevTokens = initialTokens;
  for(let turn = 1; turn < 1000000000; turn++) {
    const grid = prev.clone();
    const tokens = {...prevTokens};

    for(let y = 0; y < grid.bounds.height; y++) {
      for(let x = 0; x < grid.bounds.width; x++) {

        const value = prev.get(x, y);

        const counts = Array.from(prev.ring(x,y))
          .reduce((acc, [pos, token]) => {
            return {
              ...acc,
              [token]: acc[token] + 1
            };
          }, createCounts());

        if (value === OPEN) {
          if (counts[TREE] >= 3) {
            grid.set(x, y, TREE);
          }
        } else if (value === TREE) {
          if (counts[LUMBERYARD] >= 3) {
            grid.set(x, y, LUMBERYARD);
          }
        } else if (value === LUMBERYARD) {
          if (!(counts[LUMBERYARD] >= 1 && counts[TREE] >= 1)) {
            grid.set(x, y, OPEN);
          }
        }

        tokens[value] -= 1;
        tokens[grid.get(x, y)] += 1;

      }
    }

    prev = grid;
    prevTokens = tokens;

    const hash = computeHash(grid);
    if (!cache.has(hash)) {
      cache.set(hash, {turn, tokens});
      log(String(turn).padStart(4), hash.slice(0, 50));
    } else {
      const lastFound = cache.get(hash);
      log('found loop', lastFound, tokens);

      const loopSize = turn - lastFound.turn;
      // 1000000000
      const TARGET = 1000000000;
      const rem = (TARGET - turn) % loopSize;
      const finalTurn = lastFound.turn + rem;
      const finalTurnState = Array.from(cache.values()).find(x => x.turn === finalTurn);
      log(finalTurn, finalTurnState);
      return finalTurnState.tokens[TREE] * finalTurnState.tokens[LUMBERYARD];
    }
  }

  const counts = countTokens(prev);
  return counts[LUMBERYARD] * counts[TREE];

}    
