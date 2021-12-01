require('@babel/register');
require('dotenv').config();

const [year, day] = process.argv.slice(2).map(x => isNaN(x) ? x : parseInt(x));
if (!year || ! day) {
    console.log('Usage \'node index.js <year> <day>\'');
    process.exit(-1);
}
const folder = `./${year}/${String(day).padStart(2, '0')}`;

require(folder);