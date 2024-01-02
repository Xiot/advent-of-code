import { byLine, log } from '../../utils';
type Input = ReturnType<typeof parse>;

export const parse = byLine(line => {
  const [name, components] = line.split(': ');
  return {
    name,
    components: components.split(' '),
  };
});

type Node = {
  name: string;
  connections: Record<string, Node>;
};

export function part1(input: Input) {
  const nodeMap = new Map<string, Node>();

  function getNode(name: string) {
    if (nodeMap.has(name)) return nodeMap.get(name);
    const node: Node = { name, connections: {} };
    nodeMap.set(name, node);
    return node;
  }

  for (const item of input) {
    const node: Node = getNode(item.name);

    for (const childName of item.components) {
      const child = getNode(childName);
      node.connections[child.name] = child;
      child.connections[node.name] = node;
    }
  }

  function printConnections() {
    Array.from(nodeMap.values()).forEach(node => {
      const children = Object.keys(node.connections);
      log(node.name, children.length);
    });
  }

  function disconnect(left: string, right: string) {
    log('disconnect', left, right);
    const l = nodeMap.get(left);
    const r = nodeMap.get(right);
    delete l.connections[right];
    delete r.connections[left];
  }

  // printConnections();

  disconnect('hfx', 'pzl');
  disconnect('bvb', 'cmg');
  disconnect('nvd', 'jqt');

  printConnections();
}

export function part2(input: Input) {}
