import fs from 'fs';

function findInput(name) {
    return [
        name,
        `./${name}/input.txt`,
        `./day-${name}/input.txt`
    ].find(x => {
        const stat = fs.statSync(x);
        return stat.isFile();
    });
}

export function loadInput(...args) {
    const parts = args.map(x => String(x)).join('/');
    const filename = findInput(parts);
    return fs.readFileSync(filename, 'utf-8');
}