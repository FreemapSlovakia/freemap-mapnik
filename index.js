const mapnik = require('mapnik');
const { promisify } = require('util');
const Koa = require('koa');
const Router = require('koa-router');
const send = require('koa-send');
const genericPool = require('generic-pool');
const { exec } = require('child_process');
const { createMap } = require('./lib/styleBuilder');

const app = new Koa();
const router = new Router();

router.get('/:zoom/:x/:y', async (ctx) => {
  const { zoom, x, y } = ctx.params;
  await render(Number.parseInt(zoom), Number.parseInt(x), Number.parseInt(y));
  await send(ctx, `tiles/tile_${zoom}_${x}_${y}.png`);
});

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000);

mapnik.register_default_fonts();
mapnik.register_default_input_plugins();

mapnik.Map.prototype.loadAsync = promisify(mapnik.Map.prototype.load);
mapnik.Map.prototype.fromStringAsync = promisify(mapnik.Map.prototype.fromString);
mapnik.Map.prototype.renderAsync = promisify(mapnik.Map.prototype.render);
mapnik.Map.prototype.renderFileAsync = promisify(mapnik.Map.prototype.renderFile);
mapnik.Image.prototype.encodeAsync = promisify(mapnik.Image.prototype.encode);

const mercSrs = '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs +over';

const merc = new mapnik.Projection(mercSrs);

const xml = createMap({
  backgroundColor: 'white',
  srs: mercSrs,
  bufferSize: 256,
})
  .addStyle('Landcover')
    .addRule()
      .addFilter("[landuse] = 'forest' or [landuse] = 'wood' or [natural] = 'wood'")
      .rule.addPolygonSymbolizer({ fill: '#8CCF8C' })
      .rule.addLineSymbolizer({ stroke: '#8CCF8C', strokeWidth: 1 })
  .map.stringify();

console.log('XXXX', xml);

const factory = {
  async create() {
    const map = new mapnik.Map(256, 256);
    const xml = await new Promise((resolve, reject) => {
      exec('xmllint --noent style/stylesheet.xml', (err, out) => {
        if (err) {
          reject(err);
        } else {
          resolve(out);
        }
      });
    });
    await map.fromStringAsync(xml);
    return map;
  },
  async destroy(map) {
    // TODO ?
  },
};

const opts = {
  max: 8, // maximum size of the pool
  min: 8 // minimum size of the pool
};

const pool = genericPool.createPool(factory, opts);

function transformCoords(zoom, xtile, ytile) {
  const n = Math.pow(2, zoom);
  const lon_deg = xtile / n * 360.0 - 180.0
  const lat_rad = Math.atan(Math.sinh(Math.PI * (1 - 2 * ytile / n)))
  const lat_deg = lat_rad * 180.0 / Math.PI
  return [lon_deg, lat_deg];
}

async function render(zoom, x, y) {
  const map = await pool.acquire();
  map.zoomToBox(merc.forward([...transformCoords(zoom, x, y + 1), ...transformCoords(zoom, x + 1, y)]));
  map.renderFileAsync = promisify(map.renderFile);
  await map.renderFileAsync(`tiles/tile_${zoom}_${x}_${y}.png`, { format: 'png' });
  pool.release(map);
}
