import { byLine, log } from '../../utils';
type Input = ReturnType<typeof parse>;

const PARSE_RE = /(\d+)\s*(\d+)\s*(\d+)(?:\s*(\d+))*/;

export const parse = text => {
  const lines = byLine(line => PARSE_RE.exec(line).slice(1))(text);
  const row1 = lines[0];

  const p2Lines = text.split('\n').map(x => parseInt(x.slice(10).split(' ').filter(Boolean).join('')));

  return {
    part1: row1
      .filter(x => x)
      .map((time, index) => {
        return {
          time: parseInt(time),
          distance: parseInt(lines[1][index]),
        };
      }),
    part2: p2Lines,
  };
};

export function part1(races: Input) {
  const raceMargins: number[][] = [];
  for (const r of races.part1) {
    raceMargins.push(distanceForRace(r.time, r.distance));
  }

  return raceMargins.reduce((acc, cur) => acc * cur.length, 1);
}

export function part2(input: Input) {
  console.log(input.part2);

  const raceMargins = distanceForRace(input.part2[0], input.part2[1]);
  return raceMargins.length;
}

function distanceForRace(time: number, record: number) {
  const margins: number[] = [];
  for (let i = 1; i < time; i++) {
    const distance = distanceTraveled(i, time - i);
    if (distance > record) {
      margins.push(distance - record);
    }
  }
  return margins;
}

function distanceTraveled(speed: number, time: number) {
  return speed * time;
}
