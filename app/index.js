const { tmpdir } = require('os');
const path = require('path');
const { promisify } = require('util');
const { cpus } = require('os');
const process = require('process');
const http = require('http');
const { stat, unlink } = require('fs').promises;

const mapnik = require('mapnik');
const config = require('config');
const Koa = require('koa');
const Router = require('koa-router');
const send = require('koa-send');
const genericPool = require('generic-pool');

const generateMapnikConfig = require('./style');
const markDirtyTiles = require('./dirtyTilesMarker');
const renderTile = require('./renderrer');
const prerender = require('./prerenderrer');

mapnik.register_default_fonts();
mapnik.register_default_input_plugins();

const mp = mapnik.Map.prototype;
mp.fromStringAsync = promisify(mp.fromString);
mp.renderFileAsync = promisify(mp.renderFile);
mp.renderAsync = promisify(mp.render);
mapnik.Image.prototype.encodeAsync = promisify(mapnik.Image.prototype.encode);

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
  const file = await renderTile(pool, Number.parseInt(zoom, 10), Number.parseInt(x, 10), Number.parseInt(y, 10), false);
  const stats = await stat(file);

  ctx.status = 200;
  ctx.set('Last-Modified', stats.mtime.toUTCString());

  if (ctx.fresh) {
    ctx.status = 304;
    return;
  }

  await send(ctx, `${zoom}/${x}/${y}.png`, { root: tilesDir });
});

let tmpIndex = Date.now();

// example: http://localhost:4000/pdf?zoom=13&bbox=21.4389,48.6531,21.6231,48.7449&scale=0.75
router.get('/pdf', async (ctx) => {
  const zoom = Number.parseInt(ctx.query.zoom, 10);
  const bbox = (ctx.query.bbox || '').split(',').map((c) => Number.parseFloat(c));
  if (zoom < 0 || zoom > 20 || bbox.length !== 4 || bbox.some((c) => Number.isNaN(c))) {
    ctx.status = 400;
    return;
  }
  const filename = `export-${tmpIndex++}.pdf`;
  const exportFile = path.resolve(tmpdir(), filename);
  try {
    await renderTile.toPdf(exportFile, xml, zoom, bbox,
      Number.parseFloat(ctx.query.scale) || undefined,
      Number.parseFloat(ctx.query.width) || undefined,
    );
    ctx.status = 200;
    await send(ctx, filename, { root: tmpdir() });
  } finally {
    await unlink(exportFile);
  }
});

app
  .use(router.routes())
  .use(router.allowedMethods());

const server = http.createServer(app.callback());
server.listen(serverPort);

let dtmRunning = false;
const expiratorInterval = setInterval(() => {
  if (dtmRunning) {
    return;
  }
  dtmRunning = true;
  markDirtyTiles(tilesDir)
    .then(() => {
      prerender(pool, false);
    })
    .catch((err) => {
      console.error('Error expiring tiles:', err);
    })
    .then(() => {
      dtmRunning = false;
    });
}, 60 * 1000);

const xml = generateMapnikConfig();

if (dumpXml) {
  console.log('Mapnik config:', xml);
}

const factory = {
  async create() {
    const map = new mapnik.Map(256, 256);
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

prerender(pool, true);
