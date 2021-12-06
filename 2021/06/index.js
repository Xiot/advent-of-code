
export const parse = text => text.split(',').map(x => parseInt(x));

export function part1(input) {

  let fishes = input;

  for(let day = 0; day < 80; day++) {

    const newFish = [];
    for(let fish of fishes) {
      fish -= 1;
      if (fish === -1) {
        newFish.push(6);
        newFish.push(8);
      } else {
        newFish.push(fish);
      }
    }
    fishes = newFish;
  }
  return fishes.length;
}

export function part2(input) {
  let fishes = input;

  let lives = [];
  for(let fish of fishes) {
    lives[fish] = (lives[fish] ?? 0) + 1;
  }

  for(let day = 0; day < 256; day++) {
    
    const newLives = [];
    for(let i = 0; i < 9; i++) {
      const value = lives[i];
      if (value == null) continue;
      if (i === 0) {
        newLives[8] = value;
        newLives[6] = (newLives[6] ?? 0) + value;
      } else {
        newLives[i - 1] = (newLives[i - 1] ?? 0) + value;
      }            
    }
    lives = newLives;    
  }

  return lives.reduce((acc, f) => acc + (f ?? 0), 0);
}    
