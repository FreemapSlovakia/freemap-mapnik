const { createMap } = require('./styleBuilder');
const { mercSrs } = require('./projections');

const colors = {
  contour: '#000000',
  water: '#8080ff',
  building: '#404040',
  track: '#804040',
};

module.exports = function generateFreemapStyle() {
  return createMap({
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
      .addRule({ filter: "[landuse] = 'residential'" })
        .addBorderedPolygonSymbolizer('#e0e0e0')
      .addRule({ filter: "[landuse] = 'farmyard'" })
        .addBorderedPolygonSymbolizer('#dec47c')
      .addRule({ filter: "[landuse] = 'allotments'" })
        .addBorderedPolygonSymbolizer('#dec47c')
      .addRule({ filter: "[landuse] = 'industrial'" })
        .addBorderedPolygonSymbolizer('#d0d0d0')
      .addRule({ filter: "[landuse] = 'commercial'" })
        .addBorderedPolygonSymbolizer('#e79dcc')
    .addStyle('Water-area')
      .addRule({ filter: "[natural] = 'water'" })
        .addBorderedPolygonSymbolizer(colors.water)
    .addStyle('Water-line')
      .addRule({ filter: "[waterway] = 'river'" })
        .addLineSymbolizer({ stroke: colors.water, strokeWidth: 0.5 })
      .addRule({ filter: "[waterway] <> 'river'" })
        .addLineSymbolizer({ stroke: colors.water, strokeWidth: 0.2 })
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
      .doInStyle((style) => {
        [undefined, '8,2', '6,4', '4,6', '2,8', '3,7,7,3'].forEach((strokeDasharray, i) => {
          style
            .addRule({ filter: `[highway] = 'track' and [tracktype] = ${i === 5 ? 'null' : `'grade${i + 1}'`}` })
              .addLineSymbolizer({ stroke: colors.track, strokeWidth: 1.2, strokeDasharray })
        });
      })
    .addStyle('buildings')
      .addRule()
        .addPolygonSymbolizer({ fill: colors.building })
    .addStyle('hillshade')
      .addRule()
        .addRasterSymbolizer({ opacity: 0.5, compOp: 'multiply', scaling: 'bilinear' })
    .addStyle('peaks')
      .addRule({ filter: "[natural] = 'peak'" })
        .addMarkersSymbolizer({ file: 'style/peak.svg', width: 6, height: 6, fill: '#000000' })
        .addTextSymbolizer({ size: 10, faceName: 'DejaVu Sans Book', fill: 'black', haloFill: 'white', haloRadius: 1, dy: -8 }, "[name] + '\n' + [ele]")
      .addRule({ filter: "[natural] = 'spring'" })
        .addMarkersSymbolizer({ file: 'style/spring.svg', width: 8, height: 8, fill: '#4040ff' })
        .addTextSymbolizer({ size: 10, faceName: 'DejaVu Sans Book', fill: 'black', haloFill: 'white', haloRadius: 1, dy: -8 }, '[name]')
      .addRule({ filter: 'not ([place] = null)' })
        .addTextSymbolizer({ size: 20, faceName: 'DejaVu Sans Book', fill: 'black', haloFill: 'white', haloRadius: 1, opacity: 0.5 }, '[name]')
    .addStyle('hiking')
      .doInStyle((style) => {
        const colors = [ 'red', 'blue', 'green', 'yellow' ];
        for (let colorIdx = 0; colorIdx < colors.length; colorIdx++) {
          const m = new Map();
          for (let x = 0; x < 1 << colorIdx; x++) {
            const ones = (x.toString(2).match(/1/g) || []).length;
            let q = m.get(ones);
            if (!q) {
              q = [];
              m.set(ones, q);
            }
            q.push(x.toString(2).padStart(colorIdx, '0'));
          }

          m.forEach((combs, ones) => {
            const ors = !colorIdx ? [] : combs.map(
              (comb) => comb
                .split('')
                .map((x, i) => `${x === '0' ? 'not(' : ''}[osmc_symbol].match('.*/${colors[i]}:.*')${x === '0' ? ')' : ''}`)
                .join(' and ')
            );
            style
              .addRule({ filter: `[osmc_symbol].match('.*/${colors[colorIdx]}:.*')${ors.length ? ` and (${ors.map(or => `(${or})`).join(' or ')})` : ''}` })
                .addLineSymbolizer({ stroke: colors[colorIdx], strokeWidth: 2, strokeLinejoin: 'round', offset: 4 + ones * 2 });
          });
        }
      })
    .addStyle('contours', { opacity: 0.33 })
      .addRule({ maxZoom: 13, filter: "([height] % 100 = 0) and ([height] != 0)" })
        .addLineSymbolizer({ stroke: colors.contour, strokeWidth: 0.3 })
      .addRule({ maxZoom: 14, filter: "([height] % 10 = 0) and ([height] != 0)" })
        .addLineSymbolizer({ stroke: colors.contour, strokeWidth: 0.2 })
      .addRule({ minZoom: 13, maxZoom: 13, filter: "([height] % 20 = 0) and ([height] != 0)" })
        .addLineSymbolizer({ stroke: colors.contour, strokeWidth: 0.2 })
      .addRule({ minZoom: 12, maxZoom: 12, filter: "([height] % 50 = 0) and ([height] != 0)" })
        .addLineSymbolizer({ stroke: colors.contour, strokeWidth: 0.2 })
    .addSqlLayer('landcover', 'Landcover',
      `select "natural", landuse, way from planet_osm_polygon
        where landuse in ('forest', 'farmland', 'farmyard', 'allotments', 'industrial', 'commercial', 'wood', 'meadow', 'residential') or "natural" in ('scrub', 'wood', 'heath')`)
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
      `select name, ele, "natural", place, way from planet_osm_point where "natural" in ('peak', 'spring') or "place" <> 'locality'`)
    .stringify();
  }
