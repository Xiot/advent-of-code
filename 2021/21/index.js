
import { range } from "lodash";
import { autoParse, byLine, log } from "../../utils";

export const parse = byLine(line => {
  const [, player, pos] = /Player ([0-9]+) starting position: ([0-9]+)/.exec(line);
  return {
    player: parseInt(player),
    cell: parseInt(pos)
  };
});

export function part1(input) {
  // log('input', input);
  const track = range(0, 10).map(x => x + 1);
  let players = [
    {
      cell: input.find(x => x.player === 1).cell - 1,
      score: 0
    },
    {
      cell: input.find(x => x.player === 2).cell - 1, 
      score: 0
    }
  ];
  
  log(players);
  let currentPlayerTurn = 0;

  const dice = createPracticeDice(100);

  let turn = 0;
  while(true) {
    const roll = dice.roll(3);
    const player = players[currentPlayerTurn];
    log('before', currentPlayerTurn, roll, player.cell, player.score);
    player.cell = (player.cell + roll) % track.length;
    player.score += player.cell + 1;

    log('after', currentPlayerTurn, roll, player.cell, player.score);

    // break;
    currentPlayerTurn = (currentPlayerTurn + 1) % 2;
    if (currentPlayerTurn === 0) {
      turn ++;
    };

    if (player.score >= 1000) {
      break;
    }
  }

  const loser = players.sort((l, r) => l.score - r.score)[0];

  return loser.score * dice.rollCount;
}

const occurances = [
  {value: 3, count: 1},
  {value: 4, count: 3},
  {value: 5, count: 6},
  {value: 6, count: 7},
  {value: 7, count: 6},
  {value: 8, count: 3},
  {value: 9, count: 1},
];

export function part2(input) {
  
  const TRACK_LENGTH = 10;
  
  const p1 = input.find(x => x.player === 1).cell - 1;
  const p2 = input.find(x => x.player === 2).cell - 1;

  let p1Wins = 0;
  let p2Wins = 0;

  // const test = ()

  const w1 = turnsToWin(p1);
  const w2 = turnsToWin(p2);

  log('PLAYER 1', w1);
  log('PLAYER 2', w2);

  const winCountAt = (w1, w2, t) => {
    const ti = parseInt(t);

    const calc = (winner, loser, turn) => {
      return (winner[turn] ?? 0) - range(3, turn).reduce((sum, t) => sum + (loser[t] ?? 0), 0);
    };

    const universes = [1,1]; // universeCount(t);
    return [
      Math.max(0, calc(w1, w2, t)) * Math.max(1, universes[0]),
      Math.max(0, calc(w2, w1, t)) * Math.max(1, universes[1])
    ];
  };
  
  const test = (p1, p2) => {
    let universes = 1;
    universes = universes * 27;

  };

  const universeCount = turn => {
    const p1 = Math.pow(27, turn * 2 - 1);
    const p2 = Math.pow(27, turn * 2);
    return [p1, p2];
  };

  const totalWins = range(3, 11).reduce((ret, turn) => {
    const counts = winCountAt(w1, w2, turn);
    const universes = universeCount(turn - 1);
    ret[0] += Math.max(0, counts[0] );
    ret[1] += Math.max(0, counts[1] );
    return ret;
  },[0,0]);
  log(totalWins);

  for(let i = 1; i < 7; i++) {
    log(i, universeCount(i));
  }
  log();
  for(let i = 1; i < 10; i++) {
    log(i, winCountAt(w1,w2,i));
  }
  
  /*
  1 [ 27, 729 ]
  2 [ 19683, 531441 ]
  3 [ 14348907, 387420489 ]
  4 [ 10460353203, 282429536481 ]
  5 [ 7625597484987, 205891132094649 ]
  6 [ 5559060566555523, 150094635296999140 ]
      444356092776315
*/

  // for(let i = 3; i < 11; i++) {
  //   log(winCountAt(w1, w2, i));
  // }
  
  // return range(3, 11).map(t => universeCount(t));

  // 444356092776315
  // 1072512517

  // return totalWins;
  // return winCountAt(w1, w2, 3);

  // return Math.pow(81,6);

  // let score = 0;
  // let value = 3;
  // let pos = 7;
  // let turn = 0;
  // while (score < 21) {
    
  //   pos = ((pos + value) % TRACK_LENGTH);
  //   score += pos + 1;
  //   turn +=1;
  //   log(turn, pos, value, score);
    
  // }
  // return score;

}    

export function part3(input) {
  const TRACK_LENGTH = 10;
  
  const p1 = input.find(x => x.player === 1).cell - 1;
  const p2 = input.find(x => x.player === 2).cell - 1;
  
  log(p1, p2);
  const ret = turnsToWin(p1);
  log(ret);
  const raw = ret.getRaw();
  log('raw', raw[3]);
}

function turnsToWin (pos)  {
  const TRACK_LENGTH = 10;
  let turnsToWinInner = (pos, score = 0, turn = 0, roll = '') => {
      
    if (score >= 21) {
      return {[turn]: [roll.split('').sort().join('')]};      
    }
    const values = range(3, 10);
    
    const t = {};
    for(let v of values) {
      
      const nextPos = (pos + v) % TRACK_LENGTH;
      const prob = occurances.find(x => x.value === v).count;
      const r = turnsToWinInner(nextPos, score + nextPos + 1, turn + 1, roll + String(v));
      for(let [tur, rolls] of Object.entries(r)) {
        if (!t[tur]) {
          t[tur] = new Set();
        }
        rolls.forEach(r => t[tur].add(r));
        
        // t[tur] = (t[tur] ?? 0) + wins;
      }    
    }
    return t;
  };

  const inner = turnsToWinInner(pos);
  const result = {};
  for(let [turn, rolls] of Object.entries(inner)) {
    result[turn] = rolls.size;
  }
  result.getRaw = () => inner;
  return result;
};

function createTrack  () {
  const cells = range(0, 10).map(x => x + 1);

  return {
    track: cells,
    
  };
}

function createPracticeDice(sides) {
  let next = 0;
  let rollCount = 0;

  const roll = () => {
    rollCount +=1;
    next = ((next) % sides) + 1;    
    return next;
  };
  
  return {
    get rollCount() { return rollCount; },
    roll(count = 1) {
      let sum = 0;
      for(let i = 0; i < count; i++) {
        const v = roll();
        sum += v;
      }
      return sum;
    },
  };
}

function createDiracDice(sides) {
  let next = 0;
  let rollCount = 0;

  const roll = () => {
    rollCount +=1;
    next = ((next) % sides) + 1;    
    return next;
  };
  
  return {
    get rollCount() { return rollCount; },
    roll() {
      // let sum = 0;
      // for(let i = 0; i < count; i++) {
      //   const v = roll();
      //   sum += v;
      // }
      return ;
    },
  };
}
