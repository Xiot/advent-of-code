import { byLine, log } from '../../utils';
type Input = ReturnType<typeof parse>;

export const parse = (text: string) => {
  const mods: Record<string, IModule> = {};

  for (const line of text.split('\n')) {
    const [mod, targetText] = line.split(' -> ');
    const name = mod === 'broadcaster' ? mod : mod.slice(1);
    const type = mod === 'broadcaster' ? 'b' : mod[0];

    const targets = targetText.split(', ');

    mods[name] = createModule(type, name, targets);
  }

  const conConnections: Record<string, []> = {};
  const cons = Object.values(mods).filter(x => x instanceof Conjenction) as Conjenction[];
  for (const mod of Object.values(mods)) {
    const targets = mod.targets.filter(t => {
      return mods[t] instanceof Conjenction;
    });
    targets.forEach(t => {
      const con = mods[t] as Conjenction;
      con.state[mod.name] = 'low';
    });
  }

  return mods;
};

type QueueItem = { source: string; target: string; signal: Signal };

export function part1(input: Input) {
  const queue: QueueItem[] = [];

  const counts = {
    low: 0,
    high: 0,
  } satisfies Record<Signal, number>;

  for (let i = 0; i < 1000; i++) {
    log(`\nButton: ${i + 1}\n-------------------`);
    queue.push({ source: 'button', target: 'broadcaster', signal: 'low' });
    while (queue.length > 0) {
      const pulse = queue.shift();
      log(`${pulse.source} ${pulse.signal} ${pulse.target}`);

      counts[pulse.signal]++;

      const mod = input[pulse.target];
      if (mod == null) continue;

      const output = mod.handle({ mod: pulse.source, signal: pulse.signal });
      output.forEach(p => queue.push({ source: pulse.target, target: p.mod, signal: p.signal }));
    }
  }
  log(counts);
  return counts.low * counts.high;
}

export function part2(input: Input) {
  const queue: QueueItem[] = [];

  let presses = 0;

  const sortedModules = Object.values(input).sort((l, r) => l.name.localeCompare(r.name));

  function serializeState() {
    const broadcaster = input.broadcaster as Broadcast;
    const state = broadcaster.targets
      .map(t => {
        const mod = input[t];
        return `${mod.name}[${mod.serializeState()}]`;
      })
      .join('\n');
    return state;
  }

  const cache = new Map<string, string>();

  while (true) {
    const counts = {
      low: 0,
      high: 0,
    } satisfies Record<Signal, number>;

    presses++;

    if (process.env.IS_SAMPLE === '1' && presses > 5) {
      return presses;
    }

    if (presses % 100_000 === 0) {
      log(presses);
    }

    const initialState = serializeState();
    if (cache.has(initialState)) {
      // log(`${presses}: cache hit`);
      continue;
    }

    queue.push({ source: 'button', target: 'broadcaster', signal: 'low' });
    while (queue.length > 0) {
      const pulse = queue.shift();

      if (pulse.target === 'rx') {
        counts[pulse.signal]++;
      }

      const mod = input[pulse.target];
      if (mod == null) continue;

      const output = mod.handle({ mod: pulse.source, signal: pulse.signal });
      output.forEach(p => queue.push({ source: pulse.target, target: p.mod, signal: p.signal }));
    }

    log(presses, counts.low, counts.high);
    if (counts.low === 1) {
      return presses;
    }

    const finalState = serializeState();
    cache.set(initialState, finalState);

    if (presses === 5) return -1;
  }
}

function createModule(type: string, name: string, targets: string[]): IModule {
  if (name === 'broadcaster') return new Broadcast(name, targets);
  if (type === '%') return new FlipFlop(name, targets);
  if (type === '&') return new Conjenction(name, targets);
  throw new Error(`Unknown [type: ${type}, name: ${name}]`);
}

interface IModule {
  readonly name: string;
  readonly targets: string[];
  readonly state: any;
  handle(pulse: Pulse): Pulse[];

  serializeState(): string;
}
type Pulse = { mod: string; signal: Signal };
type Signal = 'high' | 'low';

class FlipFlop implements IModule {
  state: Signal = 'low';

  constructor(readonly name: string, readonly targets: string[]) {}

  handle(pulse: Pulse): Pulse[] {
    if (pulse.signal === 'high') return [];
    this.state = flip(this.state);
    return this.targets.map(t => ({ mod: t, signal: this.state }));
  }

  serializeState() {
    return this.state;
  }
}

class Conjenction implements IModule {
  state: Record<string, Signal> = {};

  constructor(readonly name: string, readonly targets: string[]) {}

  handle(pulse: Pulse): Pulse[] {
    this.state[pulse.mod] = pulse.signal;

    const signal = Object.values(this.state).every(x => x === 'high') ? 'low' : 'high';
    // log('  ', this.memory);
    return this.targets.map(t => ({ mod: t, signal }));
  }
  serializeState() {
    return Object.entries(this.state)
      .map(([key, sig]) => {
        return `${key}:${sig}`;
      })
      .join(',');
  }
}

class Broadcast implements IModule {
  state: null;
  constructor(readonly name: string, readonly targets: string[]) {}

  handle(pulse: Pulse): Pulse[] {
    return this.targets.map(t => ({ mod: t, signal: pulse.signal }));
  }
  serializeState() {
    return null;
  }
}

function flip(signal: Signal): Signal {
  return signal === 'low' ? 'high' : 'low';
}
