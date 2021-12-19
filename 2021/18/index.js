import {log, byLine, permutations} from '../../utils';

export const parse = byLine(line => parseLine(line));

export function part1(input) {

  const explode = (tree, node, index) => {

    const findLeft = (tree, start) => {
      if (start <= 0) return null;
      const {node} = nodeAtIndex(tree, start - 1);
      const side = isNumber(node.right) ? 'right' : 'left';
      return {
        node,
        side,
        value: node[side]
      };
    };

    const findRight = (tree, start) => {      
      const info = nodeAtIndex(tree, start + 1);
      if (!info) return null;

      const side = isNumber(info.node.left) ? 'left' : 'right';
      return {
        node: info.node,
        side,
        value: info.node[side]
      };
    };

    const left = findLeft(tree, index);
    const right = findRight(tree, index);

    if (left === node) {
      throw new Error('left === node');
    }
    if (right === node) {
      throw new Error('right === node');
    }

    if (left) {      
      left.node[left.side] = left.value + node.left;
    }

    if (right) {
      right.node[right.side] = right.value + node.right;
    }


    const parent = node.parent;
    const mySide = parent.left === node ? 'left' : parent.right === node ? 'right' : null;
    if (mySide == null) {
      throw new Error('cant find side');
    }
    parent[mySide] = 0;

    return {
      op: 'explode',
      node,
      index,
      tree,
    };

  };

  const split = (tree, node, side, index) => {

    const value = node[side];
    const [l, r] = [Math.floor(value / 2), Math.ceil(value / 2)];

    node[side] = {
      left: l,
      right: r,
      depth: node.depth + 1,
      parent: node
    };

    return {
      op: `split-${side}`,
      tree: tree,
    };

  };

  const reduce = (tree) => {
    let index = 0;
    let info;

    const clone = cloneTree(tree);


    while((info = nodeAtIndex(clone, index)) != null) {
      const {node, depth} = info;
      if (depth > 4) {
        return explode(clone, node, index);
      }
      index++;
    }

    index = 0;
    while((info = nodeAtIndex(clone, index)) != null) {
      const {node, depth} = info;
      if (node.left >= 10) {
        return split(clone, node, 'left', index);
      } else if (node.right >= 10) {
        return split(clone, node, 'right', index);
      }
    
      index++;
    }


    return {
      complete: true,
      tree: clone
    };
  };
  

  const logResult = ret => {
    log(ret.op.padEnd(10), printTree(ret.tree));
  };

  const reduceAll = tree => {
    while(true) {
      const ret = reduce(tree);
      if (ret.complete) return ret.tree;
      tree = ret.tree;
    }
  };

  const add = (left, right) => {
    const root = {
      depth: 0,
      left,
      right,
    };
    left.parent = root;
    right.parent = root;

    const result = reduceAll(root);

    return result;

  };

  const magitudeOf = tree => {

    if (isNumber(tree)) return tree;

    const left = isNumber(tree.left) ? tree.left : magitudeOf(tree.left);
    const right = isNumber(tree.right) ? tree.right : magitudeOf(tree.right);

    const local = isNumber(left) != null && right != null
      ? left * 3 + right * 2
      : left || right;
    
    return local;

  };

  const addMultiple = lines => lines.reduce((sum, line) => add(sum, line));

  const tree = addMultiple(input);  
  log('FINAL', printTree(tree));

  return magitudeOf(tree);

}

export function part2(input) {

  const explode = (tree, node, index) => {

    const findLeft = (tree, start) => {
      if (start <= 0) return null;
      const {node} = nodeAtIndex(tree, start - 1);
      const side = isNumber(node.right) ? 'right' : 'left';
      return {
        node,
        side,
        value: node[side]
      };
    };

    const findRight = (tree, start) => {      
      const info = nodeAtIndex(tree, start + 1);
      if (!info) return null;

      const side = isNumber(info.node.left) ? 'left' : 'right';
      return {
        node: info.node,
        side,
        value: info.node[side]
      };
    };

    const left = findLeft(tree, index);
    const right = findRight(tree, index);

    if (left === node) {
      throw new Error('left === node');
    }
    if (right === node) {
      throw new Error('right === node');
    }

    if (left) {      
      left.node[left.side] = left.value + node.left;
    }

    if (right) {
      right.node[right.side] = right.value + node.right;
    }


    const parent = node.parent;
    const mySide = parent.left === node ? 'left' : parent.right === node ? 'right' : null;
    if (mySide == null) {
      throw new Error('cant find side');
    }
    parent[mySide] = 0;

    return {
      op: 'explode',
      node,
      index,
      tree,
    };

  };

  const split = (tree, node, side, index) => {

    const value = node[side];
    const [l, r] = [Math.floor(value / 2), Math.ceil(value / 2)];

    node[side] = {
      left: l,
      right: r,
      depth: node.depth + 1,
      parent: node
    };

    return {
      op: `split-${side}`,
      tree: tree,
    };

  };

  const reduce = (tree) => {
    let index = 0;
    let info;

    const clone = cloneTree(tree);


    while((info = nodeAtIndex(clone, index)) != null) {
      const {node, depth} = info;
      if (depth > 4) {
        return explode(clone, node, index);
      }
      index++;
    }

    index = 0;
    while((info = nodeAtIndex(clone, index)) != null) {
      const {node, depth} = info;
      if (node.left >= 10) {
        return split(clone, node, 'left', index);
      } else if (node.right >= 10) {
        return split(clone, node, 'right', index);
      }
    
      index++;
    }


    return {
      complete: true,
      tree: clone
    };
  };
  
  const logResult = ret => {
    log(ret.op.padEnd(10), printTree(ret.tree));
  };

  const reduceAll = tree => {
    while(true) {
      const ret = reduce(tree);
      if (ret.complete) return ret.tree;
      tree = ret.tree;
    }
  };

  const add = (left, right) => {
    const root = {
      depth: 0,
      left,
      right,
    };
    left.parent = root;
    right.parent = root;

    const result = reduceAll(root);

    return result;

  };

  const magitudeOf = tree => {

    if (isNumber(tree)) return tree;

    const left = isNumber(tree.left) ? tree.left : magitudeOf(tree.left);
    const right = isNumber(tree.right) ? tree.right : magitudeOf(tree.right);

    const local = isNumber(left) != null && right != null
      ? left * 3 + right * 2
      : left || right;
    
    return local;

  };

  // const pairs = permutations(input);

  const pairs = [];
  for(let i = 0; i < input.length; i++) {
    for(let j = 0; j < input.length; j++) {
      pairs.push([input[i], input[j]]);
    }
  }

  let max = 0;
  for(let items of pairs) {
    const tree = add(items[0], items[1]);
    const magnitude = magitudeOf(tree);
    max = Math.max(max, magnitude);
  }
  return max;

}

