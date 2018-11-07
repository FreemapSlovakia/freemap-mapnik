const { mkdir, rename, exists, writeFile, readdir, unlink, readFile } = require('fs');
const path = require('path');
const { promisify } = require('util');

const mapnik = require('mapnik');
const config = require('config');
const Koa = require('koa');
const Router = require('koa-router');
const send = require('koa-send');
const genericPool = require('generic-pool');
const exit = require('exit')

const generateFreemapStyle = require('./lib/freemapStyleGenerator');
const { mercSrs } = require('./lib/projections');

const app = new Koa();
const router = new Router();

const existsAsync = promisify(exists);
const mkdirAsync = promisify(mkdir);
const renameAsync = promisify(rename);
const writeFileAsync = promisify(writeFile);
const readdirAsync = promisify(readdir);
const unlinkAsync = promisify(unlink);
const readFileAsync = promisify(readFile);

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
    try {
      await map.fromStringAsync(xml);
    } catch (error) {
      console.log("Failed to create map tile worker:")
      console.log(error)
      exit(1);
    }
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

async function expireTiles() {
  const expiresDir = './expires'; // TODO make configurable

  const dirs = await readdirAsync(expiresDir);
  const fullFiles = [].concat(...await Promise.all(dirs.map((dirs) => path.join(expiresDir, dirs)).map(async (fd) => readdirAsync(fd).then((x) => x.map((xx) => path.join(fd, xx))))));

  const tiles = [];

  (await Promise.all(fullFiles.map((ff) => readFileAsync(ff, 'utf8'))))
    .join('\n')
    .split('\n')
    .filter((x) => x.trim())
    .forEach((tile) => {
      collectZoomedTiles(tiles, tile);
    });

  await Promise.all([...new Set(tiles)].map((tile) => unlinkAsync(path.resolve(tilesDir, `${tile}.png`)).catch((e) => {})));

  await Promise.all(fullFiles.map((ff) => unlinkAsync(ff)));
}

setInterval(() => {
  expireTiles().catch((err) => {
    console.error('Error expiring tiles:', err);
  });
}, 60 * 1000);

function collectZoomedTiles(tiles, tile) {
  collectZoomedOutTiles(tiles, ...tile.split('/'));
  collectZoomedInTiles(tiles, ...tile.split('/'));
}

function collectZoomedOutTiles(tiles, zoom, x, y) {
  tiles.push(`${zoom}/${x}/${y}`);
  const z = Number.parseInt(zoom, 10);
  if (z > 0) {
    collectZoomedOutTiles(tiles, z - 1, Math.floor(x / 2), Math.floor(y / 2));
  }
}

function collectZoomedInTiles(tiles, zoom, x, y) {
  tiles.push(`${zoom}/${x}/${y}`);
  const z = Number.parseInt(zoom, 10);
  if (z < 19) { // TODO make maxzoom configurable
    for (const [dx, dy] of [[0, 0], [0, 1], [1, 0], [1, 1]]) {
      collectZoomedInTiles(tiles, z + 1, x * 2 + dx, y * 2 + dy);
    }
  }
}
