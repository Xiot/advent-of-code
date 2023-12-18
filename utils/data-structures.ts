export class MinHeap<T> {
  data: T[];
  private priorityAccessor: (item: T) => number;

  constructor(priorityAccessor: (item: T) => number) {
    this.data = [];
    this.priorityAccessor = priorityAccessor;
  }

  push(value: T) {
    this.data.push(value);
    if (this.data.length > 0) {
      this.bubbleUp(this.data.length - 1);
    }
  }

  pop() {
    const value = this.data[0];
    this.data[0] = this.data[this.data.length - 1];
    this.data.pop();
    this.bubbleDown(0);
    return value;
  }
  get length() {
    return this.data.length;
  }

  private bubbleUp(index) {
    const value = this.priorityAccessor(this.data[index]);

    while (true) {
      let parentIndex = Math.floor((index - 1) / 2);
      if (parentIndex < 0) return;

      const parent = this.data[parentIndex];
      if (this.priorityAccessor(parent) <= value) {
        return;
      }

      swap(this.data, index, parentIndex);
      index = parentIndex;
    }
  }
  private bubbleDown(index: number) {
    while (2 * index + 1 < this.data.length) {
      const value = this.data[index];
      const valueOrder = this.priorityAccessor(value);
      const leftIndex = 2 * index + 1;
      const rightIndex = 2 * index + 2;
      const left = this.data[leftIndex];
      const right = this.data[rightIndex];
      const leftOrder = this.priorityAccessor(left);
      const rightOrder = right == null ? Number.MAX_SAFE_INTEGER : this.priorityAccessor(right);

      const smallerIndex = leftOrder <= rightOrder ? leftIndex : rightIndex;

      if (valueOrder < leftOrder && valueOrder < rightOrder) break;

      swap(this.data, index, smallerIndex);
      index = smallerIndex;
    }
  }
}
function swap<T>(arr: T[], l: number, r: number) {
  let temp = arr[l];
  arr[l] = arr[r];
  arr[r] = temp;
}

// TODO: Should be done with a heap
export class PriorityQueue<T> {
  private data: T[];
  private mode: 'min' | 'max';
  private priorityAccessor: (item: T) => number;

  constructor(priorityAccessor: (item: T) => number, mode: 'min' | 'max' = 'min') {
    this.data = [];
    this.priorityAccessor = priorityAccessor;
    this.mode = mode;
  }

  push(value: T) {
    this.data.push(value);
  }

  pop(): T {
    this.sort();
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

type Node<T> = {
  value: T;
  originalIndex: number;
  next?: Node<T>;
  prev?: Node<T>;
};

export function createCircle<T>(initial: T[]) {
  const originalIndexes = [];

  let head: Node<T> = { value: initial[0], originalIndex: 0 };
  originalIndexes[0] = head;
  let current = head;

  for (let i = 1; i < initial.length; i++) {
    const newNode = { value: initial[i], originalIndex: i, prev: current };
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
    get head() {
      return head;
    },
    set head(node: Node<T>) {
      head = node;
    },

    get tail() {
      return tail;
    },
    get length() {
      return length;
    },

    indexOf(node: Node<T>) {
      let cur = head;
      let index = 0;
      while (cur !== node) {
        index++;
        cur = cur.next;
      }
      return index;
    },
    findNode(fn: (node: Node<T>) => boolean): Node<T> | undefined {
      let cur = head;
      if (fn(cur)) return cur;
      cur = cur.next;
      while (cur !== head) {
        if (fn(cur)) return cur;
        cur = cur.next;
      }
      return undefined;
    },
    values() {
      const values: T[] = [];
      let cur = head;
      values.push(cur.value);
      cur = head.next;
      while (cur.originalIndex !== head.originalIndex) {
        values.push(cur.value);
        cur = cur.next;
      }
      return values;
    },
    remove(node: Node<T>) {
      const oldPrev = node.prev;
      const oldNext = node.next;

      oldPrev.next = oldNext;
      oldNext.prev = oldPrev;
      length--;
    },
    insertAfter(target: Node<T>, node: Node<T>) {
      const oldTNext = target.next;
      target.next = node;
      node.prev = target;

      node.next = oldTNext;
      oldTNext.prev = node;
      length++;
      return node;
    },
    walk(node: Node<T>, steps: number) {
      steps = Math.sign(steps) * (Math.abs(steps) % length);

      const stepFn = steps < 0 ? n => n.prev : n => n.next;

      let cur = node;
      for (let i = 0; i < Math.abs(steps); i++) {
        cur = stepFn(cur);
      }
      return cur;
    },
  };
}
