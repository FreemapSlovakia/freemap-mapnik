const { mkdir, rename, exists, writeFile } = require('fs');
const path = require('path');
const { promisify } = require('util');

const mapnik = require('mapnik');
const config = require('config');
const Koa = require('koa');
const Router = require('koa-router');
const send = require('koa-send');
const genericPool = require('generic-pool');

const generateFreemapStyle = require('./lib/freemapStyleGenerator');
const { mercSrs } = require('./lib/projections');

const app = new Koa();
const router = new Router();

const existsAsync = promisify(exists);
const mkdirAsync = promisify(mkdir);
const renameAsync = promisify(rename);
const writeFileAsync = promisify(writeFile);

const tilesDir = config.get('tilesDir');
const serverPort = config.get('server.port');
const forceTileRendering = config.get('forceTileRendering');
const dumpXml = config.get('dumpXml');

router.get('/:zoom/:x/:y', async (ctx) => {
  const { zoom, x, y } = ctx.params;
  await render(Number.parseInt(zoom), Number.parseInt(x), Number.parseInt(y));
  await send(ctx, `${zoom}/${x}/${y}.png`, { root: tilesDir });
});

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(serverPort);

mapnik.register_default_fonts();
mapnik.register_default_input_plugins();

mapnik.Map.prototype.loadAsync = promisify(mapnik.Map.prototype.load);
mapnik.Map.prototype.fromStringAsync = promisify(mapnik.Map.prototype.fromString);
mapnik.Map.prototype.renderAsync = promisify(mapnik.Map.prototype.render);
mapnik.Map.prototype.renderFileAsync = promisify(mapnik.Map.prototype.renderFile);
mapnik.Image.prototype.encodeAsync = promisify(mapnik.Image.prototype.encode);

const xml = generateFreemapStyle();

if (dumpXml) {
  console.log('Style:', xml);
}

const factory = {
  async create() {
    const map = new mapnik.Map(256, 256);
    await map.fromStringAsync(xml);
    return map;
  },
  async destroy(map) {
    // TODO ?
  },
};

const opts = {
  max: 8, // maximum size of the pool (TODO make configurable)
  min: 8, // minimum size of the pool (TODO make configurable)
};

const pool = genericPool.createPool(factory, opts);

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
  if (forceTileRendering || !await existsAsync(`${p}.png`)) {
    await mkdirFull(frags);
    // await map.renderFileAsync(`${p}_tmp.png`, { format: 'png' });
    const im = new mapnik.Image(256, 256);
    await map.renderAsync(im, { buffer_size: 256 });
    im.encodeAsync = promisify(im.encode);
    const buffer = await im.encodeAsync('png');
    await writeFileAsync(`${p}_tmp.png`, buffer);
    await renameAsync(`${p}_tmp.png`, `${p}.png`);
  }

  pool.release(map);
}

async function mkdirFull(frags) {
  if (!frags.length) {
    return;
  }
  const p = path.join(...frags);
  if (!await existsAsync(p)) {
    await mkdirFull(frags.slice(0, frags.length - 1));
    try {
      await mkdirAsync(p);
    } catch (e) {
      // parallel creations may cause error
      if (!await existsAsync(p)) {
        throw e;
      }
    }
  }
}
