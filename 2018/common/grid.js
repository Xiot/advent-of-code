
export function* pointsWithin(item) {
    for(let x = item.left; x <= item.right; x++) {
        for(let y = item.top; y <= item.bottom; y++) {
            yield [x, y];
        }
    }
}