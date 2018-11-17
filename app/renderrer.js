const path = require('path');
const config = require('config');
const mapnik = require('mapnik');
const { rename, exists, writeFile, ensureDir, remove } = require('fs-extra');
const { mercSrs } = require('./projections');

const forceTileRendering = config.get('forceTileRendering');

const tilesDir = path.resolve(__dirname, '..', config.get('dirs.tiles'));

const merc = new mapnik.Projection(mercSrs);

module.exports = async (pool, zoom, x, y, prerender) => {
  const frags = [tilesDir, zoom.toString(10), x.toString(10)];

  const p = path.join(...frags, `${y}`);
  if (forceTileRendering || !await exists(`${p}.png`) || prerender && await exists(`${p}.dirty`)) {
    console.log(`${prerender ? 'Pre-rendering' : 'Rendering'} tile: ${zoom}/${x}/${y}`);
    const map = await pool.acquire(prerender ? 1 : 0);
    map.zoomToBox(merc.forward([...transformCoords(zoom, x, y + 1), ...transformCoords(zoom, x + 1, y)]));

    await ensureDir(path.join(...frags));
    // await map.renderFileAsync(`${p}_tmp.png`, { format: 'png' });
    const im = new mapnik.Image(256, 256);
    await map.renderAsync(im, { buffer_size: 256 });
    const buffer = await im.encodeAsync('png');
    const tmpName = `${p}_tmp.png`;
    await writeFile(tmpName, buffer);
    await Promise.all([
      rename(tmpName, `${p}.png`),
      remove(`${p}.dirty`),
    ]);

    pool.release(map);
  }

  return `${p}.png`;
};

function transformCoords(zoom, xtile, ytile) {
  const n = Math.pow(2, zoom);
  const lon_deg = xtile / n * 360.0 - 180.0;
  const lat_rad = Math.atan(Math.sinh(Math.PI * (1 - 2 * ytile / n)));
  const lat_deg = lat_rad * 180.0 / Math.PI;
  return [lon_deg, lat_deg];
}
