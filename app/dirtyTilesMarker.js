const config = require('config');
const path = require('path');
const { readdir, readFile, unlink, remove, open, close, exists } = require('fs-extra');
const computeZoomedTiles = require('./zoomedTileComputer');
const { parseTile } = require('./tileCalc');

const expiresDir = path.resolve(__dirname, '..', config.get('dirs.expires'));
const minZoom = config.get('zoom.min');
const maxZoom = config.get('zoom.max');
const prerender = config.get('prerender');

module.exports = async (tilesDir) => {
  const dirs = await readdir(expiresDir);
  const fullFiles = [].concat(...await Promise.all(
    dirs
      .map((dirs) => path.join(expiresDir, dirs))
      .map(async (fd) => readdir(fd).then((x) => x.map((xx) => path.join(fd, xx)))),
  ));

  const contents = await Promise.all(fullFiles.map((ff) => readFile(ff, 'utf8')));
  const tiles = [].concat(...contents
    .join('\n')
    .split('\n')
    .filter((tile) => tile.trim())
    // .filter((tile) => isTileInBbox(tile))
    .map(tile => computeZoomedTiles(tile, minZoom, maxZoom)));

  const tileSet = new Set(tiles);
  console.log('Processing dirty tiles:', tileSet);

  await Promise.all([...tileSet].map(async (tile) => {
    const [zoom] = parseTile(tile);
    if (!prerender || zoom < prerender.minZoom || zoom > prerender.maxZoom) {
      await remove(path.resolve(tilesDir, `${tile}.png`));
    } else if (await exists(path.resolve(tilesDir, `${tile}.png`))) {
      await close(await open(path.resolve(tilesDir, `${tile}.dirty`), 'w'));
    }
  }));

  await Promise.all(fullFiles.map((ff) => unlink(ff)));
};

// function isTileInBbox(tile) {
//   const [zoom, x, y] = parseTile(tile);
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
