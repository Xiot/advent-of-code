import {minBy, maxBy} from 'lodash';

export function* pointsWithin(item) {
    for(let x = item.left; x <= item.right; x++) {
        for(let y = item.top; y <= item.bottom; y++) {
            yield [x, y];
        }
    }
}

export const maxOf = (arr, accessor) => accessor(maxBy(arr, accessor));
export const minOf = (arr, accessor) => accessor(minBy(arr, accessor));

export function boundsOfGrid(grid) {
    return {
        left: 0,
        right: grid[0].length - 1,
        top: 0,
        bottom: grid.length - 1,
        width: grid[0].length,
        height: grid.length
    };
}
export function findBounds(input, accessX = p => p[0], accessY = p => p[1]) {
    return {
        left: minOf(input, accessX),
        right: maxOf(input, accessX),
        top: minOf(input, accessY),
        bottom: maxOf(input, accessY),
        get width() {
            return this.right - this.left +1;
        },
        get height() {
            return this.bottom - this.top + 1;
        }
    };
}