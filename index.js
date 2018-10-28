const mapnik = require('mapnik');
const { promisify } = require('util');
const Koa = require('koa');
const Router = require('koa-router');
const send = require('koa-send');
const genericPool = require('generic-pool');
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
}, {
  dbParams: {
    type: 'postgis',
    password: 'b0n0',
    host: 'localhost',
    port: 5432,
    user: 'martin',
    dbname: 'martin',
  }
})
  .addStyle('Landcover')
    .addRule({ filter: "[landuse] = 'forest' or [landuse] = 'wood' or [natural] = 'wood'" })
      .addBorderedPolygonSymbolizer('#8CCF8C')
    .addRule({ filter: "[landuse] = 'farmland'" })
      .addBorderedPolygonSymbolizer('#EEE0BB')
    .addRule({ filter: "[landuse] = 'meadow'" })
      .addBorderedPolygonSymbolizer('#BFFF9F')
  .addStyle('Water-area')
    .addRule({ filter: "[natural] = 'water'" })
      .addBorderedPolygonSymbolizer('#8080ff')
  .addStyle('Water-line')
    .addRule({ filter: "[waterway] = 'river'" })
      .addLineSymbolizer({ stroke: '#BFFF9F', strokeWidth: 0.5 })
    .addRule({ filter: "[waterway] <> 'river'" })
      .addLineSymbolizer({ stroke: '#BFFF9F', strokeWidth: 0.2 })
  .addStyle('tracks')
    .addRule({ filter: "[highway] = 'residential' or [highway] = 'service' or [highway] = 'unclassified' or [highway] = 'road' or [highway] = 'primary' or [highway] = 'secondary' or [highway] = 'tertiary' or [highway] = 'motorway' or [highway] = 'trunk'" })
      .addLineSymbolizer({ stroke: '#ffffff', strokeWidth: 3, strokeOpacity: 0.5 })
      .addLineSymbolizer({ stroke: '#804040', strokeWidth: 1.2 })
    .addRule({ filter: "[highway] = 'path'" })
      .addLineSymbolizer({ stroke: '#ffffff', strokeWidth: 3, strokeOpacity: 0.5 })
      .addLineSymbolizer({ stroke: '#804040', strokeWidth: 1.2, strokeDasharray: '2,2' })
    .addRule({ filter: "[highway] = 'footway'" })
      .addLineSymbolizer({ stroke: '#ffffff', strokeWidth: 3, strokeOpacity: 0.5 })
      .addLineSymbolizer({ stroke: '#804040', strokeWidth: 1.2, strokeDasharray: '3,1' })
    .addRule({ filter: "[highway] = 'track'" })
      .addLineSymbolizer({ stroke: '#ffffff', strokeWidth: 3, strokeOpacity: 0.5 })
    .addRule({ filter: "[highway] = 'track' and [tracktype] = 'grade1'" })
      .addLineSymbolizer({ stroke: '#804040', strokeWidth: 1.2 })
    .addRule({ filter: "[highway] = 'track' and [tracktype] = 'grade2'" })
      .addLineSymbolizer({ stroke: '#804040', strokeWidth: 1.2, strokeDasharray: '8,2' })
    .addRule({ filter: "[highway] = 'track' and [tracktype] = 'grade3'" })
      .addLineSymbolizer({ stroke: '#804040', strokeWidth: 1.2, strokeDasharray: '6,4' })
    .addRule({ filter: "[highway] = 'track' and [tracktype] = 'grade4'" })
      .addLineSymbolizer({ stroke: '#804040', strokeWidth: 1.2, strokeDasharray: '4,6' })
    .addRule({ filter: "[highway] = 'track' and [tracktype] = 'grade5'" })
      .addLineSymbolizer({ stroke: '#804040', strokeWidth: 1.2, strokeDasharray: '2,8' })
    .addRule({ filter: "[highway] = 'track' and [tracktype] = null" })
      .addLineSymbolizer({ stroke: '#804040', strokeWidth: 1.2, strokeDasharray: '3,7,7,3' })
  .addStyle('buildings')
    .addRule()
      .addPolygonSymbolizer({ fill: '#404040' })
  .addStyle('hillshade')
    .addRule()
      .addRasterSymbolizer({ opacity: 0.5, compOp: 'multiply', scaling: 'bilinear' })
  .addStyle('peaks')
    .addRule({ filter: "[natural] = 'peak'" })
      .addMarkersSymbolizer({ file: 'style/peak.svg', width: 6, height: 6, fill: '#000000' })
      .addTextSymbolizer({ size: 10, faceName: "DejaVu Sans Book", fill: "black", haloFill: "white", haloRadius: 1, dy: -8 }, "[name] + '\n' + [ele]")
    .addRule({ filter: "not ([place] = null)" })
      .addTextSymbolizer({ size: 20, faceName: 'DejaVu Sans Book', fill: 'black', haloFill: 'white', haloRadius: 1, opacity: 0.5 }, '[name]')
  .addStyle('hiking')
    .doInStyle((style) => {
      style
        .addRule({ filter: "[osmc_symbol].match('.*/red:.*')" })
        .addLineSymbolizer({ stroke: '#ff0000', strokeWidth: 2, strokeLinejoin: 'round', offset: 4 });

      // TODO other colors
      //   <Rule>
      //   <Filter>&y_red;</Filter>
      //   <LineSymbolizer stroke="#ff0000" stroke-width="2" stroke-linejoin="round" offset="4"/>
      // </Rule>

      // <Rule>
      //   <Filter>not(&y_red;) and &y_blue;</Filter>
      //   <LineSymbolizer stroke="#0000ff" stroke-width="2" stroke-linejoin="round" offset="4"/>
      // </Rule>
      // <Rule>
      //   <Filter>&y_red; and &y_blue;</Filter>
      //   <LineSymbolizer stroke="#0000ff" stroke-width="2" stroke-linejoin="round" offset="6" />
      // </Rule>

      // <Rule>
      //   <Filter>not(&y_red;) and not(&y_blue;) and &y_green;</Filter>
      //   <LineSymbolizer stroke="#00ff00" stroke-width="2" stroke-linejoin="round" offset="4"/>
      // </Rule>
      // <Rule>
      //   <Filter>((not(&y_red;) and &y_blue;) or (&y_red; and not(&y_blue;))) and &y_green;</Filter>
      //   <LineSymbolizer stroke="#00ff00" stroke-width="2" stroke-linejoin="round" offset="6" />
      // </Rule>
      // <Rule>
      //   <Filter>&y_red; and &y_blue; and &y_green;</Filter>
      //   <LineSymbolizer stroke="#00ff00" stroke-width="2" stroke-linejoin="round" offset="8" />
      // </Rule>

      // <Rule>
      //   <Filter>not(&y_red;) and not(&y_blue;) and not(&y_green;) and &y_yellow;</Filter>
      //   <LineSymbolizer stroke="#ffff00" stroke-width="2" stroke-linejoin="round" offset="4"/>
      // </Rule>
      // <Rule>
      //   <Filter>((&y_red; and not(&y_blue;) and not(&y_green;)) or (not(&y_red;) and &y_blue; and not(&y_green;)) or (not(&y_red;) and not(&y_blue;) and &y_green;)) and &y_yellow;</Filter>
      //   <LineSymbolizer stroke="#ffff00" stroke-width="2" stroke-linejoin="round" offset="6" />
      // </Rule>
      // <Rule>
      //   <Filter>((&y_red; and &y_blue; and not(&y_green;)) or (&y_red; and not(&y_blue;) and &y_green;) or (not(&y_red;) and &y_blue; and &y_green;)) and &y_yellow;</Filter>
      //   <LineSymbolizer stroke="#ffff00" stroke-width="2" stroke-linejoin="round" offset="8" />
      // </Rule>
      // <Rule>
      //   <Filter>&y_red; and &y_blue; and &y_green; and &y_yellow;</Filter>
      //   <LineSymbolizer stroke="#ffff00" stroke-width="2" stroke-linejoin="round" offset="10" />
      // </Rule>

    })
  .addStyle('contours', { opacity: 0.33 })
    .addRule({ maxZoom: 13, filter: "([height] % 100 = 0) and ([height] != 0)" })
      .addLineSymbolizer({ stroke: '#000000', strokeWidth: 0.3 })
    .addRule({ maxZoom: 14, filter: "([height] % 10 = 0) and ([height] != 0)" })
      .addLineSymbolizer({ stroke: '#000000', strokeWidth: 0.2 })
    .addRule({ minZoom: 13, maxZoom: 13, filter: "([height] % 20 = 0) and ([height] != 0)" })
      .addLineSymbolizer({ stroke: '#000000', strokeWidth: 0.2 })
    .addRule({ minZoom: 12, maxZoom: 12, filter: "([height] % 50 = 0) and ([height] != 0)" })
      .addLineSymbolizer({ stroke: '#000000', strokeWidth: 0.2 })
  .addSqlLayer('landcover', 'Landcover',
    `select "natural", landuse, way from planet_osm_polygon
      where landuse in ('forest', 'farmland', 'wood', 'meadow') or "natural" in ('scrub', 'wood', 'heath')`)
  .addSqlLayer('landcover', 'Water-area',
    `select "natural", landuse, way from planet_osm_polygon where "natural" in ('water')`)
  .addSqlLayer('landcover', 'Water-line',
    `select "waterway", way from planet_osm_line where "waterway" in ('stream', 'river', 'ditch', 'drain')`)
  .addSqlLayer('tracks', 'tracks', `select way, highway, tracktype from planet_osm_line where "highway" in
    ('track', 'service', 'path', 'trunk', 'motorway', 'residential', 'primary', 'secondary', 'tertiary', 'unclassified', 'footway', 'construction')`)
  .addSqlLayer('buildings', 'buildings',
    `select way from planet_osm_polygon where building is not null or building <> 'no'`)
  .addSqlLayer('contours', 'contours',
    `select height, way from contour`)
  .addLayer('hillshade', 'hillshade', {
    type: 'gdal',
    file: 'hgt/N48E020_warped.tif',
  })
  .addSqlLayer('hiking', 'hiking',
    `select geometry, concat('/', string_agg("osmc:symbol", '/')) as osmc_symbol from import.osm_hiking_members join import.osm_hiking using(osm_id) group by member, geometry`)
  .addSqlLayer('peaks', 'peaks',
    `select name, ele, "natural", place, way from planet_osm_point where "natural" in ('peak') or "place" <> 'locality'`)
  .stringify();

console.log('XXXXX', xml);

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
