import { byLine, bySection, gcd, lcm, log, maxOf, minOf } from '../../utils';
type Input = ReturnType<typeof parse>;

const PARSE_RE = /([0-9a-z]{3}) = \(([0-9a-z]{3}), ([0-9a-z]{3})\)/i;

export const parse = (text: string) => {
  const sections = text.split('\n\n');
  const dirs = sections[0].split('') as ('L' | 'R')[];

  const lines = sections[1].split('\n').map(l => {
    const [, start, left, right] = PARSE_RE.exec(l);
    return { start, L: left, R: right };
  });
  return {
    dirs,
    map: lines.reduce((acc, cur) => {
      acc[cur.start] = cur;
      return acc;
    }, {} as Record<string, { start: string; L: string; R: string }>),
  };
};
type Node = { start: string; L: string; R: string };

export function part1(input: Input) {
  let node = input.map.AAA;

  let i = -1;
  let steps = 0;
  while (node.start !== 'ZZZ') {
    i = (i + 1) % input.dirs.length;
    const dir = input.dirs[i];
    log(steps, dir, node.start);
    node = input.map[node[dir]];

    steps++;
  }
  return steps;
}

export function part2(input: Input) {
  let startingNodes = Object.keys(input.map)
    .filter(x => x.endsWith('A'))
    .map(x => input.map[x]);

  const loops = findLoops(startingNodes, input);
  let nums = loops.map(x => x.loopsAt[0]);

  return nums.reduce((acc, cur) => lcm(acc, cur), 1);
}

function findLoops(startingNodes: Node[], input: Input) {
  const nodes = [...startingNodes];

  const counts = nodes.map((x, i) => ({
    loopsAt: [] as number[],
    startingNode: nodes[i],
  }));

  let i = -1;
  let steps = 1;

  let nodesEnded = 0;

  while (!allAtEnd(nodes)) {
    i = (i + 1) % input.dirs.length;
    const dir = input.dirs[i];

    for (let n = 0; n < nodes.length; n++) {
      nodes[n] = input.map[nodes[n][dir]];
      if (nodes[n].start.endsWith('Z')) {
        counts[n].loopsAt.push(steps);
        if (counts[n].loopsAt.length === 1) {
          log(steps, nodes[n].start, i);
          nodesEnded += 1;
        }
      }
    }
    steps += 1;

    if (nodesEnded === startingNodes.length) {
      break;
    }
  }
  return counts;
}

function allAtEnd(nodes: { start: string }[]) {
  return nodes.every(x => x.start.endsWith('Z'));
}

function anyAtEnd(nodes: { start: string }[]) {
  return nodes.some(x => x.start.endsWith('Z'));
}
