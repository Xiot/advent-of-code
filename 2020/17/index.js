import {loadInput, createGridMap, createBounds, pointsWithin, extendBounds} from '../../utils';

function part1(input) {

    const cube = createCube();
    const initialLayer = cube.getLayer(0);
    input.split('\n').forEach((line, index) => {
        for(let x = 0; x < line.length; x++) {
            initialLayer.set(x, index, line[x]);
        }
    });

    for (let i = 0; i < 6; i++) {

        let lastCube = cube.clone();

        const currentIndexes = cube.getLayerIndexes();
        const bounds = extendBounds(lastCube.getBounds(), -1, -1, 1, 1);

        for(let z = currentIndexes[0] - 1; z <= currentIndexes[currentIndexes.length - 1]+1; z++) {

            const layer = lastCube.getLayer(z);

            for(let [x, y] of pointsWithin(bounds)) {

                const sum = countNeighbours(lastCube, x, y, z);
                const current = layer.get(x, y);
                if (current === '#') {
                    if (sum < 2 || sum > 3) {
                        cube.getLayer(z).set(x, y, '.');
                    }
                } else if (sum === 3) {
                    cube.getLayer(z).set(x, y, '#');
                }

            }
        }
    }
    return countActive(cube);
}


function part2(input) {
    const hyper = createHypercube();
    const initialLayer = hyper.getCube(0).getLayer(0);
    input.split('\n').forEach((line, index) => {
        for(let x = 0; x < line.length; x++) {
            initialLayer.set(x, index, line[x]);
        }
    });

    for(let i = 0; i < 6; i++) {
        const hyperBounds = extendBounds(hyper.getBounds(), -1, -1, 1, 1, -1, 1);
        let lastHyper = hyper.clone();

        const currentW = hyper.getCubeIndexes();
        for(let w = currentW[0] - 1; w <= currentW[currentW.length -1] + 1; w++) {

            for(let [x,y,z] of pointsWithin(hyperBounds)) {
                const current = lastHyper.get(x,y,z,w);
                const sum = countHyperNeighbours(lastHyper, x,y,z,w);

                if (current === '#') {
                    if (sum < 2 || sum > 3) {
                        hyper.set(x,y,z,w,'.');
                    }
                } else if (sum === 3) {
                    hyper.set(x,y,z,w,'#');
                }
            }
        }
    }
    return countActiveHyper(hyper);
}

function countActiveHyper(hyper) {
    let sum = 0;
    let ind = hyper.getCubeIndexes();
    for(let w = ind[0]; w <= ind[ind.length - 1]; w++) {
        const cube = hyper.getCube(w);
        sum += countActive(cube);
    }

    return sum;
}

function countActive(cube) {
    let sum = 0;
    const indexes = cube.getLayerIndexes();
    for(let z = indexes[0]; z <= indexes[indexes.length - 1]; z++) {
        const layer = cube.getLayer(z);
        sum += Array.from(layer.values()).filter(v => v === '#').length;
    }
    return sum;
}

function countHyperNeighbours(hyper, cx, cy, cz, cw) {
    let sum = 0;

    for(let w = cw-1; w <= cw+1; w++) {
        const cube = hyper.getCube(w);
        for(let z = cz-1; z <= cz+1; z++) {
            const layer = cube.getLayer(z);
            for(let y = cy-1; y <= cy+1; y++) {
                for(let x = cx-1; x <= cx+1; x++) {
                    if (x === cx && y === cy && z === cz && w === cw)
                        continue;

                    const value = layer.get(x, y);
                    sum += (value === '#') ? 1 : 0;
                }
            }
        }
    }

    return sum;
}

function countNeighbours(cube, cx, cy, cz) {
    let sum = 0;

    for(let z = cz-1; z <= cz+1; z++) {
        for(let y = cy-1; y <= cy+1; y++) {
            for(let x = cx-1; x <= cx+1; x++) {
                if (x === cx && y === cy && z === cz)
                    continue;
                const value = cube.getLayer(z).get(x, y);
                sum += (value === '#') ? 1 : 0;
            }
        }
    }
    return sum;
}

function createHypercube() {
    const cubes = new Map();

    function setCube(index, cube) {
        cubes.set(index, cube);
    }
    function getCube(index) {
        if (!cubes.has(index)) {
            cubes.set(index, createCube());
        }
        return cubes.get(index);
    }
    function getCubeIndexes() {
        return Array.from(cubes.keys()).sort((l, r) => l - r);
    }

    function getBounds() {
        const largest = createBounds();
        cubes.forEach(cube => {
            const b = cube.getBounds();
            largest.mark(b.left, b.top, b.zMin);
            largest.mark(b.right, b.bottom, b.zMax);
        });
        return largest;
    }
    function get(x, y, z, w) {
        return this.getCube(w).getLayer(z).get(x, y);
    }
    function set(x, y, z, w, value) {
        this.getCube(w).getLayer(z).set(x, y, value);
    }

    function clone() {
        const newHyper = createHypercube();
        cubes.forEach((cube, w) => {
            newHyper.setCube(w, cube.clone());
        });
        return newHyper;
    }
    return {
        getCubeIndexes,
        setCube,
        getCube,
        getBounds,
        clone,
        get,
        set,
    };
}

function createCube() {
    const layers = new Map();

    function setLayer(index, layer) {
        layers.set(index, layer);
    }
    function getLayer(index) {
        if (!layers.has(index)) {
            layers.set(index, createGridMap('.'));
        }
        return layers.get(index);
    }
    function getLayerIndexes() {
        return Array.from(layers.keys()).sort((l, r) => l - r);
    }
    function getZBounds() {
        const indexes = this.getLayerIndexes();
        return [
            indexes[0] - 1,
            indexes[indexes.length - 1] + 1
        ];
    }

    function getBounds() {
        const largest = createBounds();
        layers.forEach((layer, z) => {
            const b = layer.bounds;
            largest.mark(b.left, b.top, z);
            largest.mark(b.right, b.bottom, z);
        });
        return largest;
    }

    function clone() {
        const newCube = createCube();
        layers.forEach((layer, z) => {
            newCube.setLayer(z, layer.clone());
        });
        return newCube;
    }
    return {
        getLayerIndexes,
        setLayer,
        getLayer,
        getBounds,
        clone,
    };
}


(function solve() {
    const input = loadInput(2020, 17);
    console.log('Part I :', part1(input));
    console.log('Part II:', part2(input));
})();