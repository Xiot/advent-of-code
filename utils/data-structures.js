
// TODO: Should be done with a heap
export class PriorityQueue {
  constructor(priorityAccessor) {
    this.data = [];
    this.priorityAccessor = priorityAccessor;
  }

  push(value) {
    this.data.push(value);
    this.sort();  
  }

  pop() {
    return this.data.shift();
  }

  sort() {
    this.data.sort((l, r) => this.priorityAccessor(l) - this.priorityAccessor(r));
  }
  get length() {
    return this.data.length;
  }
}