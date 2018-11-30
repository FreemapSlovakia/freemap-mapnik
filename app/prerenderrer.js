const path = require('path');
const config = require('config');
const { cpus } = require('os');
const { readdir } = require('fs').promises;

const renderTile = require('./renderrer');
const { tileRangeGenerator, parseTile } = require('./tileCalc');

module.exports = prerender;

let prerendering = false;
let retryLater = false;

const prerenderConfig = config.get('prerender');
const tilesDir = path.resolve(__dirname, '..', config.get('dirs.tiles'));

const nCpus = cpus().length;

async function prerender(pool, all) {
  if (prerendering) {
    retryLater = true;
    return;
  }
  retryLater = false;
  if (prerenderConfig) {
    console.log('Running pre-rendering...');
    prerendering = true;
    const { minLon, maxLon, minLat, maxLat, minZoom, maxZoom, workers = nCpus } = prerenderConfig;
    const tileIterator = all
      ? tileRangeGenerator(minLon, maxLon, minLat, maxLat, minZoom, maxZoom)
      : findTilesToRender(tilesDir);

    await Promise.all(Array(workers).fill(0).map(() => worker(pool, tileIterator)));
    prerendering = false;
    console.log('Pre-rendering finished.');
    if (retryLater) {
      prerender(pool, false);
    }
  }
}

async function* findTilesToRender(dir) {
  for (const d of await readdir(dir, { withFileTypes: true })) {
    if (d.isDirectory()) {
      yield *findTilesToRender(path.resolve(dir, d.name));
    } else if (d.name.endsWith('.dirty')) {
      yield parseTile(path.relative(tilesDir, path.resolve(dir, d.name)).replace(/\.dirty$/, ''));
    }
  }
}

async function worker(pool, tg) {
  for await (const { x, y, zoom } of tg) {
    await renderTile(pool, zoom, x, y, true);
  }
}
