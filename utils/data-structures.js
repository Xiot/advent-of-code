
// TODO: Should be done with a heap
export class PriorityQueue {
  constructor(priorityAccessor, mode = 'min') {
    this.data = [];
    this.priorityAccessor = priorityAccessor;
    this.mode = mode;
  }

  push(value) {
    this.data.push(value);
    this.sort();  
  }

  pop() {
    return this.data.shift();
  }

  sort() {
    const mult = this.mode === 'min' ? 1 : -1;
    this.data.sort((l, r) => mult * (this.priorityAccessor(l) - this.priorityAccessor(r)));
  }
  get length() {
    return this.data.length;
  }
}


export function createCircle(initial) {
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