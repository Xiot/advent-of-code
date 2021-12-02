export function numberPerLine(text) {
  return byLine(line => (isNaN(line) ? line : parseFloat(line)))(text);
}

export function byLine(lineParser = line => line) {
  return text => text.split('\n').map(lineParser);
}

export function autoParse(fn = x => x) {
  return byLine(line => fn(line.split(' ').map(x => maybeNumber(x))));
}

export function maybeNumber(value) {
  return isNaN(value) ? value : parseFloat(value);
}