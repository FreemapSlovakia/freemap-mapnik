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
      .addRule({ filter: "[type] = 'forest' or [type] = 'wood'" })
        .addBorderedPolygonSymbolizer('#8CCF8C')
      .addRule({ filter: "[type] = 'farmland'" })
        .addBorderedPolygonSymbolizer('#EEE0BB')
      .addRule({ filter: "[type] = 'meadow'" })
        .addBorderedPolygonSymbolizer('#BFFF9F')
      .addRule({ filter: "[type] = 'residential'" })
        .addBorderedPolygonSymbolizer('#e0e0e0')
      .addRule({ filter: "[type] = 'farmyard'" })
        .addBorderedPolygonSymbolizer('#dec47c')
      .addRule({ filter: "[type] = 'allotments'" })
        .addBorderedPolygonSymbolizer('#dec47c')
      .addRule({ filter: "[type] = 'industrial'" })
        .addBorderedPolygonSymbolizer('#d0d0d0')
      .addRule({ filter: "[type] = 'commercial'" })
        .addBorderedPolygonSymbolizer('#e79dcc')
    .addStyle('Water-area')
      .addRule()
        .addBorderedPolygonSymbolizer(colors.water)
    .addStyle('Water-line')
      .addRule({ filter: "[type] = 'river'" })
        .addLineSymbolizer({ stroke: colors.water, strokeWidth: 1 })
      .addRule({ filter: "[type] <> 'river'" })
        .addLineSymbolizer({ stroke: colors.water, strokeWidth: 0.5 })
    .addStyle('tracks')
      .addRule({ filter: "[type] = 'residential' or [type] = 'service' or [type] = 'unclassified' or [type] = 'road' or [type] = 'primary' or [type] = 'secondary' or [type] = 'tertiary' or [type] = 'motorway' or [type] = 'trunk'" })
        .addLineSymbolizer({ stroke: '#ffffff', strokeWidth: 3, strokeOpacity: 0.5 })
        .addLineSymbolizer({ stroke: '#804040', strokeWidth: 1.2 })
      .addRule({ filter: "[type] = 'path'" })
        .addLineSymbolizer({ stroke: '#ffffff', strokeWidth: 3, strokeOpacity: 0.5 })
        .addLineSymbolizer({ stroke: '#804040', strokeWidth: 1.2, strokeDasharray: '2,2' })
      .addRule({ filter: "[type] = 'footway'" })
        .addLineSymbolizer({ stroke: '#ffffff', strokeWidth: 3, strokeOpacity: 0.5 })
        .addLineSymbolizer({ stroke: '#804040', strokeWidth: 1.2, strokeDasharray: '3,1' })
      .addRule({ filter: "[type] = 'track'" })
        .addLineSymbolizer({ stroke: '#ffffff', strokeWidth: 3, strokeOpacity: 0.5 })
      .doInStyle((style) => {
        [undefined, '8,2', '6,4', '4,6', '2,8', '3,7,7,3'].forEach((strokeDasharray, i) => {
          style
            .addRule({ filter: `[type] = 'track' and [tracktype] = ${i === 5 ? `''` : `'grade${i + 1}'`}` })
              .addLineSymbolizer({ stroke: colors.track, strokeWidth: 1.2, strokeDasharray })
        });
      })
    .addStyle('buildings')
      .addRule()
        .addPolygonSymbolizer({ fill: colors.building })
    .addStyle('hillshade')
      .addRule()
        .addRasterSymbolizer({ opacity: 0.5, compOp: 'multiply', scaling: 'bilinear' })
    .addStyle('infopoints')
      .addRule({ filter: "[type] = 'guidepost'" })
        .addMarkersSymbolizer({ file: 'style/guidepost.svg', width: 10, height: 10, fill: '#000000' })
        .addTextSymbolizer({ size: 10, faceName: 'DejaVu Sans Book', fill: 'black', haloFill: 'white', haloRadius: 1, dy: -8 }, "[name] + '\n' + [ele]")
    .addStyle('naturalpoints')
      .addRule({ filter: "[type] = 'peak'" })
        .addMarkersSymbolizer({ file: 'style/peak.svg', width: 6, height: 6, fill: '#000000' })
        .addTextSymbolizer({ size: 10, faceName: 'DejaVu Sans Book', fill: 'black', haloFill: 'white', haloRadius: 1, dy: -8 }, "[name] + '\n' + [ele]")
      .addRule({ filter: "[type] = 'spring'" })
        .addMarkersSymbolizer({ file: 'style/spring.svg', width: 10, height: 12, fill: '#4040ff' })
        .addTextSymbolizer({ size: 10, faceName: 'DejaVu Sans Book', fill: 'black', haloFill: 'white', haloRadius: 1, dy: -8 }, '[name]')
    .addStyle('placenames')
      .addRule({ filter: "not([type] = 'locality')" })
        .addTextSymbolizer({ size: 20, faceName: 'DejaVu Sans Book', fill: 'black', haloFill: 'white', haloRadius: 1, opacity: 0.5, avoidEdges: true }, '[name]')
    .addStyle('routes')
      .doInStyle(routes('hiking'))
      .doInStyle(routes('bicycle'))
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
      `select name, type, geometry from import.osm_landusages order by z_order`)
    .addSqlLayer('landcover', 'Water-area',
      `select geometry, name, type from import.osm_waterareas`)
    .addSqlLayer('landcover', 'Water-line',
      `select geometry, name, type from import.osm_waterways`)
    .addSqlLayer('tracks', 'tracks',
      `select geometry, type, tracktype from import.osm_roads order by z_order`)
    .addSqlLayer('buildings', 'buildings',
      `select geometry, name, type from import.osm_buildings`)
    .addSqlLayer('contours', 'contours',
      `select height, way from contour`)
    .addLayer('hillshade', 'hillshade', {
      type: 'gdal',
      file: 'hgt/N48E020_warped.tif',
    })
    .addSqlLayer('routes', 'routes',
      `select geometry, concat('/', string_agg("osmc:symbol", '/')) as osmc_symbol, concat('/', string_agg(colour, '/'), '/') as colour, import.osm_routes.type from import.osm_route_members join import.osm_routes using(osm_id) group by member, geometry, import.osm_routes.type`)
    .addSqlLayer('naturalpoints', 'naturalpoints',
      `select name, ele, type, geometry from import.osm_naturalpoints`)
    .addSqlLayer('infopoints', 'infopoints',
      `select name, ele, type, geometry from import.osm_infopoints`)
    .addSqlLayer('placenames', 'placenames',
      `select name, type, geometry from import.osm_places`)
    .stringify();
}

function routes(type) {
  const matchFn = type === 'hiking' ? osmcMatch : colourMatch;
  return (style) => {
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
            .map((x, i) => condNot(matchFn(colors[i]), x === '0'))
            .join(' and ')
        );
        style
          .addRule({ filter: `[type] = '${type}' and ${matchFn(colors[colorIdx])}${ors.length ? ` and (${ors.map(or => `(${or})`).join(' or ')})` : ''}` })
            .addLineSymbolizer({
              stroke: colors[colorIdx],
              strokeWidth: 2,
              strokeLinejoin: 'round',
              offset: (4 + ones * 2) * (type === 'hiking' ? 1 : -1),
              ...(type === 'hiking' ? {} : { strokeDasharray: '2,2' }),
            });
      });
    }
  };
}

function osmcMatch(color) {
  return `[osmc_symbol].match('.*/${color}:.*')`;
}

function colourMatch(color) {
  return `[colour].match('.*/${color}/.*')`;
}

function condNot(expr, negate) {
  return negate ? `not(${expr})` : expr;
}
