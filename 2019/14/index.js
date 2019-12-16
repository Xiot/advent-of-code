import {loadInput} from '../common';

const parseRegEx = /(\d+) (\w+)/;

const Chemicals = {
    fuel: 'FUEL',
    ore: 'ORE'
};

const parseChemicalQuantity = text => {
    const match = parseRegEx.exec(text);
    return {
        quantity: parseInt(match[1]),
        chemical: match[2]
    };
};

const sample1 = `9 ORE => 2 A
8 ORE => 3 B
7 ORE => 5 C
3 A, 4 B => 1 AB
5 B, 7 C => 1 BC
4 C, 1 A => 1 CA
2 AB, 3 BC, 4 CA => 1 FUEL`;
const sample2 =`171 ORE => 8 CNZTR
7 ZLQW, 3 BMBT, 9 XCVML, 26 XMNCP, 1 WPTQ, 2 MZWV, 1 RJRHP => 4 PLWSL
114 ORE => 4 BHXH
14 VRPVC => 6 BMBT
6 BHXH, 18 KTJDG, 12 WPTQ, 7 PLWSL, 31 FHTLT, 37 ZDVW => 1 FUEL
6 WPTQ, 2 BMBT, 8 ZLQW, 18 KTJDG, 1 XMNCP, 6 MZWV, 1 RJRHP => 6 FHTLT
15 XDBXC, 2 LTCX, 1 VRPVC => 6 ZLQW
13 WPTQ, 10 LTCX, 3 RJRHP, 14 XMNCP, 2 MZWV, 1 ZLQW => 1 ZDVW
5 BMBT => 4 WPTQ
189 ORE => 9 KTJDG
1 MZWV, 17 XDBXC, 3 XCVML => 2 XMNCP
12 VRPVC, 27 CNZTR => 2 XDBXC
15 KTJDG, 12 BHXH => 5 XCVML
3 BHXH, 2 VRPVC => 7 MZWV
121 ORE => 7 VRPVC
7 XCVML => 6 RJRHP
5 BHXH, 4 VRPVC => 5 LTCX`;
const links = loadInput(2019, 14)
// const links = sample2
    .split('\n')
    .map(line => {
        const side = line.split('=>');
        const ingredients = side[0]
            .split(', ')
            .map(parseChemicalQuantity);
        const output = parseChemicalQuantity(side[1]);
        return {
            input: ingredients,
            output
        };
    });

class Node {
    formula = undefined;

    constructor(formula) {
        this.formula = formula;
        this._name = formula.output.chemical;
    }
    get chemical() {
        return this.formula.output.chemical;
    }
    get produces() {
        return this.formula.output.quantity;
    }

    get requires() {
        return this.formula.input;
    }

    get output() {
        return this.formula.output;
    }
}

function buildGraph(formulas) {
    const cache = new Map(); //createGroupBy();
    for(let formula of formulas) {
        const node = new Node(formula);
        cache.set(node.chemical, node);
        // const t = cache.append(node.chemical, node);
        // console.log(t.length);
    }
    return cache;
}

function createInventory() {
    const cache = new Map();
    return {
        peek(chemical) {
            return cache.get(chemical) ?? 0;
        },
        has(chemical, amount) {
            return this.peek(chemical) >= amount;
        },
        take(chemical, amount) {
            const current = this.peek(chemical);
            // if (amount > current) {
            //     throw new Error(`Not Enough '${chemical}'. Requested: ${amount}, Available: ${current}`);
            // }
            cache.set(chemical, current - amount);
            return current - amount;
        },
        add(chemical, amount) {
            const current = this.peek(chemical);
            cache.set(chemical, current + amount);
            return current + amount;
        },
        entries() {
            return cache.entries();
        }
    };
}

function calculateOreCost(inv, grid, chemical, quantity) {

    const queue = [];
    queue.push({chemical, quantity});
    while(queue.length > 0) {
        const current = queue.shift();

        const f = grid.get(current.chemical)?.formula;
        if (!f) {continue;}

        const available = inv.peek(current.chemical);

        let unitsRequired = Math.ceil(current.quantity / f.output.quantity);
        let adding = f.output.quantity * unitsRequired;

        const overflow = adding + available;
        if (overflow > 0 && current.chemical !== chemical) {
            const excessBuilds = Math.floor(overflow / f.output.quantity);
            unitsRequired -= excessBuilds;
            adding = f.output.quantity * unitsRequired;
        }

        inv.add(current.chemical, adding);

        f.input.forEach(x => {
            inv.take(x.chemical, x.quantity * unitsRequired);

            const work = {
                chemical: x.chemical,
                quantity: x.quantity * unitsRequired,
            };
            queue.push(work);
        });
    }
    return -inv.peek(Chemicals.ore);
}

function part1() {
    const inv = createInventory();
    const graph = buildGraph(links);

    const oreCost = calculateOreCost(inv, graph, 'FUEL', 1);

    console.log('\nPart I');
    console.log('Ore Cost', oreCost);

    return oreCost;
}

function part2() {

    const graph = buildGraph(links);
    const Trillion = 1000000000000;

    // Start with the number of times the lowest fuel amount divides into a trillion.
    // This gives an approximate for the max amout of fuel.
    let maxFuel = Math.floor(
        Trillion /
        calculateOreCost(createInventory(), graph, Chemicals.fuel, 1)
    );

    // Loop a few times
    for(let i = 0; i < 10; i++) {
        // See how much ore we need
        const oreCost = calculateOreCost(
            createInventory(), graph, 'FUEL', maxFuel);

        if (oreCost > Trillion) {
            // Haven't handled the too much case.
            console.log('too much');
        } else {
            // See how close we are.
            // Divide 1 trillion by the oreCost to get the multiplier.
            const multiplier = Trillion / oreCost;
            if (maxFuel === Math.floor(multiplier * maxFuel)) {
                // If the multiplier gives us the same number,
                // then we know we are as close as we can get.
                break;
            }
            // Set the new value.
            maxFuel = Math.floor(multiplier * maxFuel);
        }
    }

    console.log('\nPart II');
    console.log('Max Fuel:', maxFuel);
}

part1();
part2();