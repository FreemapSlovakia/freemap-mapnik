const path = require('path');
const { rename, exists, writeFile, readdir, unlink, readFile, ensureDir } = require('fs-extra');
const { promisify } = require('util');
const { cpus } = require('os');
const process = require('process');
const http = require('http');

const mapnik = require('mapnik');
const config = require('config');
const Koa = require('koa');
const Router = require('koa-router');
const send = require('koa-send');
const genericPool = require('generic-pool');

const generateConfig = require('./lib/style');
const { mercSrs } = require('./lib/projections');
const computeZoomedTiles = require('./lib/zoomedTileComputer');

const app = new Koa();
const router = new Router();

const tilesDir = config.get('dirs.tiles');
const expiresDir = config.get('dirs.expires');
const serverPort = config.get('server.port');
const forceTileRendering = config.get('forceTileRendering');
const dumpXml = config.get('dumpXml');
const minZoom = config.get('zoom.min');
const maxZoom = config.get('zoom.max');
const workers = config.get('workers');

router.get('/:zoom/:x/:y', async (ctx) => {
  const { zoom, x, y } = ctx.params;
  if (zoom < minZoom || zoom > maxZoom) {
    return;
  }
  await render(Number.parseInt(zoom), Number.parseInt(x), Number.parseInt(y));
  await send(ctx, `${zoom}/${x}/${y}.png`, { root: tilesDir });
});

app
  .use(router.routes())
  .use(router.allowedMethods());

const server = http.createServer(app.callback());
server.listen(serverPort);

mapnik.register_default_fonts();
mapnik.register_default_input_plugins();

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
  async destroy(map) {
    // nothing to do
  },
};

const opts = {
  max: 'max' in workers ? workers.max : cpus().length,
  min: 'min' in workers ? workers.min : cpus().length,
};

const pool = genericPool.createPool(factory, opts);

pool.on('factoryCreateError', async (error) => {
  process.exitCode = 1;
  console.error('Error creating or configuring Mapnik:', error);
  server.close();
  await pool.drain();
  await pool.clear();
  clearInterval(expiratorInterval);
});

function transformCoords(zoom, xtile, ytile) {
  const n = Math.pow(2, zoom);
  const lon_deg = xtile / n * 360.0 - 180.0
  const lat_rad = Math.atan(Math.sinh(Math.PI * (1 - 2 * ytile / n)))
  const lat_deg = lat_rad * 180.0 / Math.PI
  return [lon_deg, lat_deg];
}

const merc = new mapnik.Projection(mercSrs);

async function render(zoom, x, y) {
  const map = await pool.acquire();
  map.zoomToBox(merc.forward([...transformCoords(zoom, x, y + 1), ...transformCoords(zoom, x + 1, y)]));
  map.renderFileAsync = promisify(map.renderFile);
  map.renderAsync = promisify(map.render);

  const frags = [tilesDir, zoom.toString(10), x.toString(10)];

  const p = path.join(...frags, `${y}`);
  if (forceTileRendering || !await exists(`${p}.png`)) {
    await ensureDir(path.join(...frags));
    // await map.renderFileAsync(`${p}_tmp.png`, { format: 'png' });
    const im = new mapnik.Image(256, 256);
    await map.renderAsync(im, { buffer_size: 256 });
    im.encodeAsync = promisify(im.encode);
    const buffer = await im.encodeAsync('png');
    const tmpName = `${p}_tmp.png`;
    await writeFile(tmpName, buffer);
    await rename(tmpName, `${p}.png`);
  }

  pool.release(map);
}

async function expireTiles() {
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
    .filter((x) => x.trim())
    .map(computeZoomedTiles));

  await Promise.all([...new Set(tiles)].map((tile) => unlink(path.resolve(tilesDir, `${tile}.png`)).catch((e) => {})));
  await Promise.all(fullFiles.map(unlink));
}

const expiratorInterval = setInterval(() => {
  expireTiles().catch((err) => {
    console.error('Error expiring tiles:', err);
  });
}, 60 * 1000);
