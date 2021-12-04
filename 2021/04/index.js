
import { autoParse } from "../../utils";

export const parse = (text) => {
  const [callLine, ...rest] = text.split('\n');
  const numbers = callLine.split(',').map(x => parseInt(x));

  const boards = [];
  
  let offset = 1;
  while(true) {
    const board = [];
    for(let i = 0; i < 5; i++) {
      board.push(rest[offset+i].split(' ').filter(Boolean).map(x => parseInt(x)));
    }
    boards.push(board);

    offset+=6;
    if (offset >= rest.length)
      break;
  }

  return {
    numbers,
    boards
  };
};

export function part1(input) {
  // console.log(input.boards);

  const {board, last} = play(input);
  const sum = countRemaining(board);
  console.log(board, sum);
  return sum * last;
}

export function part2(input) {  
  const {board, last, index} = findLastToWin(input);
  const sum = countRemaining(board);
  console.log(board, last, sum, index);
  return sum * last;
}

const countRemaining = (board) => {
  let sum = 0;
  for(let r = 0; r < board.length; r ++) {
    for(let c = 0; c < board[0].length; c++) {
      const value = board[r][c];
      if (value === 'x') continue;
      sum += value;
    }
  }
  return sum;
};

const play = ({numbers, boards}) => {
  for(let num of numbers) {
    for(let board of boards) {
      mark(board, num);
      if (checkWin(board)) {
        return {board, last: num};        
      }
    }
  }
  return null;
};

const findLastToWin = ({numbers, boards}) => {
  let winners = 0;
  for(let num of numbers) {
    
    for(let b = 0; b < boards.length; b++) {
      const board = boards[b];
      if (!board) continue;
      mark(board, num);

      if(b === 1 && num === 13) {
        console.log('last', board, checkWin(board));
      }
      if (checkWin(board)) {
        boards[b] = null;
        
        if (boards.filter(Boolean).length === 0) {
          return {board, last: num, index: b};
        }
      }
    }    
  }
  return null;
};

const mark = (board, value) => {
  for(let r = 0; r < board.length; r++) {
    for(let c = 0; c < board[0].length; c++) {
      if (board[r][c] === value) {
        board[r][c] = 'x';
      }
    }
  }
};

const checkWin = (board) => {
  for(let r = 0; r < board.length; r++) {
    if(board[r].every(x => x === 'x')) {
      return true;
    }
  }
  
  for(let c = 0; c < board[0].length; c++) {
    let won = true;
    for(let r = 0; r < board.length; r++) {
      if (board[r][c] !== 'x') {
        won = false;
      }
    }
    if (won) {
      console.log('col', c);
      return true;
    }
  }

  return false;
};