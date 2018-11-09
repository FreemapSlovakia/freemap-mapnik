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
const removeDirtyTiles = require('./dirtyTilesRemover');
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

router.get('/:zoom/:x/:y', async (ctx) => {
  const { zoom, x, y } = ctx.params;
  if (zoom < minZoom || zoom > maxZoom) {
    return;
  }
  const file = await render(pool, Number.parseInt(zoom), Number.parseInt(x), Number.parseInt(y));
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
  removeDirtyTiles(tilesDir).catch((err) => {
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
  max: 'max' in workers ? workers.max : cpus().length,
  min: 'min' in workers ? workers.min : cpus().length,
});

pool.on('factoryCreateError', async (error) => {
  process.exitCode = 1;
  console.error('Error creating or configuring Mapnik:', error);
  server.close();
  await pool.drain();
  await pool.clear();
  clearInterval(expiratorInterval);
});
