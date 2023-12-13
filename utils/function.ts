export function memoize<TArgs extends unknown[], TResult>(
  func: (...args: TArgs) => TResult,
): (...args: TArgs) => TResult {
  const stored = new Map<string, TResult>();

  return (...args) => {
    const k = JSON.stringify(args);
    if (stored.has(k)) {
      return stored.get(k)!;
    }
    const result = func(...args);
    stored.set(k, result);
    return result;
  };
}
