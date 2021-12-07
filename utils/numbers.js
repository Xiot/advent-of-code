export const gcd = (a, b) => a ? gcd(b % a, a) : b;
export const lcm = (a, b) => a * b / gcd(a, b);
export const range = (from, to) => Array.from(new Array(to - from +1), (v, i) => from + i);

export const sumSeries = n => n * (n + 1) / 2;