export function time(name, fn) {
  const start = Date.now();
  const value = fn();
  console.log(`${name}: ${Date.now() - start}ms`);
  return value;
}