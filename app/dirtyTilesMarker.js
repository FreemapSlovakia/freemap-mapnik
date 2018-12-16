const config = require('config');
const path = require('path');
const { readdir, readFile, unlink, open, access } = require('fs').promises;
const { parseTile, computeZoomedTiles, tile2key } = require('./tileCalc');
const { dirtyTiles } = require('./dirtyTilesRegister');

const expiresDir = path.resolve(__dirname, '..', config.get('dirs.expires'));
const minZoom = config.get('zoom.min');
const maxZoom = config.get('zoom.max');
const prerenderConfig = config.get('prerender');

module.exports = { markDirtyTiles };

async function markDirtyTiles(tilesDir) {
  console.log('Marking dirty tiles.');

  const dirs = await readdir(expiresDir);
  const fullFiles = [].concat(...await Promise.all(
    dirs
      .map((dirs) => path.join(expiresDir, dirs))
      .map(async (fd) => readdir(fd).then((x) => x.map((xx) => path.join(fd, xx)))),
  ));

  const contents = await Promise.all(fullFiles.map((ff) => readFile(ff, 'utf8')));

  const tiles = new Set();

  contents
    .join('\n')
    .split('\n')
    .filter((tile) => tile.trim())
    .forEach((tile) => {
      tiles.add(tile);
    });

  const deepTiles = [];
  tiles.forEach((tile) => {
    computeZoomedTiles(deepTiles, tile, minZoom, maxZoom);
  });

  console.log('Processing dirty tiles:', deepTiles.length);

  // we do it sequentially to not to kill IO
  for (const tile of deepTiles) {
    const { zoom, x, y } = parseTile(tile);
    if (zoom < prerenderConfig.minZoom || zoom > prerenderConfig.maxZoom) {
      try {
        await unlink(path.resolve(tilesDir, `${tile}.png`));
      } catch (_) {
        // ignore
      }
    } else if (await exists(path.resolve(tilesDir, `${tile}.png`))) {
      await (await open(path.resolve(tilesDir, `${tile}.dirty`), 'w')).close();
      const v = { zoom, x, y, ts: Date.now() };
      dirtyTiles.set(tile2key(v), v);
    }
  }

  // we do it sequentially to not to kill IO
  for (const ff of fullFiles) {
    await unlink(ff);
  }

  console.log('Finished marking dirty tiles.');
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch (_) {
    return false;
  }
}

// function isTileInBbox(tile) {
//   const { zoom, x, y } = parseTile(tile);
//   const minLon = tile2long(x, zoom);
//   const maxLon = tile2long(x + 1, zoom);
//   const maxLat = tile2lat(y, zoom);
//   const minLat = tile2lat(y + 1, zoom);
//   console.log(zoom, minLat, maxLat);
//   return prerender.minLon >= minLon
//     && prerender.maxLon <= maxLon
//     && prerender.minLat >= minLat
//     && prerender.maxLat <= maxLat;
// }
