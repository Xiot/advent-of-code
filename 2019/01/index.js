/**
 * / https://adventofcode.com/2019/day/1
 *
 * Fuel required to launch a given module is based on its mass.
 * Specifically, to find the fuel required for a module, take its mass,
 * divide by three, round down, and subtract 2.
*/

const fs = require('fs');
const input = fs.readFileSync('./day-01/input.txt', 'utf-8')
    .split('\n')
    .filter(Boolean)
    .map(Number)
    .filter(x => !isNaN(x));

const calculateFuel = mass => Math.floor(mass / 3) - 2;

// part 1
const total = input.map(calculateFuel).reduce((sum, cur) => sum + cur);

console.log('Fuel for Masses', total);

const calculateCompleteFuel = mass => {

    const fuel = calculateFuel(mass);
    if (fuel < 0) {return 0; }
    return fuel + calculateCompleteFuel(fuel);
};
const allFuel = input.map(calculateCompleteFuel)
    .reduce((sum, cur) => sum + cur);

console.log('complete', allFuel);
