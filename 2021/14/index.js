
import { autoParse, log, sumOf, range } from "../../utils";
import fs from 'fs';
import { info } from "console";

export const parse = text => {
  const sections = text.split('\n\n');

  return {
    template: sections[0],
    rules: sections[1].split('\n').reduce((acc, line) => {
      const [,from, to] = /(.+) -> (.+)/.exec(line);
      acc[from] = to;
      return acc;
    },{})
  };
};

export function part1(input) {
  
  let {template, rules} = input;
  // template = 'NN';
  let code = template;
  
  log(input);

  for(let step = 0; step < 10; step++) {
    let prev = code;

    let idx = 1;
    for(let i = 0; i < prev.length - 1; i++) {
      const pair = prev.slice(i, i+2);
      const insert = rules[pair];
    
      code = code.slice(0, idx) + insert + code.slice(idx);
      idx +=2;              
    }    
  }
  log(code);
  const counts = code.split('').reduce((acc, c) => {
    acc[c] = (acc[c] ?? 0) + 1;
    return acc;
  }, {});

  log(counts);
  const k = Array.from(Object.entries(counts)).sort((l, r) => l[1] - r[1]);
  const min = k[0][1];
  const max = k[k.length - 1][1];
  return max - min;
}

function calculate(pair, MAX_DEPTH, rules, stream) {

  let counts = {};
  let stack = [{pair, depth: 0}];
  while(stack.length > 0) {
    // log(stack.length);
    const {pair, path, w, depth} = stack.pop();
    const insert = rules[pair];
    // log(depth);    
    
    const rem = MAX_DEPTH - depth;
    // log(':', depth, pair, rules[pair], rem,  path);
    if (depth >= MAX_DEPTH) {

      counts[pair[0]] = (counts[pair[0]] ?? 0) + 1;      
      
      // log('write', pair[0]);
      stream.write(pair[0]);
      // bottom += pair + '-';
      continue;
    }
    
    const left = pair[0] + insert;
    const right = insert + pair[1];
  
    stack.push({
      pair: insert + pair[1], 
      // path: [...path, right],
      depth: depth + 1,
      // w: mergeCounts(w, {[insert]: 1})
    });
      
    stack.push({
      pair: pair[0] + insert, 
      // path: [...path, left],
      depth: depth + 1, 
      // w: mergeCounts(w, {[insert]: 1})
    });
  }

  // counts[pair[1]] += 1;
  stream.write(pair[1]);

  return {
    pair,
    depth: MAX_DEPTH,
    counts,
  };

  // let code = pair;
  // for(let step = 0; step < depth; step++) {
  //   let prev = code;

  //   let idx = 1;
  //   for(let i = 0; i < prev.length - 1; i++) {
  //     const pair = prev.slice(i, i+2);
  //     const insert = rules[pair];
    
  //     code = code.slice(0, idx) + insert + code.slice(idx);
  //     idx +=2;              
  //   }    
  // }

  // const counts = code.split('').reduce((acc, c) => {
  //   acc[c] = (acc[c] ?? 0) + 1;
  //   return acc;
  // }, {});

  // return {
  //   pair,
  //   depth,
  //   final: code,
  //   counts,
  // };
}

function pairsOf(template) {
  const pairs = [];
  for(let i = 0; i < template.length - 1; i++) {
    const pair = template.slice(i, i +2);
    pairs.push(pair);
  }
  return pairs;
}
export function part3_lightbulb(input) {

  let {template, rules} = input;
  const totals = {};
  const STEPS = 40;

  // template = 'NN';

  const ruleCount = Object.entries(rules).reduce((acc, [pair, insert]) => {
    acc[insert] = (acc[insert] ?? 0) + 1;
    return acc;
  }, {});

  const w = Object.entries(ruleCount).sort((l, r) => l[1] - r[1]);
  const leastUsed = w[0][0];
  const mostUsed = w[w.length - 1][0];
  log('least', w[0][0]);
  log('most ', w[w.length - 1][0]);

  for(let i = 0; i < template.length - 1; i++) {
    const pair = template.slice(i, i +2);
    totals[pair] = (totals[pair] ?? 0) + 1;
  }

  const inc = (obj, key, amount = 1) => {
    obj[key] = (obj[key] ?? 0) + amount;
    return obj;
  };

  const letterCount = template.split('').reduce((acc, c) => {
    return inc(acc, c);
  }, {});

  log('step', 0, totals);
  const newPairs = [totals];
  for(let step = 1; step <= STEPS; step++) {
    const prevPairs = newPairs[step - 1];
    newPairs[step] = {};

    for(let [pair, count] of Object.entries(prevPairs)) {
      const insert = rules[pair];
      const left = pair[0] + insert;
      const right = insert + pair[1];  
      inc(newPairs[step], left, count);
      inc(newPairs[step], right, count);
      inc(letterCount, insert, count);
    }
    
    log('step', step, letterCount);
  }

  log(letterCount);
  return letterCount[mostUsed] - letterCount[leastUsed];

  // return JSON.stringify(totals);
}

