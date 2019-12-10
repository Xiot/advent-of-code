import {loadInput} from '../common';
import {minBy, maxBy} from 'lodash';

const parseRegEx = /position=<\s*(-?\d+),\s*(-?\d+)>\s+velocity=<\s*(-?\d+),\s*(-?\d+)>/;
const input = () => loadInput(2018, 10)
    .split('\n')
    .map(line => {
        const [,x,y,vx,vy] = parseRegEx.exec(line);
        return {
            x: parseInt(x),
            y: parseInt(y),
            vx: parseInt(vx),
            vy: parseInt(vy)
        };
    });

function create(input) {
    let points = [...input];
    return {
        step(multiplier = 1) {
            points = points.map(p => ({
                x: p.x + multiplier * p.vx,
                y: p.y + multiplier * p.vy,
                vy: p.vy,
                vx: p.vx
            }));
        },
        bounds() {
            return findBounds(points);
        },
        print() {
            const bounds = findBounds(points);
            const lines = [];

            const isPointAt = (x, y) => !!points.find(p => p.x === x && p.y === y);

            for(let y = bounds.top - 1; y <= bounds.bottom + 1; y++) {
                let line = '';
                for(let x = bounds.left - 1; x <= bounds.right + 1; x++) {
                    line += isPointAt(x, y) ? '#' : '.';
                }
                lines.push(line);
            }
            const message = lines.join('\n');
            console.log(message);

        }
    };
}
const maxOf = (arr, accessor) => accessor(maxBy(arr, accessor));
const minOf = (arr, accessor) => accessor(minBy(arr, accessor));

export function findBounds(input) {
    return {
        left: minOf(input, p => p.x),
        right: maxOf(input, p => p.x),
        top: minOf(input, p => p.y),
        bottom: maxOf(input, p => p.y),
        get width() {
            return this.right - this.left +1;
        },
        get height() {
            return this.bottom - this.top + 1;
        }
    };
}
function part1() {
    const points = create(input());
    let lastBounds = points.bounds;
    let bounds;
    let t = 0;

    // eslint-disable-next-line no-constant-condition
    while(true) {
        t++;
        points.step();
        bounds = points.bounds();

        if (bounds.width > lastBounds.width) {
            break;
        }
        lastBounds = bounds;
    }
    points.step(-1);
    bounds = points.bounds();

    points.print();
    console.log('Time:', t - 1);
}

part1();