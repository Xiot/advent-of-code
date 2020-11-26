import {loadInput} from '../../utils';

function load() {
    return loadInput(2017, 7).split('\n').map(parseLine);
}

function parseLine(text) {
    const re = /(\w+) \((\d+)\)(?: -> (.+))?/;

    const parts = re.exec(text);
    return {
        name: parts[1],
        weight: parseInt(parts[2]),
        children: parts[3] ? parts[3].split(', ') : []
    };
}

function part1() {
    const lines = load();
    const cache = Object.create(null);

    for(let line of lines) {
        if (cache[line.name] == null) cache[line.name] = 0;
        line.children.forEach(x => cache[x] = (cache[x] ?? 0) + 1);
    }

    const name = Object.entries(cache).find(x => x[1] === 0)[0];
    console.log('Part I', name);
}

function part2() {
    const lines = load();
    const cache = Object.create(null);

    function calcWeight(name) {
        if (cache[name]) return cache[name];

        const program = lines.find(x => x.name === name);
        let sum = program.weight;

        for(let child of program.children) {
            sum += calcWeight(child);
        }
        cache[name] = sum;
        return sum;
    }

    function findUnbalanced(name) {
        const program = lines.find(x => x.name === name);
        if (!program.children.length) return name;

        const weights = program.children.map(name => ({name, weight: cache[name]}));

        const sameAsFirst = weights.filter(x => x.weight === weights[0].weight).length;
        console.log(program.name, program.weight, weights.map(x => `${x.name} [${x.weight}]`));
        if (sameAsFirst === weights.length) {
            return name;
        } else {

            const childToDive = sameAsFirst === 1
                ? weights[0]
                : weights.find(x => x.weight !== weights[0].weight);

            const child = findUnbalanced(childToDive.name);
            if (program.children.includes(child)) {
                const otherChild = weights.find(x => x.weight !== childToDive.weight);
                const broken = lines.find(x => x.name === child);
                console.log(broken.weight - (cache[child]-otherChild.weight ));
            }
            return child;
        }
    }

    const total = calcWeight('uownj');
    console.log(total);

    const d = findUnbalanced('uownj');
    console.log('Part II', d);


    // for(let line of lines) {
    //     if (cache[line.name] == null) cache[line.name] = 0;
    //     line.children.forEach(x => cache[x] = (cache[x] ?? 0) + 1);
    // }
}

part1();
part2();