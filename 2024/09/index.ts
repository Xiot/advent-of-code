import { byLine, createBounds, log, visualizeGrid } from '../../utils';
// type Input = ReturnType<typeof parse>;

type Chunk = {
  offset: number;
  id: number;
  length: number;
};
export const parseBlocks = (text: string) => {
  const chunks: Chunk[] = [];
  let offset = 0;
  let id = 0;

  for (let i = 0; i < text.length; i++) {
    const isFile = i % 2 === 0;
    const length = parseInt(text[i]);

    if (isFile) {
      for (let l = 0; l < length; l++) {
        chunks.push({
          offset: offset + l,
          id,
          length: length,
        });
      }
      id++;
    }
    offset += length;
  }
  return chunks;
};

const parseFiles = (text: string) => {
  const chunks: Chunk[] = [];
  const free: { offset: number; length: number }[] = [];

  let offset = 0;
  let id = 0;

  for (let i = 0; i < text.length; i++) {
    const isFile = i % 2 === 0;
    const length = parseInt(text[i]);

    if (isFile) {
      chunks.push({
        offset: offset,
        id,
        length: length,
      });

      id++;
    } else {
      free.push({ offset, length });
    }
    offset += length;
  }
  return { files: chunks, free };
};

export function part1(text: string) {
  const input = parseBlocks(text);
  const m = new Map<number, Chunk>();
  input.forEach(c => {
    m.set(c.offset, c);
  });

  const chunks = [...input];

  let lastFree = 0;
  function nextFreeSpace() {
    while (m.get(lastFree) != null) {
      lastFree++;
    }
    return lastFree;
  }

  while (true) {
    const last = chunks.pop();
    const index = nextFreeSpace();
    if (last.offset <= index) break;
    m.set(index, last);
    m.delete(last.offset);
  }

  const ordered = m
    .entries()
    .toArray()
    .sort((l, r) => l[0] - r[0]);

  const checksum = ordered.reduce((acc, cur) => {
    acc += cur[0] * cur[1].id;
    return acc;
  }, 0);

  console.log(ordered.map(x => String(x[1].id)).join(''));
  return checksum;
}

export function part2(text: string) {
  const input = parseFiles(text);

  const m = new Map<number, Chunk>();
  input.files.forEach(c => {
    for (let x = 0; x < c.length; x++) {
      m.set(c.offset + x, c);
    }
  });

  let free = [...input.free];
  console.log('free', free);
  function nextFreeSpace(size: number) {
    const firstIndex = free.findIndex(x => x.length >= size);
    if (firstIndex === -1) return null;
    const first = free[firstIndex];
    console.log('looking for free', size, first);
    if (first == null) return null;
    if (first.length > size) {
      // free.unshift();
      free[firstIndex] = { offset: first.offset + size, length: first.length - size };

      // while (true) {
      //   if (firstIndex + 1 >= free.length) break;
      //   if (free[firstIndex + 1].offset === first.offset + first.length) {
      //     free[firstIndex].length += free[firstIndex + 1].length;
      //     free.splice(firstIndex + 1, 1);
      //   } else {
      //     break;
      //   }
      // }
    } else {
      free.splice(firstIndex, 1);
    }
    // free = free.filter(s => s !== first);
    return first.offset;
  }

  function markFree(offset: number, length: number) {
    const newFree = { offset, length };

    // const w = free.findLast(x => x.offset <=offset)
    // check to see if the area marked as free is already free

    free.push(newFree);
    free.sort((l, r) => l.offset - r.offset);
    let index = 0;
    while (index + 1 < free.length) {
      const l = free[index];
      const r = free[index + 1];
      if (r.offset === l.offset + l.length) {
        // compact
        free.splice(index, 1, { offset: l.offset, length: l.length + r.length });
      } else {
        index++;
      }
    }
    // let firstIndex = free.findIndex(x => x === newFree) - 1;
    // while (true) {
    //   let b = free[firstIndex];
    //   if (b == null) break;
    //   if (firstIndex + 1 >= free.length) break;
    //   if (free[firstIndex + 1].offset === b.offset + b.length) {
    //     log('compact', firstIndex);
    //     free.splice(firstIndex, 2, { offset: b.offset, length: b.length + free[firstIndex + 1].length });
    //   } else {
    //     break;
    //   }
    //   // if (free[firstIndex + 1].offset === newFree.offset + newFree.length) {
    //   //   free.splice(firstIndex + 1, 1);
    //   // } else {
    //   //   break;
    //   // }
    // }
  }

  const last = input.files.at(-1)!;
  const diskSize = last.offset + last.length;

  const files = [...input.files];
  let index = 0;
  while (true) {
    const f = files.pop();
    if (f == null) break;
    console.log('f', f.id, f.length);
    const spot = nextFreeSpace(f.length);
    if (spot == null) continue;
    console.log('att', f.id, 'from', f.offset, 'to', spot);
    if (spot > f.offset) break;

    console.log('move', f.id, 'to', spot);
    for (let x = 0; x < f.length; x++) {
      m.set(spot + x, f);
      m.delete(f.offset + x);
    }
    console.log('mark free', f.offset, f.length);
    markFree(f.offset, f.length);
    log('free', free);

    console.log(
      visualizeGrid(createBounds({ right: diskSize - 1 }), x => {
        return m.get(x)?.id ?? '.';
      }),
    );
    console.log('----');
  }

  const ordered = m
    .entries()
    .toArray()
    .sort((l, r) => l[0] - r[0]);

  const checksum = ordered.reduce((acc, cur) => {
    acc += cur[0] * cur[1].id;
    return acc;
  }, 0);

  // console.log(ordered.map(x => String(x[1].id)).join(''));
  console.log(checksum);
  console.log(
    visualizeGrid(createBounds({ right: diskSize - 1 }), x => {
      return m.get(x)?.id ?? '.';
    }),
  );
  log(free);
  return checksum;
}
