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
      : (await findTilesToRender(tilesDir))[Symbol.iterator]();

    await Promise.all(Array(workers).fill(0).map(() => worker(pool, tileIterator)));
    prerendering = false;
    console.log('Pre-rendering finished.');
    if (retryLater) {
      prerender(pool, false);
    }
  }
}

async function findTilesToRender(dir) {
  const proms = [];
  const tiles = [];
  (await readdir(dir, { withFileTypes: true })).map((d) => {
    if (d.isDirectory()) {
      proms.push(findTilesToRender(path.resolve(dir, d.name)));
    } else if (d.name.endsWith('.dirty')) {
      tiles.push(parseTile(path.relative(tilesDir, path.resolve(dir, d.name)).replace(/\.dirty$/, '')));
    }
  });

  return tiles.concat(...await Promise.all(proms));
}

async function worker(pool, tg) {
  let result = tg.next();
  while (!result.done) {
    const { x, y, zoom } = result.value;
    await renderTile(pool, zoom, x, y, true);
    result = tg.next();
  }
}
