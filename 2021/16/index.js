
import { log, maxOf, minOf, sumOf } from "../../utils";

export const parse = line => line.split('');

const hexToBin = {
  '0': '0000',
  '1': '0001',
  '2': '0010',
  '3': '0011',
  '4': '0100',
  '5': '0101',
  '6': '0110',
  '7': '0111',
  '8': '1000',
  '9': '1001',
  'A': '1010',
  'B': '1011',
  'C': '1100',
  'D': '1101',
  'E': '1110',
  'F': '1111',
};

const operations = {
  '000': {name: 'sum'},
  '001': {name: 'mul'},
  '010': {name: 'min'},
  '011': {name: 'max'},
  '100': {name: 'lit'},
  '101': {name: 'gt'},
  '110': {name: 'lt'},
  '111': {name: 'eq'},
};

function isHex(value) {
  return value.some(x => ['A', 'B', 'C', 'D', 'E', 'F'].includes(x));
}
const print = o => require('util').inspect(o, {depth: 10});

export function part1(input) {
  log('input', input);

  const packet = isHex(input) 
    ? input.map(x => hexToBin[x]).join('').split('')
    : input;  
 
  log(packet.join(''));
  const reader = parseBinary(packet);

  const p = readPacket(reader);

  const splatted = splat(p);
  log(print(splatted));
  return sumOf(splatted, x => x.version);
  
}

export function part2(input) {

  const packet = isHex(input) 
    ? input.map(x => hexToBin[x]).join('').split('')
    : input;
    
  const reader = parseBinary(packet);
  const p = readPacket(reader);

  const ret = new Evaluator().visit(p);
  return ret;
}    

function parseBinary(packet) {
  let index = 0;
  return {
    get index() {return index;},
    get eof() {return index >= packet.length;},
    read(length) {
      const data = packet.slice(index, index + length).join('');
      index += length;      
      return data;
    },
    peak() {
      return packet[index];
    },
    readDecimal(length) {
      return binToDec(this.read(length));
    },    
    readLiteral() {
      let value = '';
      while(!this.eof) {
        const d= this.read(1);
        value += this.read(4);
        if (d === '0') break;
      }
      return binToDec(value);      
    },
    window(length) {
      return parseBinary(packet.slice(this.index, this.index + length));
    }
  };
};

class Evaluator {
  visit(node) {
    const op = operations[node.id];
    if (!op) throw new Error(`Unknown operation: '${node.id}'`);
    return this[op.name](node);
  }

  visitPackets(node) {
    log('visit.child', print(node));
    return node.packets.map(x => this.visit(x));
  }

  sum(node) {
    return sumOf(this.visitPackets(node));
  }

  mul(node) {
    const values = node.packets.map(x => this.visit(x));
    return values.reduce((mul, value) => mul * value, 1);
  }

  min(node) {
    const values = this.visitPackets(node);
    return Math.min(...values);
  }

  max(node) {
    const values = this.visitPackets(node);
    return Math.max(...values);
  }

  lit(node) {
    return node.value;
  }

  gt(node) {
    const [first, second] = this.visitPackets(node);
    return first > second ? 1 : 0;
  }

  lt(node) {
    const [first, second] = this.visitPackets(node);
    return first < second ? 1 :0;
  }

  eq(node) {
    const [first, second] = this.visitPackets(node);
    return first === second ? 1 : 0;
  }
}

function readPacket(reader) {

  const version = reader.readDecimal(3);
  const id = reader.read(3);

  const ret = handleOperator(reader, id);
  const prop = Array.isArray(ret) ? 'packets' : 'value';

  return {
    version,
    id,
    [prop]: ret,
  };
}

function splat(root) {
  if (!root.packets) return [root];
  return [root, ...root.packets.flatMap(splat)];
}

function handleOperator(reader, id) {

  if (hasEnvelope(id)) {
    return readEnvelope(reader);    
  } else {
    return readLiteral(reader);
  }
}

function hasEnvelope(id) {
  return id !== '100';
}

function readLiteral(reader) {
  return reader.readLiteral();
}

function readEnvelope(reader) {
  const type = reader.read(1);
  switch(type) {
  case '0': return readEnvelopeWithLength(reader);
  case '1': return readEnvelopeWithCount(reader);    
  default:   throw new Error('unknown operator: ' + type);
  }
}


function readEnvelopeWithLength(reader) {
  const dataLength = reader.readDecimal(15);

  const packets = [];
  let startPos = reader.index;
  let dataRead = 0;
  while(!reader.eof && dataRead < dataLength) {
    const packet = readPacket(reader);
    dataRead = reader.index - startPos ;

    packets.push(packet);
  }
  
  return packets;
}

function readEnvelopeWithCount(reader) {
  const count = reader.readDecimal(11);

  const packets = [];
  for(let i = 0; i < count; i++) {
    let packet = readPacket(reader);
    packets.push(packet);
  }  
  return packets;
}

function binToDec(bin) {  
  return parseInt(bin, 2);  
}