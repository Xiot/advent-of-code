export function numberPerLine(text) {
  return byLine(line => (isNaN(line) ? line : parseFloat(line)))(text);
}

export function byLine(lineParser = line => line) {
  return text => text.split('\n').map(lineParser);
}
