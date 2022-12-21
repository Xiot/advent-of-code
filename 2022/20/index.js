
import { autoParse, log, byLine } from "../../utils";

export const parse = byLine(line => parseInt(line));


export function part3(input) {
  const ll = createCircle(input);
  const s = ll.originalIndexes[0]; //ll.nodeAt(0);

  const distance = s.value;

  let t = ll.walk(s, s.value);
  if (distance < 0) t = t.prev;
  log('w', s.value, t.value, s === t, t.next === s);

}

export function part1(input) {
  
  const ll = createCircle(input);
  
  for(let i = 0; i < input.length; i++) {

    const node = ll.originalIndexes[i];
    if (node.value === 0) continue;

    // remove node
    // const oldPrev = node.prev;
    // const oldNext = node.next;

    // oldPrev.next = oldNext;
    // oldNext.prev = oldPrev;

    ll.remove(node);

    let target = ll.walk(node.prev, node.value);

    ll.insertAfter(target, node);
    // const oldTNext = target.next;
    // target.next = node;
    // node.prev = target;

    // node.next = oldTNext;
    // oldTNext.prev = node;

    // log(i + 1,'|', ll.values().join(', '));
  }
  
  const root = ll.findNode(n => n.value === 0);
  const i1000 = ll.walk(root, 1000);
  const i2000 = ll.walk(i1000, 1000);
  const i3000 = ll.walk(i2000, 1000);

  return i1000.value + i2000.value + i3000.value;
}

export function part2(input) {

  const KEY = 811589153;
  const ll = createCircle(input.map(x => x * KEY));
  
  for(let r = 0; r < 10; r++) {
    log('round', r+1);
    for(let i = 0; i < input.length; i++) {

      const node = ll.originalIndexes[i];
      if (node.value === 0) continue;

      // remove node
      ll.remove(node);

      const distance = node.value;
      log(i, distance);

      let target = ll.walk(node.prev, distance);

      ll.insertAfter(target, node);    
    }
  }
  
  const root = ll.findNode(n => n.value === 0);
  const i1000 = ll.walk(root, 1000);
  const i2000 = ll.walk(i1000, 1000);
  const i3000 = ll.walk(i2000, 1000);

  return i1000.value + i2000.value + i3000.value;
}

function createCircle(initial) {
  const originalIndexes = [];

  let head = ({value: initial[0], originalIndex: 0});
  originalIndexes[0] = head;
  let current = head;

  for(let i = 1; i < initial.length; i++) {
    const newNode = ({value: initial[i], originalIndex: i, prev: current});
    originalIndexes[i] = newNode;

    current.next = newNode;
    current = newNode;
  }
  let tail = current;
  tail.next = head;
  head.prev = tail;

  let length = initial.length;  

  return {
    originalIndexes,
    get head() {return head;},
    set head(node) {head = node;},

    get tail() {return tail;},
    get length() {
      let l = 1;
      let cur = head.next;
      while(cur !== head) {
        l++;
        cur = cur.next;
      }
      return l;
    },
    // normalizeIndex,
    // nodeAt(raw) {
    //   const index = normalizeIndex(raw); //(raw + length) % length;
    //   // log('nodeAt', raw, index);
    //   let cur = head;
    //   if (index === 0) return cur;
    //   for(let i = 1; i <= index; i++) {
    //     cur = cur.next;
    //   }
    //   return cur;
    // },
    indexOf(node) {
      let cur = head;
      let index = 0;
      while(cur !== node) {
        index++;
        cur = cur.next;
      }
      return index;
    },
    findNode(fn) {
      let cur = head;
      if (fn(cur)) return cur;
      cur = cur.next;
      while(cur !== head) {
        if (fn(cur)) return cur;
        cur = cur.next;
      }
      return undefined;
    },
    values() {
      const values = [];
      let cur = head;
      values.push(cur.value);
      cur = head.next;
      while(cur.originalIndex !== head.originalIndex) {
        values.push(cur.value);
        cur = cur.next;
      }
      return values;
    },
    remove(node) {
      const oldPrev = node.prev;
      const oldNext = node.next;

      oldPrev.next = oldNext;
      oldNext.prev = oldPrev;
      length--;
    },
    insertAfter(target, node) {
      const oldTNext = target.next;
      target.next = node;
      node.prev = target;

      node.next = oldTNext;
      oldTNext.prev = node;
      length++;
    },
    walk(node, steps) {

      steps = Math.sign(steps) * (Math.abs(steps) % length);

      const stepFn = steps < 0 ? n => n.prev : n => n.next;

      let cur = node;
      for(let i = 0; i < Math.abs(steps); i++) {
        cur = stepFn(cur);
      }
      return cur;
    }
  };
}