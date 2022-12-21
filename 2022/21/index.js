
import { autoParse, log, byLine } from "../../utils";

const OP_RE = /([a-z]+): ([a-z]+) (.) ([a-z]+)/;
const VALUE_RE = /([a-z]+): (\d+)/;
export const parse = byLine(line => {
  if (OP_RE.test(line)) {
    const [,name, leftName, op, rightName] = OP_RE.exec(line);
    return {
      name,
      leftName,
      op,
      rightName
    };
  } else {
    const [,name, value] = VALUE_RE.exec(line);
    return {
      name,
      value: parseInt(value)
    };
  }
});

export function part1(input) {

  const cache = input.reduce((acc, cur) => {
    return {
      ...acc,
      [cur.name]: cur
    };
  }, {});

  let remaining = input.filter(x => !('value' in x)).length;

  while(remaining > 0) {
    
    for(let i = 0; i < input.length; i++) {
      const monkey = input[i];
      if ('value' in monkey) continue;

      const {leftName, op, rightName} = monkey;
      log(leftName, op, rightName);

      const left = cache[leftName].value;
      const right = cache[rightName].value;
      if (left != null && right != null) {
        monkey.value = calc(left, op, right);
        remaining--;
      }
    }
  }
  const root = cache['root'];
  return root.value;
}

function calc(left, op, right) {
  switch(op) {
  case '+': return left + right;
  case '-': return left - right;
  case '/': return left / right;
  case '*': return left * right;
  }
}
function inverse(op) {
  switch(op) {
  case '+': return '-';
  case '-': return '+';
  case '/': return '*';
  case '*': return '/';
  }
}

export function part2(input) {

  const root = input.find(x => x.name === 'root');
  
  const cache = input.reduce((acc, cur) => {
    return {
      ...acc,
      [cur.name]: cur
    };
  }, {});

  function reduceMonkey(name) {
    const node = cache[name];    
    if (node.name === 'humn') {
      return 'humn';
    }

    if (node.value != null) {
      return node.value;
    }

    const left = reduceMonkey(node.leftName);
    const right = reduceMonkey(node.rightName);
    if (typeof left === 'number' && typeof right === 'number') {
      return calc(left, node.op, right);
    }
    return {left: left, op: node.op, right: right};
  }

  let leftNode = reduceMonkey(root.leftName);
  let rightNode = reduceMonkey(root.rightName);
  if (typeof leftNode === 'number') {
    const t = leftNode;
    leftNode = rightNode;
    rightNode = t;
  }

  function print(n) {
    if (typeof n === 'number') return n;
    if (typeof n === 'string') return n;
    return `(${print(n.left)} ${n.op} ${print(n.right)})`;
  }  
  
  function solve(name) {
    if (typeof name === 'number') return name;
    const monkey = cache[name];
    if ('value' in monkey) return monkey.value;

    monkey.value = calc(solve(monkey.leftName), monkey.op, solve(monkey.rightName));
    return monkey.value;
  }


  let r = rightNode;
  let l = leftNode;
  
  let t = leftNode;
  let value = r;

  while(true) {
    log('');
    log('left', print(t.left));
    log('op', t.op);
    log('right', print(t.right));
    log('value', value);
    

    if (t.left === 'humn') {      
      const v = solve(t.right);
      log('solve right', v, t.right);
      t.right = v;

    } else if (t.right === 'humn') {
      const v = solve(t.left);
      log('solve left', v, t.left);
      t.left = v;
    }

    const negOp = inverse(t.op);
    if (typeof t.left === 'number') {
      const v = value;
      if (t.op === '/') {
        value = calc(value, negOp, t.left);
        log('calc.l', v, negOp, t.left,'==', value);
      } else if (t.op === '-') {
        value = -calc(value, '-', t.left);
        log('calc.l', v, '-', t.left,'==', value);
      } else {
        value = calc(value, negOp, t.left);
        log('calc.l', v, negOp, t.left,'==', value);
      }
      
      t = t.right;
    } else if (typeof t.right === 'number') {
      const v = value;
      value = calc(value, negOp, t.right);
      log('calc.l', v, negOp, t.right, '==', value);
      t = t.left;
    }

    if (t.left == null || t.right == null) break;
  }
  
  return value;
}    
