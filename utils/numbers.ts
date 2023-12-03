export const gcd = (a: number, b: number) => (a ? gcd(b % a, a) : b);
export const lcm = (a: number, b: number) => (a * b) / gcd(a, b);
export const range = (from: number, to: number) => Array.from(new Array(to - from + 1), (v, i) => from + i);

export const sumSeries = (n: number) => (n * (n + 1)) / 2;
