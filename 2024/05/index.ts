import { byLine, bySection, log, sumOf } from '../../utils';
type Input = ReturnType<typeof parse>;

export const parse = (text: string) => {
  const [ruleBlock, printBlock] = text.split('\n\n');

  const rules = new Map<string, string[]>();
  for (const line of ruleBlock.split('\n')) {
    const [left, right] = line.split('|');

    let bucket = rules.get(left);
    if (!bucket) {
      bucket = [];
      rules.set(left, bucket);
    }
    bucket.push(right);
  }

  const books: string[][] = [];
  for (const line of printBlock.split('\n')) {
    books.push(line.split(','));
  }

  return {
    rawRules: ruleBlock.split('\n'),
    rules,
    books,
  };
};

export function part1(input: Input) {
  let sum = 0;
  for (const book of input.books) {
    log.push(book);
    const correct = inOrder(input.rules, book);
    console.log(correct, book);
    if (correct) {
      const middle = (book.length - 1) / 2;
      sum += parseInt(book[middle]);
    }
    log.pop();
  }
  return sum;
}

export function part2(input: Input) {
  function ruleSort(l: string, r: string) {
    const key = `${l}|${r}`;
    if (input.rawRules.includes(key)) {
      return -1;
    }
    if (input.rawRules.includes(`${r}|${l}`)) {
      return 1;
    }
    return 0;
  }

  const booksToFix = input.books
    .map((b, i) => {
      return { book: b, originalBook: [...b], index: i, brokenRules: brokenRules(input.rules, b) };
    })
    .filter(x => x.brokenRules.length > 0);

  const fixedBooks: string[][] = [];
  for (const entry of booksToFix) {
    fixedBooks.push(entry.book.toSorted(ruleSort));
  }
  console.log('fixed', fixedBooks);

  const sum = sumOf(fixedBooks, x => {
    const mid = (x.length - 1) / 2;
    return parseInt(x[mid]);
  });
  return sum;
}

function brokenRules(rules: Map<string, string[]>, book: string[]) {
  const brokenRules: Array<[string, string]> = [];

  for (let i = 0; i < book.length; i++) {
    const char = book[i];
    const pageRules = rules.get(char);
    if (pageRules == null) continue;

    const broken = pageRules.filter(s => {
      const index = book.indexOf(s);
      if (index === -1) return false;
      return index < i;
    });
    for (const b of broken) {
      brokenRules.push([char, b]);
    }
  }
  return brokenRules;
}

function inOrder(rules: Map<string, string[]>, book: string[]) {
  for (let i = 0; i < book.length; i++) {
    const char = book[i];
    const pageRules = rules.get(char);
    if (pageRules == null) continue;

    const broken = pageRules.some(s => {
      const index = book.indexOf(s);
      if (index === -1) return false;
      return index < i;
    });
    if (broken) return false;
  }
  return true;
}
