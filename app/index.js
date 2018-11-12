const path = require('path');
const { promisify } = require('util');
const { cpus } = require('os');
const process = require('process');
const http = require('http');
const { stat } = require('fs-extra');

const mapnik = require('mapnik');
const config = require('config');
const Koa = require('koa');
const Router = require('koa-router');
const send = require('koa-send');
const genericPool = require('generic-pool');

const generateConfig = require('./style');
const markDirtyTiles = require('./dirtyTilesMarker');
const render = require('./renderrer');

mapnik.register_default_fonts();
mapnik.register_default_input_plugins();

const app = new Koa();
const router = new Router();

const tilesDir = path.resolve(__dirname, '..', config.get('dirs.tiles'));
const serverPort = config.get('server.port');
const dumpXml = config.get('dumpXml');
const minZoom = config.get('zoom.min');
const maxZoom = config.get('zoom.max');
const workers = config.get('workers');

const nCpus = cpus().length;

process.env.UV_THREADPOOL_SIZE = (workers.max || nCpus) + 4; // see https://github.com/mapnik/mapnik-support/issues/114

router.get('/:zoom/:x/:y', async (ctx) => {
  const { zoom, x, y } = ctx.params;
  if (zoom < minZoom || zoom > maxZoom) {
    return;
  }
  const file = await render(pool, Number.parseInt(zoom), Number.parseInt(x), Number.parseInt(y), 0);
  const stats = await stat(file);

  ctx.status = 200;
  ctx.set('Last-Modified', stats.mtime.toUTCString());

  if (ctx.fresh) {
    ctx.status = 304;
    return;
  }

  await send(ctx, `${zoom}/${x}/${y}.png`, { root: tilesDir });
});

app
  .use(router.routes())
  .use(router.allowedMethods());

const server = http.createServer(app.callback());
server.listen(serverPort);

const expiratorInterval = setInterval(() => {
  markDirtyTiles(tilesDir)
    .then(() => {
      prerender();
    })
    .catch((err) => {
      console.error('Error expiring tiles:', err);
    });
}, 60 * 1000);

const xml = generateConfig();

if (dumpXml) {
  console.log('Mapnik config:', xml);
}

const factory = {
  async create() {
    const map = new mapnik.Map(256, 256);
    map.fromStringAsync = promisify(map.fromString);
    await map.fromStringAsync(xml);
    return map;
  },
  async destroy() {
    // nothing to do
  },
};

const pool = genericPool.createPool(factory, {
  max: 'max' in workers ? workers.max : nCpus,
  min: 'min' in workers ? workers.min : nCpus,
  priorityRange: 2,
});

pool.on('factoryCreateError', async (error) => {
  process.exitCode = 1;
  console.error('Error creating or configuring Mapnik:', error);
  server.close();
  await pool.drain();
  await pool.clear();
  clearInterval(expiratorInterval);
});

prerender();

let prerendering = false;

function prerender() {
  if (prerendering) {
    return;
  }
  prerendering = true;
  const prerender = config.get('prerender');
  if (prerender) {
    const { minLon, maxLon, minLat, maxLat, minZoom, maxZoom, workers = nCpus } = prerender;
    const tg = getTiles(minLon, maxLon, minLat, maxLat, minZoom, maxZoom);
    Promise.all(Array(workers).fill(0).map(() => worker(tg)))
      .then(() => {
        prerendering = false;
      })
      .catch((err) => {
        console.error('Error pre-rendering:', err);
      });
  }
}

async function worker(tg) {
  let result = tg.next();
  while (!result.done) {
    console.log('Pre-rendering tile:', result.value);
    const { x, y, zoom } = result.value;
    await render(pool, zoom, x, y, 1);
    result = tg.next();
  }
}

function* getTiles(minLon, maxLon, minLat, maxLat, minZoom, maxZoom) {
  for (let zoom = minZoom; zoom <= maxZoom; zoom++) {
    const minX = long2tile(minLon, zoom);
    const maxX = long2tile(maxLon, zoom);
    const minY = lat2tile(maxLat, zoom);
    const maxY = lat2tile(minLat, zoom);

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        yield { zoom, x, y };
      }
    }
  }
}

function long2tile(lon, zoom) {
  return (Math.floor((lon + 180) / 360 * Math.pow(2, zoom)));
}

function lat2tile(lat, zoom) {
  return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)));
}
