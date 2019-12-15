import {loadInput, lcm} from '../common';

const MoonNames = [
    'Io', 'Europa', 'Ganymede', 'Callisto'
];

const parseRe = /x=(-?\d+), y=(-?\d+), z=(-?\d+)/;

const load = () => {
    const text = loadInput(2019, 12);
    // const text = `<x=-8, y=-10, z=0>
    // <x=5, y=5, z=10>
    // <x=2, y=-7, z=3>
    // <x=9, y=-8, z=-3>`;

    return text
        .split('\n')
        .map((line, index) => {
            const [,x, y, z] = parseRe.exec(line);
            return createMoon(
                MoonNames[index],
                vector3(parseInt(x), parseInt(y), parseInt(z))
            );
        });
};


function vector3(x, y, z) {
    return {
        x,
        y,
        z,
        add(...args) {
            const v = (args.length === 3)
                ? {x: args[0], y: args[1], z: args[2]}
                : args[0];
            return vector3(x + v.x, y + v.y, z + v.z);
        },
        toJSON() {
            return {x, y, z};
        },
        toString() {
            return `(${x}, ${y}, ${z})`;
        },
    };
}
function sumVector(v) {
    return Math.abs(v.x) + Math.abs(v.y) + Math.abs(v.z);
}

function createMoon(name, position) {
    return {
        name,
        position,
        originalPosition: position,
        velocity: vector3(0, 0, 0),
        accelerate(acceleration) {
            this.velocity = this.velocity.add(acceleration);
        },
        tick() {
            this.position = this.position.add(this.velocity);
        },
        totalEnergy() {
            return sumVector(this.position) * sumVector(this.velocity);
        },
    };
}

function compare(l, r) {
    if (l === r) { return 0; }
    return l < r ? 1 : -1;
}

function calculateGravity(target, planets) {

    let gravity = vector3(0, 0, 0);
    for(let p of planets) {
        if (p === target) { continue; }

        gravity = gravity.add(
            compare(target.position.x, p.position.x),
            compare(target.position.y, p.position.y),
            compare(target.position.z, p.position.z)
        );
    }
    return gravity;
}

function debugMoon(moon) {
    console.log(moon.name.padEnd(10), moon.position.toJSON(), moon.velocity.toJSON());
}

function part1() {
    const planets = load();

    const steps = 1000;
    for(let step = 0; step < steps; step++) {

        const gravities = planets.map(x => calculateGravity(x, planets));
        planets.forEach((p, index) => {
            p.accelerate(gravities[index]);
            p.tick();
        });
    }

    const totalEnergy = planets.reduce((energy, moon) => energy + moon.totalEnergy(), 0);

    console.log('\nPart I');
    console.log(totalEnergy);
}

function findCycle(dimension, planets) {

    let step = 0;
    // eslint-disable-next-line no-constant-condition
    while(true) {
        const gravities = planets.map(x => calculateGravity(x, planets));
        planets.forEach((p, index) => {
            p.accelerate(gravities[index]);
            p.tick();
        });

        step ++;

        const atOriginal = planets.filter(
            p => p.position[dimension] === p.originalPosition[dimension]
                && p.velocity[dimension] === 0
        );

        if (atOriginal.length === planets.length) {
            return step;
        }
    }
}

function part2() {

    const intervalX = findCycle('x', load());
    const intervalY = findCycle('y', load());
    const intervalZ = findCycle('z', load());

    const multiple = lcm(lcm(intervalX, intervalY), intervalZ);

    console.log('\nPart II');
    console.log(multiple);
}

part1();
part2();
