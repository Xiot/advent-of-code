type AocSolution<T, R> = {
  parse: (text: string) => T;
  part1: (input: T) => R;
  part2: (input: T) => R;
};

export function aoc<T>(parser: (text: string) => T): {
  with(solutions: {
    part1(input: T): string | number;
    part2(input: T): string | number;
  }): AocSolution<T, string | number>;
} {
  return {
    with(solutions) {
      return {
        parse: parser,
        ...solutions,
      };
    },
  };
}
