const path = require('path');

function solutionPath(year, day) {
  return `${year}/${String(parseInt(day)).padStart(2, '0')}`;
}

module.exports = {
  solutionPath,
  buildFilename(year, day, filename) {
    return path.join(solutionPath(year, day), filename);
  },
  args() {
    return require('process')
      .argv.slice(2)
      .map(x => (isNaN(x) ? x : parseInt(x)));
  },
};
