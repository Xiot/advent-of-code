
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