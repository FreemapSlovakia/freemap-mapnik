const path = require('path');
const config = require('config');
const { stat } = require('fs').promises;
const { dirtyTiles } = require('./dirtyTilesRegister');
const { tile2key } = require('./tileCalc');
const { tileRangeGenerator } = require('./tileCalc');

const rerenderOlderThanMs = config.get('rerenderOlderThanMs');

module.exports = {
  fillDirtyTilesRegister,
};

const prerenderConfig = config.get('prerender');
const tilesDir = path.resolve(__dirname, '..', config.get('dirs.tiles'));

async function fillDirtyTilesRegister() {
  console.log('Scanning dirty tiles.');

  const { minLon, maxLon, minLat, maxLat, minZoom, maxZoom } = prerenderConfig;

  for (const { zoom, x, y } of tileRangeGenerator(minLon, maxLon, minLat, maxLat, minZoom, maxZoom)) {
    let mtimeMs;
    try {
      mtimeMs = (await stat(path.join(tilesDir, `${zoom}/${x}/${y}.png`))).mtimeMs;
    } catch (e) {
      const v = { zoom, x, y, ts: 0 };
      dirtyTiles.set(tile2key(v), v);
      continue;
    }

    if (rerenderOlderThanMs && mtimeMs < rerenderOlderThanMs) {
      const v = { zoom, x, y, ts: mtimeMs };
      dirtyTiles.set(tile2key(v), v);
      continue;
    }

    try {
      const { mtimeMs } = await stat(path.join(tilesDir, `${zoom}/${x}/${y}.dirty`));
      const v = { zoom, x, y, ts: mtimeMs };
      dirtyTiles.set(tile2key(v), v);
    } catch (e) {
      // fresh
    }
  }

  console.log('Dirty tiles scanned.');
}
