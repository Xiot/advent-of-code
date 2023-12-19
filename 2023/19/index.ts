import { cloneDeep } from 'lodash';
import { byLine, log, sumOf } from '../../utils';
type Input = ReturnType<typeof parse>;

type Workflow = {
  name: string;
  rules: Rule[];
};

type Variable = 'x' | 'm' | 'a' | 's';
type Op = '<' | '>';
type Rule = {
  raw: string;
  condition?: {
    variable: Variable;
    op: Op;
    value: number;
  };
  destination: string;
};

type Part = Record<Variable, number>;

const RE_TOP = /^([^{]+)+{(.+)}/;
const RE_RULE = /^(([xmas])([<>])(\d+):)?(\w+)$/m;
export const parse = (text: string) => {
  const sections = text.split('\n\n');

  const workflowLines = sections[0].split('\n');
  const workflows: Workflow[] = workflowLines.map(line => {
    const [, name, rulesText] = RE_TOP.exec(line);

    const rules = rulesText.split(',').map(ruleText => {
      const [, , variable, op, valueText, dest] = RE_RULE.exec(ruleText);

      if (variable == null) {
        return { raw: ruleText, destination: dest };
      }
      return {
        raw: ruleText,
        condition: {
          variable: variable as Variable,
          op: op as Op,
          value: parseInt(valueText),
        },
        destination: dest,
      };
    });
    return {
      name,
      rules,
    };
  });

  const parts = sections[1].split('\n').map(line => {
    line = line.slice(1, -1);
    return line.split(',').reduce((acc, l) => {
      const [v, value] = l.split('=');
      acc[v] = parseInt(value);
      return acc;
    }, {} as Part);
  });
  return { workflows, parts };
};

export function part1(input: Input) {
  const accepted: Part[] = [];

  for (const part of input.parts) {
    // const part = input.parts[0];
    const result = evaluateWorkflow(part, input.workflows);
    if (result === 'A') {
      log('acc: ', part);
      accepted.push(part);
    }
  }

  const score = sumOf(accepted, p => {
    return p.x + p.m + p.s + p.a;
  });
  return score;
}

type Range = {
  min: number;
  max: number;
};
type VariableRanges = Record<Variable, Range[]>;
type VariableRange = Record<Variable, Range>;

export function part2(input: Input) {
  // const ret = intersectionRanges([
  //   { min: 1, max: 1800 },
  //   { min: 839, max: 4000 },
  // ]);
  // log(ret);
  // return 0;

  const start = input.workflows.find(x => x.name === 'in')!;
  const ret = processChain(start, input.workflows);
  log(ret);

  function count(ret: VariableRanges) {
    function get(variable: Variable) {
      const r = ret[variable][0];
      return r.max - r.min + 1;
    }

    return get('x') * get('m') * get('a') * get('s');
  }

  log(ret.length);
  const total = sumOf(ret, r => count(r.condition));
  return total;
}

type State = {
  variables: VariableRanges;
  workflow: Workflow;
  path: string[];
};
const FULL = { min: 1, max: 4000 };
function processChain(workflow: Workflow, workflows: Workflow[]) {
  let result = { x: [], m: [], a: [], s: [] } as VariableRanges;

  const queue: State[] = [
    {
      workflow,
      variables: { x: [FULL], m: [FULL], a: [FULL], s: [FULL] },
      path: [workflow.name],
    },
  ];
  const seen = new Set<string>();
  const results: { condition: VariableRanges; path: string[] }[] = [];

  while (queue.length > 0) {
    const { workflow, variables, path } = queue.shift();

    const possible = findPossibleRanges(workflow);

    possible.forEach(p => {
      const merged = mergeConditions(variables, p.condition);

      if (p.target === 'A') {
        results.push({ condition: merged, path });
        return;
      }
      if (p.target === 'R') return;
      const target = workflows.find(w => w.name === p.target)!;
      queue.push({ workflow: target, variables: merged, path: [...path, p.target] });
    });
  }
  return results;
}

function mergeConditions(left: VariableRanges, right: VariableRanges): VariableRanges {
  return {
    x: intersectionRanges([...left.x, ...right.x]),
    m: intersectionRanges([...left.m, ...right.m]),
    a: intersectionRanges([...left.a, ...right.a]),
    s: intersectionRanges([...left.s, ...right.s]),
  };
}

function findOutgoing(from: Workflow, workflows: Workflow[]) {
  return workflows.filter(w => {
    return w.rules.some(r => r.destination !== 'R');
  });
}

function findIncoming(workflows: Workflow[], target: string): Workflow[] {
  return workflows.filter(w => {
    return w.rules.at(-1).destination === target;
  });
}

function findPossibleRanges(workflow: Workflow): { target: string; condition: VariableRanges }[] {
  const results = [];

  function add(rr: VariableRanges, variable: Variable, range: Range) {
    const base = cloneDeep(rr);
    base[variable] = addValid(range, base[variable]);
    return base;
  }

  function sub(rr: VariableRanges, variable: Variable, range: Range) {
    const base = cloneDeep(rr);
    const effective = base[variable].length === 0 ? [{ min: 1, max: 4000 }] : base[variable];
    base[variable] = removeInvalid(range, effective);
    return base;
  }

  let agg = { x: [], m: [], a: [], s: [] } as VariableRanges;
  workflow.rules.forEach(r => {
    const local = cloneDeep(agg);
    if (r.condition) {
      const positiveRange =
        r.condition.op === '<' ? { min: 1, max: r.condition.value - 1 } : { min: r.condition.value + 1, max: 4000 };

      const condition = add(local, r.condition.variable, positiveRange);
      agg = sub(agg, r.condition.variable, positiveRange);

      results.push({
        target: r.destination,
        condition,
      });
    } else {
      results.push({
        target: r.destination,
        condition: agg,
      });
    }
  });

  return results;
}

function subRanges2(target: VariableRanges, sub: VariableRanges) {
  return {
    x: sub.x.reduce((acc, cur) => removeInvalid(cur, acc), target.x),
    m: sub.x.reduce((acc, cur) => removeInvalid(cur, acc), target.m),
    a: sub.x.reduce((acc, cur) => removeInvalid(cur, acc), target.a),
    s: sub.x.reduce((acc, cur) => removeInvalid(cur, acc), target.s),
  };
}

// px{a<2006:qkq,m>2090:A,rfg}
function findRange(workflow: Workflow) {
  log('workflow', workflow.name);
  const rr = { x: [], m: [], a: [], s: [] } as VariableRanges;

  function add(variable: Variable, range: Range) {
    rr[variable] = addValid(range, rr[variable]);
    // log('add', variable, range, rr[variable]);
  }
  function sub(variable: Variable, range: Range) {
    const effective = rr[variable].length === 0 ? [{ min: 1, max: 4000 }] : rr[variable];
    rr[variable] = removeInvalid(range, effective);
    // log('sub', variable, range, rr[variable]);
  }

  workflow.rules.forEach(r => {
    if (r.condition) {
      const variable = r.condition.variable;

      if (r.destination === 'A') {
        if (r.condition.op === '>') {
          add(variable, {
            min: r.condition.value + 1,
            max: 4000,
          });
        } else {
          add(variable, {
            min: 1,
            max: r.condition.value,
          });
        }
      } else if (r.destination === 'R') {
        if (r.condition.op === '<') {
          sub(variable, { min: 1, max: r.condition.value });
        } else {
          sub(variable, { min: r.condition.value, max: 4000 });
        }
      }
    } else {
      if (r.destination === 'A') {
        fallthrough(rr, 'x');
        fallthrough(rr, 'm');
        fallthrough(rr, 'a');
        fallthrough(rr, 's');
      }
    }

    // if (r.condition.op === '>') {
    //   valid.push({ min: 1, max: r.condition.value });
    // }
  });
  return rr;
}

function fallthrough(r: VariableRanges, v: Variable) {
  if (r[v].length > 0) return;
  r[v].push({ min: 1, max: 4000 });
}

function combineResults(l: VariableRanges, r: VariableRanges): VariableRanges {
  return {
    x: combineRanges(l.x, r.x),
    m: combineRanges(l.m, r.m),
    a: combineRanges(l.a, r.a),
    s: combineRanges(l.s, r.s),
  };
}

function combineRanges(newRanges: Range[], existing: Range[]): Range[] {
  return [...newRanges, ...existing];
}

function addValid(validRange: Range, existing: Range[]) {
  const sorted = [validRange, ...existing].sort((l, r) => l.min - r.min);

  if (sorted.length === 1) return sorted;

  let cur = sorted[0];
  const result = [];
  for (let i = 1; i < sorted.length; i++) {
    const local = unionRanges(cur, sorted[i]);
    if (local.length === 2) {
      result.push(cur);
      cur = local[1];
    } else {
      cur = local[0];
    }
  }
  result.push(cur);
  return result;
}

function removeInvalid(invalidRange: Range, existing: Range[]) {
  const sorted = [...existing].sort((l, r) => l.min - r.min);

  const result: Range[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const local = subRanges(sorted[i], invalidRange);
    if (local.length === 1) {
      if (rangeEqual(local[0], sorted[i])) {
        result.push(sorted[0]);
      } else {
        result.push(local[0]);
      }
    } else if (local.length === 2) {
      result.push(...local);
    } else if (local.length === 0) {
    }
  }
  return result;
}

function rangeEqual(l: Range, r: Range) {
  return l.min === r.min && l.max === r.max;
}

function intersectionRanges(ranges: Range[]) {
  const sorted = [...ranges].sort((l, r) => l.min - r.min);

  let cur = sorted[0];
  const result: Range[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const ret = getOverlap(cur, sorted[i]);
    if (ret.overlap == null) {
      result.push(cur);
      cur = sorted[i];
    } else {
      cur = ret.overlap;
    }
  }
  result.push(cur);

  return result;
}

function unionRanges(first: Range, second: Range) {
  const result = getOverlap(first, second);
  if (result.overlap == null) return [first, second];
  return [
    {
      min: result.sorted.left.min,
      max: Math.max(first.max, second.max),
    },
  ];
}

function subRanges(first: Range, second: Range) {
  const ret = getOverlap(first, second);

  if (ret.overlap == null) return [first];

  if (first.min >= second.min && first.max <= second.max) {
    return [];
  }

  return [
    {
      min: first.min,
      max: ret.overlap.min - 1,
    },
    {
      min: Math.min(ret.overlap.max + 1, second.max + 1),
      max: first.max,
    },
  ].filter(r => r.min <= r.max);
}

function getOverlap(first: Range, second: Range) {
  const [l, r] = first.min < second.min ? [first, second] : [second, first];
  if (l.max < r.min) return { sorted: { left: l, right: r } };
  return {
    overlap: {
      min: r.min,
      max: Math.min(l.max, r.max),
    },
    sorted: {
      left: l,
      right: r,
    },
  };
}

function evaluateWorkflow(part: Part, workflows: Workflow[]) {
  let current = workflows.find(w => w.name === 'in')!;
  while (true) {
    for (const r of current.rules) {
      const result = evaluateRule(part, r);
      if (result == null) continue;

      if (result === 'A') return 'A';
      if (result === 'R') return 'R';
      current = workflows.find(x => x.name === result);
      break;
    }
  }
}

function evaluateRule(part: Part, rule: Rule) {
  if (rule.condition == null) return rule.destination;

  if (rule.condition.op === '<') {
    if (part[rule.condition.variable] < rule.condition.value) {
      return rule.destination;
    }
  } else {
    if (part[rule.condition.variable] > rule.condition.value) {
      return rule.destination;
    }
  }
  return undefined;
}
