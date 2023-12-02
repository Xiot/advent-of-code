type Parser<T> = (text: string) => T;

export function numberPerLine(text: string) {
  // @ts-expect-error
  return byLine(line => (isNaN(line) ? line : parseFloat(line)))(text);
}

export function byLine<T>(lineParser: (line: string) => T = line => line as T): (text: string) => T[] {
  return text => text.split('\n').map(lineParser);
}

export function bySection(): Parser<string[]> {
  return text => text.split('\n\n');
}

export function autoParse<T>(fn: (line: Array<string | number>) => T = x => x as T) {
  return byLine(line => fn(line.split(' ').map(x => maybeNumber(x))));
}

export function maybeNumber(value: string) {
  // @ts-expect-error
  return isNaN(value) ? value : parseFloat(value);
}
