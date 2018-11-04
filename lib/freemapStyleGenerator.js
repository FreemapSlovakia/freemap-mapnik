const config = require('config');
const { createMap } = require('./styleBuilder');
const { mercSrs } = require('./projections');

const dbParams = config.get('db');
const contours = config.get('contours');
const shading = config.get('shading');

const colors = {
  contour: '#000000',
  water: '#8080ff',
  building: '#808080',
  track: '#804040',
};

const smoothness = 0;

const glowDflt = { stroke: '#ffffff', strokeOpacity: 0.5, smooth: smoothness };
const highwayDflt = { stroke: '#804040', smooth: smoothness };

module.exports = function generateFreemapStyle() {
  return createMap({
    backgroundColor: 'white',
    srs: mercSrs,
    bufferSize: 256,
  }, {
    dbParams,
  })
    .addStyle('landcover')
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
        .addLineSymbolizer({ stroke: colors.water, strokeWidth: 2, smooth: smoothness })
      .addRule({ filter: "[type] <> 'river'", minZoom: 11 })
        .addLineSymbolizer({ stroke: colors.water, strokeWidth: 1, smooth: smoothness })
    .addStyle('highways')
      .addRule({ filter: "[type] = 'rail' or [type] = 'tram' or [type] = 'light_rail'" })
        .addLinePatternSymbolizer({ file: 'style/rail.svg' })
      .addRule({ filter: "[type] = 'motorway' or [type] = 'trunk'" })
        .addLineSymbolizer({ ...highwayDflt, strokeWidth: 3 })
      .addRule({ filter: "[type] = 'primary' or [type] = 'secondary' or [type] = 'tertiary'" })
        .addLineSymbolizer({ ...highwayDflt, strokeWidth: 2 })
      .addRule({ filter: "[type] = 'residential' or [type] = 'service' or [type] = 'unclassified' or [type] = 'road'", minZoom: 12 })
        .addLineSymbolizer({ ...highwayDflt, strokeWidth: 1.5 })
      .addRule({ filter: "[type] = 'path'", minZoom: 12 })
        .addLineSymbolizer({ ...highwayDflt, strokeWidth: 1, strokeDasharray: '3,3' })
      .addRule({ filter: "[type] = 'footway'", minZoom: 12 })
        .addLineSymbolizer({ ...highwayDflt, strokeWidth: 1, strokeDasharray: '3,1' })
      .addRule({ filter: "[type] = 'cycleway'", minZoom: 12 })
        .addLineSymbolizer({ ...highwayDflt, strokeWidth: 1, strokeDasharray: '4,2' })
      .doInStyle((style) => {
        [undefined, '8,2', '6,4', '4,6', '2,8', '3,7,7,3'].forEach((strokeDasharray, i) => {
          style
            .addRule({ filter: `[type] = 'track' and [tracktype] = ${i === 5 ? `''` : `'grade${i + 1}'`}`, minZoom: 12 })
              .addLineSymbolizer({ ...highwayDflt, strokeWidth: 1.2, strokeDasharray })
        });
      })
    .addStyle('higwayGlows')
      .addRule({ filter: "[type] = 'motorway' or [type] = 'trunk'" })
        .addLineSymbolizer({ ...glowDflt, strokeWidth: 5 })
      .addRule({ filter: "[type] = 'primary' or [type] = 'secondary' or [type] = 'tertiary'" })
        .addLineSymbolizer({ ...glowDflt, strokeWidth: 4 })
      .addRule({ filter: "[type] = 'residential' or [type] = 'service' or [type] = 'unclassified' or [type] = 'road'", minZoom: 12 })
        .addLineSymbolizer({ ...glowDflt, strokeWidth: 2.5 })
      .addRule({ filter: "[type] = 'path' or [type] = 'footway' or [type] = 'cycleway'", minZoom: 12 })
        .addLineSymbolizer({ ...glowDflt, strokeWidth: 3 })
      .addRule({ filter: "[type] = 'track'", minZoom: 12 })
        .addLineSymbolizer({ ...glowDflt, strokeWidth: 3.2 })
    .addStyle('buildings')
      .addRule({ minZoom: 13 })
        .addPolygonSymbolizer({ fill: colors.building })
    .addStyle('protected_areas')
      .addRule({ minZoom: 11 })
        .addLineSymbolizer({ stroke: '#008000', strokeWidth: 2, strokeDasharray: '5,5' })
        // .addLinePatternSymbolizer({ file: 'style/protected_area.svg' })
        .addTextSymbolizer({ size: 10, faceName: 'DejaVu Sans Book', fill: '#008000', haloFill: 'white', haloRadius: 1 }, "[name]")
    .addStyle('naturalways')
      .addRule({ filter: "[type] = 'cliff'", minZoom: 11 })
        .addLineSymbolizer({ stroke: '#000000', strokeWidth: 1 })
        .addLinePatternSymbolizer({ file: 'style/cliff.svg' })
    .addStyle('hillshade')
      .addRule()
        .addRasterSymbolizer({ opacity: 0.5, compOp: 'multiply', scaling: 'bilinear' })
    .addStyle('infopoints')
      .addRule({ filter: "[type] = 'guidepost'", minZoom: 12 }) // TODO show some dot on 11, 10
        .addMarkersSymbolizer({ file: 'style/guidepost.svg', width: 10, height: 10, fill: '#000000' })
        .addTextSymbolizer({ size: 10, faceName: 'DejaVu Sans Book', fill: 'black', haloFill: 'white', haloRadius: 1, dy: -8,
          wrapWidth: 80, wrapBefore: true }, "[name] + '\n' + [ele]")
    .addStyle('naturalpoints')
      // .withRuleDefaults({ ... }) // TODO
      .addRule({ filter: "[type] = 'peak'", minZoom: 11 })
        .addMarkersSymbolizer({ file: 'style/peak.svg', width: 6, height: 6, fill: '#000000' })
        .addTextSymbolizer({ size: 10, faceName: 'DejaVu Sans Book', fill: 'black', haloFill: 'white', haloRadius: 1, dy: -8 }, "[name] + '\n' + [ele]")
      .addRule({ filter: "[type] = 'spring'", minZoom: 12 })
        .addMarkersSymbolizer({ file: 'style/spring.svg', width: 10, height: 12, fill: '#4040ff' })
        .addTextSymbolizer({ size: 10, faceName: 'DejaVu Sans Book', fill: 'black', haloFill: 'white', haloRadius: 1, dy: -8 }, '[name]')
    .addStyle('placenames')
      .doInStyle((style) => {
        for (let z = 6; z < 20; z++) {
          const opacity = 1 - ((z - 6) / (20 - 6));
          const sc = Math.pow(1.3, z);

          style
            .addRule({ filter: "[type] = 'city' or [type] = 'town'", minZoom: z, maxZoom: z })
              .addTextSymbolizer({ size: 1.5 * sc, faceName: 'DejaVu Sans Book', fill: 'black', haloFill: 'white', haloRadius: 1, opacity, haloOpacity: opacity }, '[name]');

          if (z > 9) {
            style
              .addRule({ filter: "[type] = 'village' or [type] = 'suburb'", minZoom: z, maxZoom: z })
                .addTextSymbolizer({ size: 0.75 * sc, faceName: 'DejaVu Sans Book', fill: 'black', haloFill: 'white', haloRadius: 1, opacity, haloOpacity: opacity }, '[name]');
          }

          if (z > 10) {
            style
              .addRule({ filter: "[type] = 'hamlet'", minZoom: z, maxZoom: z })
                .addTextSymbolizer({ size: 0.5 * sc, faceName: 'DejaVu Sans Book', fill: 'black', haloFill: 'white', haloRadius: 1, opacity, haloOpacity: opacity }, '[name]');
          }
        }
      })
    .addStyle('routes')
      .doInStyle(routes('hiking'))
      .doInStyle(routes('bicycle'))
    .addStyle('contours', { opacity: 0.33 })
      .addRule({ minZoom: 13, filter: "([height] % 100 = 0) and ([height] != 0)" })
        .addLineSymbolizer({ stroke: colors.contour, strokeWidth: 0.3, smooth: smoothness })
      .addRule({ minZoom: 14, filter: "([height] % 10 = 0) and ([height] != 0)" })
        .addLineSymbolizer({ stroke: colors.contour, strokeWidth: 0.2, smooth: smoothness })
      .addRule({ maxZoom: 13, minZoom: 13, filter: "([height] % 20 = 0) and ([height] != 0)" })
        .addLineSymbolizer({ stroke: colors.contour, strokeWidth: 0.2, smooth: smoothness })
      .addRule({ maxZoom: 12, minZoom: 12, filter: "([height] % 50 = 0) and ([height] != 0)" })
        .addLineSymbolizer({ stroke: colors.contour, strokeWidth: 0.2, smooth: smoothness })
    .addSqlLayer('landcover',
      `select name, type, geometry from import.osm_landusages order by z_order`)
    .addSqlLayer('Water-area',
      `select geometry, name, type from import.osm_waterareas`)
    .addSqlLayer('Water-line',
      `select geometry, name, type from import.osm_waterways`)
    .addSqlLayer('protected_areas',
      `select name, geometry from import.osm_protected_areas`)
    .addSqlLayer('naturalways',
      `select geometry, type from import.osm_naturalways`)
    .addSqlLayer('higwayGlows',
      `select geometry, type, tracktype from import.osm_roads order by z_order`)
    .addSqlLayer('highways',
      `select geometry, type, tracktype from import.osm_roads order by z_order`)
    .addSqlLayer('buildings',
      `select geometry, name, type from import.osm_buildings`)
    .doInMap((map) => {
      if (contours) {
        map.addSqlLayer('contours',
          `select height, way from contour`);
      }
      if (shading) {
        map.addLayer('hillshade', {
          type: 'gdal',
          file: 'hgt/hillshade_warped.tif',
        });
      }
    })
    .addSqlLayer('routes',
      `select geometry, concat('/', string_agg("osmc:symbol", '/')) as osmc_symbol, concat('/', string_agg(colour, '/'), '/') as colour, import.osm_routes.type from import.osm_route_members join import.osm_routes using(osm_id) group by member, geometry, import.osm_routes.type`)
    .addSqlLayer('naturalpoints',
      `select name, ele, type, geometry from import.osm_naturalpoints`)
    .addSqlLayer('infopoints',
      `select name, ele, type, geometry from import.osm_infopoints`,
      { /* bufferSize: 512 */ })
    .addSqlLayer('placenames',
      `select name, type, geometry from import.osm_places order by z_order desc`,
      { clearLabelCache: 'on', bufferSize: 1024 })
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
        const filter = `[type] = '${type}' and ${matchFn(colors[colorIdx])}${ors.length ? ` and (${ors.map(or => `(${or})`).join(' or ')})` : ''}`;
        for (let a = 0; a < 2; a++) {
          style
            .addRule({ filter, minZoom: a === 0 ? 12 : 9, maxZoom: a === 0 ? undefined : 11 })
              .addLineSymbolizer({
                stroke: colors[colorIdx],
                strokeWidth: 2,
                strokeLinejoin: 'round',
                offset: ((a === 0 ? 3 : 1) + ones * 2) * (type === 'hiking' ? 1 : -1),
                ...(type === 'hiking' ? {} : { strokeDasharray: '2,2' }),
                smooth: smoothness,
              });
        }
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
