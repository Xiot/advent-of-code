const fs = require('fs');
const input = fs.readFileSync('./day-06/input.txt', 'utf-8')
    .split('\n')
    .map(x => x.split(')'));

class Node {
    constructor(name) {
        this.name = name;
        this.orbits = undefined;
    }
}

const bodies = Object.create(null);

function getBody(name) {
    return bodies[name] || (bodies[name] = new Node(name));
}

input.forEach(([orbitee, orbiter]) => {
    const host = getBody(orbitee);
    const body = getBody(orbiter);
    body.orbits = host;
});

function countOrbits(body, target = 'COM') {
    let current = body;
    let count = 0;
    while (current != null) {
        current = current.orbits;
        if (current) {
            count++;
        }
        if (current && current.name === target) {
            break;
        }
    }
    return count;
}

function getPath(source, target) {
    let current = source;
    let path = [source];
    while(current != null) {
        current = current.orbits;
        if (!current) { throw new Error(`No Path between ${source.name} and ${target.name}`);}

        path.push(current);
        if (current === target) {
            return path;
        }
    }
    throw new Error(`No Path between ${source.name} and ${target.name}`);
}

const totalCount = Object.values(bodies).map(countOrbits).reduce((acc, cur) => acc + cur);
console.log('Total Count', totalCount);
if (totalCount !== 140608) {
    console.error('Invalid Total Count');
    process.exit();
}

const santa = getBody('SAN');
const you = getBody('YOU');

function namesOf(path) {
    return path.map(x => x.name);
}
function printNamesOf(path) {
    console.log(path.length, JSON.stringify(namesOf(path)));
}

function getPathBetween(source, target) {
    const center = getBody('COM');
    const sourcePath = getPath(santa, center);
    const targetPath = getPath(you, center);

    for(let i = 0; i < sourcePath.length; i++) {
        const current = sourcePath[i];
        if (targetPath.includes(current)) {
            const toSource = getPath(source, current);
            const toTarget = getPath(target, current);
            return [
                ...toSource,
                ...toTarget.reverse().slice(1)
            ];
        }
    }
    return undefined;
}

const transfers = getPathBetween(santa.orbits, you.orbits);
console.log('Transfers');
console.log('SAN -> YOU', transfers.length - 1);
