import chalk from 'chalk';
import {isEqual} from 'lodash';

export function render(grid, blocked, arr) {
    const lines = [];
    for(let y = 0; y < grid.length; y++) {
        let line = '';
        for(let x = 0; x < grid[0].length; x++) {
            const found = arr.find(p => isEqual(p,[x,y] ));
            line += found
                ? chalk.bgCyan.black(grid[y][x])
                : grid[y][x];
        }
        lines.push(line);
    }
    console.log(lines.join('\n'));
}