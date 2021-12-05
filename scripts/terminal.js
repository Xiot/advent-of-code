
const DISABLE_CURSOR = `\x1B[?25l`;
const ENABLE_CURSOR = `\x1B[?25h`;

function updateLine(text) {
  const out = process.stdout;
  out.cursorTo(0);
  out.write(text);
  out.clearLine(1);
}

function nextLine(text) {
  const out = process.stdout;
  out.cursorTo(0);
  out.moveCursor(0, 1);
  out.write(text);
}

let hooked = false;
function showCursor(show) {  
  process.stdout.write(show ? ENABLE_CURSOR : DISABLE_CURSOR);

  if(!show && !hooked) {
    hooked = true;
    process.on('SIGINT', () => {
      process.stdout.write('\n');
      process.stdout.write(ENABLE_CURSOR);
      process.exit(2);
    });
    process.addListener('beforeExit', () => process.stdout.write(ENABLE_CURSOR));
  }
}

module.exports = {
  updateLine,
  nextLine,
  showCursor
};
