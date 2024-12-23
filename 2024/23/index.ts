import { byLine, createBucketMap, log, maxOf } from '../../utils';
import { combineMap } from '../../utils/groups';
type Input = ReturnType<typeof parse>;

export const parse = (text: string) =>
  text.split('\n').map(line => {
    const parts = line.split('-');
    return {
      from: parts[0],
      to: parts[1],
    };
  });

export function part1(input: Input) {
  // log('input', input);

  const connections = combineMap<string, string[]>([], (prev, item) => [...prev, item]);

  for (const con of input) {
    connections.append(con.from, con.to);
    connections.append(con.to, con.from);
  }

  function isThreeWay(name: string): string[][] {
    const links = connections.get(name);
    if (links.length < 3) return null;

    const w = [];
    for (let i = 0; i < links.length - 1; i++) {
      for (let j = i + 1; j < links.length; j++) {
        if (connections.get(links[i]).includes(links[j])) {
          w.push([name, links[i], links[j]].sort());
        }
      }
    }
    if (w.length === 0) return null;
    return w;
  }

  const party: string[][] = [];
  for (const entry of connections.entries().filter(e => e[1].length >= 3)) {
    console.log(entry);
    const ret = isThreeWay(entry[0]);
    if (ret) {
      party.push(...ret);
    }
  }
  const processed = new Set(party.filter(nodes => nodes.some(n => n.startsWith('t'))).map(nodes => nodes.join(',')))
    .keys()
    .toArray();
  log(processed);
  return processed.length;
}

export function part2(input: Input) {
  const connections = combineMap<string, string[]>([], (prev, item) => [...prev, item]);

  for (const con of input) {
    connections.append(con.from, con.to);
    connections.append(con.to, con.from);
  }

  function isThreeWay(name: string) {
    const links = connections.get(name);
    if (links.length < 3) return null;

    // const co = combineMap<string, string[]>([], (acc, cur) => {
    //   acc.push(cur)
    //   return acc
    // })

    const co = new Map();

    const c2 = new Map();

    const rl = [...links, name];
    log('links: ', name, links);
    const w = [];

    let dd = new Set(rl);
    log('dd', dd);
    for (let i = 0; i < links.length; i++) {
      const left = connections.get(links[i]);
      const common = left.filter(l => links.includes(l));

      log('c', links[i], common);
      const t = new Set([name, links[i], ...common]).intersection(dd);
      log('t', links[i], t);

      if (common.length > 0) {
        w.push(t.keys().toArray());
      }
      // co.set(links[i], common);
      // c2.set(common.length, (c2.get(common.length) ?? 0) + 1);
      // log(' ', links[i], common.length);
      // if (common.length >= 2) {
      //   // w.push([name, ...common]);
      //   w.push(links[i]);
      // }
      // for (let j = i + 1; j < links.length; j++) {
      // const left = connections.get(links[i]);
      // // const right = connections.get(links[j]);
      // const e = left.filter(r => connections.get(r).includes(r));
      // w.push([name, ...e]);
      // }
    }
    log('w', w);
    return w;
    // log(co);
    // log(c2);

    // const m = maxOf(c2.entries().toArray(), e => e[1]);
    // const ww = c2.entries().find(e => e[1] === m)[0];

    // log('m', m);
    // log('ww', ww);
    // const g = new Set(
    //   co
    //     .entries()
    //     .filter(e => e[1].length === ww)
    //     .toArray()
    //     .flat(2),
    // )
    //   .keys()
    //   .toArray()
    //   .concat(name)
    //   .sort();
    // log('g', g);
    // return g;
    // if (w.length < 2) return null;
    // return [name, ...w].sort();
  }

  const party: string[][] = [];
  // .take(1)
  for (const entry of connections
    .entries()
    .filter(e => e[1].length >= 3)
    .take(3)) {
    console.log(entry);
    const ret = isThreeWay(entry[0]);
    log('RET', ret);
    if (ret) {
      party.push(ret);
    }
  }
  log(party);
  // return party.length;
  const processed = new Set(party.filter(nodes => nodes.some(n => n.startsWith('t'))).map(nodes => nodes.join(',')))
    .keys()
    .toArray();
  log(processed);
  return processed.length;
}