export async function part3(input) {

  /*
    0: NN
    1: NCN
    2: NBCCN
    3: BBBCNCCN
  */

  const {template, rules} = input;

  const mergeCounts = (left = {}, right = {}) => {
    return Object.values(rules).reduce((acc, key) => {
      const ret = (left[key] ?? 0) + (right[key] ?? 0);
      if (ret) {
        acc[key] = ret;
      }
      return acc;
    }, {});
  };

  const cacheName = (pair, depth) => `./2021/14/cache/${pair}-${depth}.txt`;
  const cacheCountName = (pair, depth) => `./2021/14/cache/${pair}-${depth}-count.json`;

  const calculateAndCache = (pair, depth) => {
    const pairFile = cacheName(pair, depth);
    const countFile = cacheCountName(pair, depth);
    if (fs.existsSync(pairFile) && fs.existsSync(countFile)) return;

    console.log('cache:', pair, depth);
    const f = fs.createWriteStream(pairFile, {autoClose: true});
    const ret = calculate(pair, depth, input.rules, f);
    f.end();
    fs.writeFileSync(countFile, JSON.stringify(ret.counts, undefined, 2), 'utf-8');
    return {counts: ret.counts};
  };
  
  const pairIterator = async function*(template, depth) {
    const pairs = [];
    for(let i = 0; i < template.length - 1; i++) {
      const pair = template.slice(i, i+2);
      pairs.push(pair);
    }
    console.log(pairs);
    
    let previous = '';
    for(let i = 0; i < pairs.length; i++) {
      // log('read', pairs[i], depth);
      const stream = fs.createReadStream(cacheName(pairs[i], depth), 'utf-8');
        
      let removeFirst = i > 0;
      let cid = 0;
      for await (const chunk of stream) {        
        // if (cid === 0) {
        console.log('chunk', pairs[i], cid, previous, chunk.slice(0,5));
        // }
        previous = previous + (i > 0 && cid === 0 ? chunk.slice(1) : chunk);
        removeFirst = false;
        for(let i = 0; i < previous.length-1; i++) {
          yield previous.slice(i, i+2);
        }
        previous = chunk[chunk.length -1];
        cid++;
      }
      // yield previous + pairs[i][1];
      // console.log('p', previous + pairs[i][1]);
      stream.close();
    }
    
    // yield 'WW';
  };
  // 2188189693530
  // 2188189693529

  const countCache = {};
  const getCounts = (pair, depth) => {
    if (countCache[pair]) return countCache[pair];
    const ret = JSON.parse(fs.readFileSync(cacheCountName(pair, depth), 'utf-8'));
    countCache[pair] = ret;
    return ret;
  };

  let totals = {};

  const getChain = function(pair, depth) {
    return fs.readFileSync(cacheName(pair, depth), 'utf-8');
  };

  const CACHE_DEPTH = 20;
  // const counts = {};
  for(let pair of Object.keys(rules)) {    
    let ret = calculateAndCache(pair, CACHE_DEPTH);    
  }

  // try to cache at CACHE_DEPTH*2
  let p2 = 0;
  let numRules = Object.keys(rules).length;
  for(let pair of Object.keys(rules)) {
    let totals = {};
    console.log('2nd cache', p2++, numRules);
    if (fs.existsSync(cacheCountName(pair, CACHE_DEPTH*2))) continue;

    const c2 = fs.createWriteStream(cacheName(pair, CACHE_DEPTH*2));
    for await (let innerPair of pairIterator(pair, CACHE_DEPTH)) {
      // const innerStats = calculateAndCache
      let innerTotal = getCounts(innerPair, CACHE_DEPTH);
      totals = mergeCounts(totals, innerTotal);
      c2.write(innerPair[0]);
    }
    totals[pair[1]] = (totals[pair[1]] ?? 0) + 1;
    c2.write(pair[1]);
    c2.end();

    fs.writeFileSync(cacheCountName(pair, CACHE_DEPTH*2), JSON.stringify(totals, undefined, 2));
  }
  
  

  console.log('n-5c', 'BNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNB'.split('').reduce((acc, c) => {
    acc[c] = (acc[c] ?? 0) + 1;
    return acc;
  },{}));

  // let counts = {};
  let t = '';
  // let c = 0;
  // const chainStream = fs.createWriteStream(cacheName('final', CACHE_DEPTH*2), 'utf-8');
  // for await (let pair of pairIterator(template, CACHE_DEPTH)) {
  //   totals = mergeCounts(totals, getCounts(pair, CACHE_DEPTH));
  //   c++;
  //   if (c % 100000 === 0) {
  //     console.log(c);
  //   }
  //   // process.stdout.write(pair + '-');
  //   // process.stdout.write(pair[0]);
  //   // t += pair[0];
  //   // const chain = getChain(pair, CACHE_DEPTH);
  //   // chainStream.write(chain.slice(0, -1));
  //   // c += chain.length;
  // }

  totals = {};
  for(let i = 0; i < template.length - 1; i++) {
    const pair = template.slice(i, i +2);
    const c = getCounts(pair, CACHE_DEPTH*2);
    console.log('total', pair, c);
    totals = mergeCounts(totals, c);
  }

  const lastChar = template[template.length - 1];
  // totals[lastChar] = totals[lastChar] + 1;
  // chainStream.write(lastChar);
  // chainStream.close();
  // console.log('\nlength', c);
  // console.log(t + lastChar);
  // 1: NBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBCCNBCNCCNBBNBNBBCNCCNBBBCCNBCNCCNBBNBBNBBNBBNBBNBNBBNBBNBBNBBNBBCNCCNBBBCCNBCNCCNBBNBBNBBBNBBNBBCCNBCNCCNBBNBNBBCNCCNBBBCCNBCNCCN
  // 3: NBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBNBBCCNBCNCCNBBNBNBBCNCCNBBBCCNBCNCCNBBNBBNBBNBBNBBNBNBBNBBNBBNBBNBBCNCCNBBBCCNBCNCCNBBNBBNBBBNBBNBBCCNBCNCCNBBNBNBBCNCCNBBBCCNBCNCCN

  // NBCCNBBBCBHCB
  // NBBBCNCCNBBNBNBBCHBHHBCHB
  // NBBBCNCCNBBNBNBBCHBHHBCHB
  // process.stdout.write('B');
  console.log();

  // a: 2192006717084
  // e: 2192039569602

  // for(let i =0; i < template.length - 1; i++) {
  //   const pair = template.slice(i, i+2);
  //   totals = mergeCounts(totals, counts[pair]);
  // }
  // log('top-totals', totals);



  const ruleCount = Object.entries(rules).reduce((acc, [pair, insert]) => {
    acc[insert] = (acc[insert] ?? 0) + 1;
    return acc;
  }, {});
  const w = Object.entries(ruleCount).sort((l, r) => l[1] - r[1]);
  const leastUsed = w[0][0];
  const mostUsed = w[w.length - 1][0];
  log('least', w[0][0]);
  log('most ', w[w.length - 1][0]);

  log(totals);
  log(mostUsed, totals[mostUsed]);
  log(leastUsed, totals[leastUsed]);
  const diff = totals[mostUsed] - totals[leastUsed];

  // log(sumOf(Object.values(totals)));

  return  diff;
  
  // return 'done';
  // const {template, rules} = input;
  // log(input);
  // // log(calculate('NN', 20, input.rules));

  // log(0, 2);
  // const totalLength = range(1, 3).reduce((sum, depth) => {
  //   let s = sum + (sum - 1);
  //   log(depth, String(s));
  //   return s;
  // }, 2);

  // let prev = template[0];
  // let next = template[1];
  // const counts = {};
  // for(let i = 0; i < totalLength - 2; i++) {
    
  //   const insert = rules[prev + next];
  //   log(i, prev, next, insert);
  //   counts[insert] = (counts[insert] ?? 0) + 1;
  //   // prev = insert;
  //   next = insert;

  // }
  // log('counts', counts);
  
  // // 6597069766657
  // // 2199023255553
  // return String(totalLength);

  // const {rules} = input;
  // const paths = [
  //   ['NN', 'CN', 'CN'],
  //   ['NN', 'NC', 'NB'],    
  // ];
  // const MAX_DEPTH = 3;

  // const cache = {};

  // const mergeCounts = (left = {}, right = {}) => {
  //   return Object.values(rules).reduce((acc, key) => {
  //     const ret = (left[key] ?? 0) + (right[key] ?? 0);
  //     if (ret) {
  //       acc[key] = ret;
  //     }
  //     return acc;
  //   }, {});
  // };

  // for(let path of paths) {
  //   let local = {};
  //   for(let i = path.length - 2; i >= 0; i--) {
  //     const localPair = path[i];
  //     cache[localPair] = (cache[localPair] ?? []);
  //     local = mergeCounts(local, {[rules[localPair]]: 1});
  //     log(i, localPair, local);

  //     const idx = MAX_DEPTH - i;
  //     cache[localPair][idx] = mergeCounts(cache?.[localPair]?.[idx], local);
  //   }
  //   log('==', path[0], cache[path[0]], path);
  // }
  // log('cache', cache);
  
  // return 4;
}

