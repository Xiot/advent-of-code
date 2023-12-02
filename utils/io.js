const readline = require('readline');
const fs = require('fs');
const path = require('path');

export function prompt(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve =>
    rl.question(query, ans => {
      rl.close();
      resolve(ans);
    }),
  );
}

readline.emitKeypressEvents(process.stdin);
export function waitForKey() {
  if (process.stdin.isTTY) process.stdin.setRawMode(true);

  return new Promise(resolve => {
    const listener = (str, key) => {
      process.stdin.setRawMode(false);
      process.stdin.off('keypress', listener);

      if (key.ctrl && key.name === 'c') {
        process.exit();
      }
      resolve(key);
    };

    process.stdin.on('keypress', listener);
  });
}

const OUTPUT_FOLDER =
  process.env.SOLUTION_OUTPUT_PATH || path.join(process.env.SOLUTION_PATH || process.cwd(), './output');

export function clearOutputPath() {
  if (fs.existsSync(OUTPUT_FOLDER)) {
    fs.rmSync(OUTPUT_FOLDER, { force: true, recursive: true });
  }
  fs.mkdirSync(OUTPUT_FOLDER);
}

export function writeOutputFile(name, text) {
  if (typeof text !== 'string') {
    text = JSON.stringify(text);
  }
  fs.writeFileSync(path.join(OUTPUT_FOLDER, name), text, 'utf-8');
}
