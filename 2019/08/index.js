import fs from 'fs';
import {assert} from '../common';
import chalk from 'chalk';

const Width = 25;
const Height = 6;

const Black = 0;
const White = 1;
const Transparent = 2;

const input = fs.readFileSync('./2019/08/input.txt', 'utf-8').split('').map(Number);

function* readLayers(data, width, height) {
    let index = 0;
    const layerSize = width * height;
    while (index < data.length) {
        yield data.slice(index, index + layerSize);
        index += layerSize;
    }
}

function calculateHistogram(layer) {
    const valueMap = new Map();
    for(let pixel of layer) {
        valueMap.set(pixel, (valueMap.get(pixel) ?? 0) + 1);
    }
    return valueMap;
}

function part1() {
    const histograms = Array.from(readLayers(input, Width, Height), calculateHistogram);
    const lowestZeros = histograms.reduce((lowest, current) => {
        if (current.get(0) < lowest.get(0)) {
            return current;
        }
        return lowest;
    });

    const checksum = lowestZeros.get(1) * lowestZeros.get(2);
    console.log('Checksum', checksum);
    assert(2064, checksum, 'Checksum');
}

part1();

function getPixel(layers, x, y) {
    for(let layer of layers) {
        const pixel = getLayerPixel(layer, x, y);
        if (pixel !== Transparent) {
            return pixel;
        }
    }
    return Transparent;
}

function getLayerPixel(layer, x, y) {
    const index = y * Width + x;
    return layer[index];
}

function part2() {
    const black = chalk.bgBlack;
    const white = chalk.bgWhite;
    const format = pixel => {
        const fn = pixel === Black ? black : pixel === White ? white : chalk.bgGray;
        return fn(' ');
    };

    const layers = Array.from(readLayers(input, Width, Height));


    for(let y = 0; y < Height; y++) {
        let line = '';
        for(let x = 0; x < Width; x++) {
            const pixel = getPixel(layers, x, y);
            line += format(pixel);
        }
        console.log(line);
    }
}
part2();