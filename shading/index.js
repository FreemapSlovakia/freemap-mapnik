const gdal = require('gdal');

const dataset = gdal.open('N48E021.hgt');

const threshold = 4; // minimal length of the run to smooth; prevents blurring

const { x: width, y: height } = dataset.rasterSize;

const dataset1 = gdal.open('N48E021.tiff', 'w', 'GTiff', width, height, 1, 'Float32');
dataset1.srs = dataset.srs;
dataset1.geoTransform = dataset.geoTransform;

const dst = new Float32Array(width * height);

let src = dataset.bands.get(1).pixels.read(0, 0, width, height);

for (const rotated of [false, true]) {
  const addr = (x, y) => rotated ? x * height + y : (y * width + x);
  const maxX = rotated ? width : height;
  const maxY = rotated ? height : width;

  for (let y = 0; y < maxY; y++) {
    let v1 = src[addr(0, y)];
    let v2 = v1;

    for (let x = 0; x < maxX;) {
      let xx;
      for (xx = x + 1; xx < maxX && src[addr(x, y)] == src[addr(xx, y)]; xx++);

      const v3 = xx === maxX ? v2 : src[addr(xx, y)];

      const short = xx - x < threshold;
      for (let q = x; q < xx; q++) {
        dst[addr(q, y)] = short ? v2 : ((v1 + (v2 - v1) * (q + 0.5 - x) / (xx - x) + v2 + (v3 - v2) * (q + 0.5 - x) / (xx - x)) / 2);
      }

      v1 = v2;
      v2 = v3;
      x = xx;
    }
  }

  src = dst;
}

dataset1.bands.get(1).pixels.write(0, 0, width, height, dst);

dataset1.close();