export function part2(input) {
  return part3_lightbulb(input);

  // const {template, rules} = input;
  // // const {rules} = input;
  // // const template = 'NN';
  // // const counts = {};

  // const ruleCount = Object.entries(rules).reduce((acc, [pair, insert]) => {
  //   acc[insert] = (acc[insert] ?? 0) + 1;
  //   return acc;
  // }, {});

  // const w = Object.entries(ruleCount).sort((l, r) => l[1] - r[1]);
  // const leastUsed = w[0][0];
  // const mostUsed = w[w.length - 1][0];
  // log('least', w[0][0]);
  // log('most ', w[w.length - 1][0]);

  // log(Object.entries(rules).sort((l, r) => l[0].localeCompare(r[0])));

  // let sumMost = 0;
  // let sumLeast = 0;
  // let code = template;


  // const refCount = 'NBCCNBBBCBHCB'.split('').reduce((acc, c) => {
  //   acc[c] = (acc[c] ?? 0) +1 ;
  //   return acc;
  // },{});
  // log('ref', 2, refCount);

  // // const counts = template.split('').reduce((acc, c) => {
  // //   acc[c] = (acc[c] ?? 0) + 1;
  // //   return acc;
  // // }, {});
  // const counts = {};
  
  // let stack = [];
  // for(let i = 0; i < code.length - 1; i++) {
  //   const pair = code.slice(i, i +2);
  //   stack.push({pair, path: [pair], depth: 0});
  //   // const insert = rules[pair];
  //   // counts[insert] = (counts[insert] ?? 0) + 1;     
  // }

  // const cache = {};
  // const MAX_DEPTH = 10;  

  // const mergeCounts = (left = {}, right = {}) => {
  //   return Object.values(rules).reduce((acc, key) => {
  //     const ret = (left[key] ?? 0) + (right[key] ?? 0);
  //     if (ret) {
  //       acc[key] = ret;
  //     }
  //     return acc;
  //   }, {});
  // };

  // let bottom = '';
  // let b = 0;
  // let lastDepth = 0;
  // while(stack.length > 0) {
  //   // log(stack.length);
  //   const {pair, path, w, depth} = stack.pop();
  //   const insert = rules[pair];
  //   // log(depth);
  //   if (depth > lastDepth) {
  //     lastDepth = depth;
  //     // log('depth', depth);
  //     // log('depth', depth, lastDepth);
  //   }
    
  //   const rem = MAX_DEPTH - depth;
  //   // log(':', depth, pair, rules[pair], rem,  path);
  //   if (depth >= MAX_DEPTH) {

  //     // let local = {};
  //     // for(let i = path.length - 2; i >= 0; i--) {
  //     //   const localPair = path[i];
  //     //   cache[localPair] = (cache[localPair] ?? []);
  //     //   local = mergeCounts(local, {[rules[localPair]]: 1});
  //     //   log(i, localPair, local);

  //     //   const d = depth - i;
  //     //   const idx = i+1;
  //     //   cache[localPair][idx] = mergeCounts(cache?.[localPair]?.[idx], local);
  //     //   log('c', depth, cache[localPair][idx]);
  //     // }
  //     // log('==',pair, path[0], cache[path[0]], path);
  //     counts[pair[0]] = (counts[pair[0]] ?? 0) + 1;
  //     // counts[pair[1]] = (counts[pair[1]] ?? 0) + 1;
  //     b += 1;
  //     if (b % 100000 === 0) {
  //       log(b);
  //     }
      
  //     // bottom += pair + '-';
  //     continue;
  //   }
    

  //   // counts[insert] = (counts[insert] ?? 0) + 1;

  //   const left = pair[0] + insert;
  //   const right = insert + pair[1];

  //   if (!cache?.[pair]?.[MAX_DEPTH - depth]) {
      
  //     stack.push({
  //       pair: insert + pair[1], 
  //       path: [...path, right],
  //       depth: depth + 1,
  //       // w: mergeCounts(w, {[insert]: 1})
  //     });
      
  //     stack.push({
  //       pair: pair[0] + insert, 
  //       path: [...path, left],
  //       depth: depth + 1, 
  //       // w: mergeCounts(w, {[insert]: 1})
  //     });
  //   }
  //   // lastDepth = depth;
  // }
  // counts[template[template.length - 1]] = (counts[template[template.length - 1]] ?? 0) + 1;
  // console.log();
  // console.log(cache);
  // console.log(bottom);
  // console.log();
  
  // let mergeSum = {};
  // for(let i = 0; i < code.length - 1; i++) {
  //   const pair = code.slice(i, i +2);
  //   log('ms', pair, cache[pair]);
  //   // mergeSum = mergeCounts(mergeSum, cache[pair][MAX_DEPTH]);
  //   // recurse(pair);
  //   // stack.push({pair, depth: 1});
  //   // const insert = rules[pair];
  //   // counts[insert] = (counts[insert] ?? 0) + 1;     
  // }
  // log('mergeSum', mergeSum);

  // // const recurse = (pair, counts, remaining)  => {
  // //   if (remaining === 0) return counts;

  // //   if (cache?.[pair]?.[remaining]) {
  // //     return cache[pair][remaining];
  // //   }
  // //   const insert = rules[pair];
  // //   const left = recurse(pair[0] + insert, counts, remaining - 1);
  // //   const right = recurse(insert + pair[1], counts, remaining - 1);
  // //   return mergeCounts({
  // //     [pair[0]]: 1, 
  // //     [pair[1]]: 1
  // //   }, mergeCounts(left, right));
  // // };

  
  // // for(let i = 0; i < code.length - 1; i++) {
  // //   const pair = code.slice(i, i +2);
  // //   recurse(pair);
  // //   // stack.push({pair, depth: 1});
  // //   // const insert = rules[pair];
  // //   // counts[insert] = (counts[insert] ?? 0) + 1;     
  // // }

  // log(counts);
  // log(mostUsed, counts[mostUsed]);
  // log(leastUsed, counts[leastUsed]);
  // const diff = counts[mostUsed] - counts[leastUsed];

  // log(sumOf(Object.values(counts)));

  // return diff;

  

  // // let code = template;
// 
  // // let list = template.split('').map(x => ({c: x, next: null}));
  // // list.forEach((n, i) => n.next = list[i+1]);
  // 
  // // const counts = template.split('').reduce((acc, c) => {
  // //   acc[c] = (acc[c] ?? 0) + 1;
  // //   return acc;
  // // }, {});
// 
  // // let head = list[0];
  // // for(let step = 0; step < 10; step++) {  
  // //   log(step);
  // //   let node = list[0];
  // //   while(node.next != null) {
  // //     const pair = node.c + node.next.c;
  // //     const rule = rules.find(x => x.from === pair);
  // //     counts[rule.to] = (counts[rule.to] ?? 0) + 1;
  // //     const n = node.next;
  // //     const newNode = {c: rule.to, next: node.next};
  // //     node.next = newNode;
  // //     node = n;
  // //   }
  // // }
// 
  // // console.log(counts);
  // // const k = Array.from(Object.entries(counts)).sort((l, r) => l[1] - r[1]);
  // // const min = k[0][1];
  // // const max = k[k.length - 1][1];
  // // return max - min;
}    
