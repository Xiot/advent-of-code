import fs from 'fs';

function findInput(name) {
    return [
        name,
        `./${name}/input.txt`,
        `./day-${name}/input.txt`,
        `./${name}.txt`,
    ].find(x => {
        try {
            const stat = fs.statSync(x);
            return stat.isFile();
        } catch (ex) {
            return false;
        }
    });
}

export function loadInput(...args) {
    const parts = args.map(x => String(x).padStart(2, '0')).join('/');
    const filename = findInput(parts);

    return fs.readFileSync(filename, 'utf-8');
}