export function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    if (a === 0 || b === 0) {
        return Math.max(a, b);
    }
    if (a === b) { return a; }
    if (a > b) { return gcd(a - b, b); }
    return gcd(a, b - a);
}