function printAtIndex(tree, index) {
  log(index, stripBranches(nodeAtIndex(tree, index)?.node));
}

function printNodes(tree) {

  log('NODES --------');
  Array.from(iterateInOrder(tree)).forEach((x, i) => log(i, {...stripBranches(x.node), depth: x.depth}));
  log('--------\n');
}

function* iterateInOrder(tree) {
  let i = 0;
  let ret = null;
  while((ret = nodeAtIndex(tree, i++)) != null) {
    yield ret;
  }
}

function stripBranches(n) {
  if (n == null) return null;
  
  const node = {};
  if (isNumber(n.left)) {
    node.left = n.left;
  }
  if (isNumber(n.right)) {
    node.right = n.right;
  }
  return node;
};

const cloneTree = (node, parent = null) => {
  if (isNumber(node)) { return node; }
  const cloned = {
    parent,
  };
  cloned.left = cloneTree(node.left, cloned);
  cloned.right = cloneTree(node.right, cloned);
  return cloned;
};

function nodeAtIndex(root, target) {

  let index = -1;
  let visited = new Map();

  const recurse = (node, depth) => {
    if (node == null) return null;
    if (isNumber(node.left) && !visited.get(node)) {
      visited.set(node, true);
      index += 1;
      // log('recurse.left', index, node.left, index === target);
      if (index === target) {
        return {node, depth};
      }
      // return null;
    } else {
      const ret = recurse(node.left, depth + 1);
      if (ret) return ret;
    }

    if (isNumber(node.right) && !visited.get(node)) {
      visited.set(node, true);
      index += 1;
      // log('recurse.right', index, node.right, index === target);
      if (index === target) {
        return {node, depth};
      }
      // return null;
    } else {
      const ret = recurse(node.right, depth + 1);
      if (ret) return ret;
    }
    return null;
  };
  return recurse(root, 1);

  // if (!isNumber())

  // let current = -1;
  // const stack = [root];
  // while(stack.length > 0) {
  //   const node = stack.pop();
  //   log('nai', isNumber(node.left), isNumber(node.right), node);

  //   if (typeof node.left === 'number') {
  //     if (current === target) {
  //       return node;
  //     }
  //     current++;
  //   } else {
  //     stack.unshift(node.left);
  //   }

  //   if (typeof node.right === 'number') {
  //     if (current === target) {
  //       return node;
  //     }
  //     current ++;
  //   } else {
  //     stack.unshift(node.right);
  //   }
  // }
  // return -1;
}

function printTree(root) {
  if (typeof root === 'number') return String(root);
  return '[' + printTree(root.left) + ',' + printTree(root.right) + ']';
};

function parseLine(line) {
  const parsePair = (reader, depth = 0, parent = null) => {
    if (reader.eof) { return null; }

    if (reader.isNumber()) {
      return reader.readNumber();      
    }

    const current = {
      depth,
      parent,
    };
    reader.read(); // open
    current.left = parsePair(reader, depth +1, current);
    reader.read(); // comma
    current.right = parsePair(reader, depth + 1, current);
    reader.read(); // close    
    // pairs.unshift(current);
    return current;
  };  

  const reader = createReader(line);
  const root = parsePair(reader);
  
  return root;
}

function isNumber(digit) {return !isNaN(digit);};
function createReader(text) {
  let index = 0;
  return {
    get eof() {return index >= text.length;},
    get length() { return text.length;},
    get index() { return index; },
    current() {
      return text[index];
    },
    peek() {
      return text[index +1];
    },
    read() {
      return text[index++];
    },
    isNumber() {
      return isNumber(this.current());      
    },
    isOpen() {
      return this.current() === '[';
    },
    isClose() {
      return this.current() === ']';
    },
    isComma() {
      return this.current() === ',';
    },
    readNumber() {
      let digits = '';
      while(isNumber(this.current())) {
        digits += this.read();
      }
      return parseInt(digits);
    }
  };
};