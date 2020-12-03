import {loadInput} from '../../utils';

function part1() {

    const forest = loadInput(2020,3).split('\n');
    const width = forest[0].length;

    let x = 0;
    let trees = 0;
    for (let y = 0; y < forest.length; y++) {
        if (forest[y][x % width] === '#') {
            trees++;
        }
        x+=3;
    }

    console.log('Part I', trees);
}

function part2() {
    const forest = loadInput(2020,3).split('\n');
    const width = forest[0].length;

    const offsets = [
        [1,1], [3,1], [5,1], [7,1],[1,2]
    ];

    const results = offsets.map(([xOffset,yOffset]) => {
        let trees = 0;

        let x = 0;
        for (let y = 0; y < forest.length; y+=yOffset) {
            if (forest[y][x % width] === '#') {
                trees++;
            }
            x+=xOffset;
        }

        return trees;
    });

    const answer = results.reduce((mul, trees) => mul * trees, 1);

    console.log('Part II', answer);
}

part1();
part2();