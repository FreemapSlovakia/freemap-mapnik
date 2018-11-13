const config = require('config');
const { createMap } = require('../styleBuilder');
const { mercSrs } = require('../projections');

const dbParams = config.get('db');

const addLayers = require('./layers');
const addRoutes = require('./routes');

const colors = {
  contour: '#000000',
  water: 'hsl(220, 65%, 75%)',
  building: '#808080',
  track: '#804040',
};

const smoothness = 0;

const glowDflt = { stroke: '#ffffff', strokeOpacity: 0.5, smooth: smoothness };
const highwayDflt = { stroke: colors.track, smooth: smoothness };

module.exports = function generateFreemapStyle() {
  /* eslint-disable indent */
  return createMap({
    backgroundColor: 'white',
    srs: mercSrs,
    bufferSize: 256,
  }, {
    dbParams,
  })
    .addStyle('landcover')
      .addRule({ filter: "[type] = 'forest' or [type] = 'wood'" })
        .addBorderedPolygonSymbolizer('hsl(120, 40%, 75%)')
      .addRule({ filter: "[type] = 'farmland'" })
        .addBorderedPolygonSymbolizer('hsl(60, 60%, 95%)')
      .addRule({ filter: "[type] = 'meadow' or [type] = 'grassland' or [type] = 'park' or [type] = 'grassland' or [type] = 'park'" })
        .addBorderedPolygonSymbolizer('hsl(100, 100%, 85%)')
      .addRule({ filter: "[type] = 'heath'" })
        .addBorderedPolygonSymbolizer('hsl(80, 85%, 80%)')
      .addRule({ filter: "[type] = 'scrub'" })
        .addBorderedPolygonSymbolizer('hsl(128, 40%, 65%)')
      .addRule({ filter: "[type] = 'quarry'" })
        .addBorderedPolygonSymbolizer('#9E9E9E')
      .addRule({ filter: "[type] = 'landfill'" })
        .addBorderedPolygonSymbolizer('#A06D6D')
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
      .addRule({ filter: "[type] = 'orchard'" })
        .addBorderedPolygonSymbolizer('#e0ffcc')
      .addRule({ filter: "[type] = 'wetland'" })
        .addBorderedPolygonSymbolizer('hsl(200, 80%, 90%)')
      .addRule({ filter: "[type] = 'pitch' or [type] = 'playground'" })
        .addBorderedPolygonSymbolizer('#ceac6e')
        .addLineSymbolizer({ stroke: 'gray', strokeWidth: 1 })
      .addRule({ filter: "[type] = 'parking'" })
        .addBorderedPolygonSymbolizer('#cc9999')
        .addLineSymbolizer({ stroke: colors.track, strokeWidth: 1 })
    .addStyle('water_area')
      .addRule()
        .addBorderedPolygonSymbolizer(colors.water)
    .addStyle('water_line')
      .addRule({ filter: "[type] = 'river'" })
        .addLineSymbolizer({ stroke: colors.water, strokeWidth: 2.2, smooth: smoothness })
      .addRule({ filter: "[type] <> 'river'", minZoom: 11 })
        .addLineSymbolizer({ stroke: colors.water, strokeWidth: 1.2, smooth: smoothness })
    .addStyle('highways')
      .addRule({ filter: "[type] = 'rail' or [type] = 'tram' or [type] = 'light_rail'" })
        .addLinePatternSymbolizer({ file: 'images/rail.svg' })
      .addRule({ filter: "[type] = 'motorway' or [type] = 'trunk'" })
        .addLineSymbolizer({ ...highwayDflt, strokeWidth: 3 })
      .addRule({ filter: "[type] = 'primary' or [type] = 'secondary' or [type] = 'tertiary'" })
        .addLineSymbolizer({ ...highwayDflt, strokeWidth: 2 })
      .addRule({ filter: "[type] = 'residential' or [type] = 'service' or [type] = 'unclassified' or [type] = 'road'", minZoom: 12 })
        .addLineSymbolizer({ ...highwayDflt, strokeWidth: 1.5 })
      .addRule({ filter: "[type] = 'path'", minZoom: 12 })
        .addLineSymbolizer({ ...highwayDflt, strokeWidth: 1, strokeDasharray: '3,3' })
      .addRule({ filter: "[type] = 'footway' or [type] = 'pedestrian' or [type] = 'steps'", minZoom: 12 })
        .addLineSymbolizer({ ...highwayDflt, strokeWidth: 1, strokeDasharray: '3,1' })
      .addRule({ filter: "[type] = 'cycleway'", minZoom: 12 })
        .addLineSymbolizer({ ...highwayDflt, strokeWidth: 1, strokeDasharray: '4,2' })
      .doInStyle((style) => {
        [undefined, '8,2', '6,4', '4,6', '2,8', '3,7,7,3'].forEach((strokeDasharray, i) => {
          style
            .addRule({ filter: `[type] = 'track' and [tracktype] = ${i === 5 ? "''" : `'grade${i + 1}'`}`, minZoom: 12 })
              .addLineSymbolizer({ ...highwayDflt, strokeWidth: 1.2, strokeDasharray });
        });
      })
    .addStyle('higwayGlows')
      .addRule({ filter: "[type] = 'path' or [type] = 'footway' or [type] = 'pedestrian' or [type] = 'steps'", minZoom: 12 })
        .addLineSymbolizer({ ...glowDflt, strokeWidth: 1 })
      .addRule({ filter: "[type] = 'track'", minZoom: 12 })
        .addLineSymbolizer({ ...glowDflt, strokeWidth: 1.2 })
    .addStyle('buildings')
      .addRule({ minZoom: 13 })
        .addPolygonSymbolizer({ fill: colors.building })
    .addStyle('protected_areas')
      .addRule({ minZoom: 11 })
        .addLinePatternSymbolizer({ file: 'images/protected_area.svg' })
    .addStyle('borders')
      .addRule()
      .addLineSymbolizer({ stroke: '#a000ff', strokeWidth: 6, strokeOpacity: 0.5 })
    .addStyle('naturalways')
      .addRule({ filter: "[type] = 'cliff'", minZoom: 11 })
      .addLinePatternSymbolizer({ file: 'images/cliff.svg' })
        .addLineSymbolizer({ stroke: '#404040', strokeWidth: 1 })
    .addStyle('hillshade')
      .addRule()
        .addRasterSymbolizer({ opacity: 0.5, compOp: 'multiply', scaling: 'bilinear' })
    .addStyle('infopoints')
      .addRule({ filter: "[type] = 'guidepost'", minZoom: 12 }) // TODO show some dot on 11, 10
        .addMarkersSymbolizer({ file: 'images/guidepost.svg' })
    .addStyle('naturalpoints')
      .addRule({ filter: "[type] = 'peak'", minZoom: 11 })
        .addMarkersSymbolizer({ file: 'images/peak.svg', width: 6, height: 6, fill: '#000000' })
      .addRule({ filter: "[type] = 'spring'", minZoom: 13 })
        .addMarkersSymbolizer({ file: 'images/spring.svg' })
      .addRule({ filter: "[type] = 'cave_entrance'", minZoom: 13 })
        .addMarkersSymbolizer({ file: 'images/cave.svg' })

    .addStyle('protected_area_names')
      .addRule({ minZoom: 12 })
        .addTextSymbolizer({ size: 10, faceName: 'DejaVu Sans Book', fill: '#008000', haloFill: 'white', haloRadius: 1, placement: 'interior' }, '[name]')
    .addStyle('naturalpoint_names')
      .addRule({ filter: "[type] = 'peak'", minZoom: 12 })
        .addTextSymbolizer({ size: 10, faceName: 'DejaVu Sans Book', fill: 'black', haloFill: 'white', haloRadius: 1, dy: -8 }, "[name] + '\n' + [ele]")
      .addRule({ filter: "[type] = 'cave_entrance'", minZoom: 12 })
        .addTextSymbolizer({ size: 10, faceName: 'DejaVu Sans Book', fill: 'black', haloFill: 'white', haloRadius: 1, dy: -20 }, '[name]')
      .addRule({ filter: "[type] = 'spring'", minZoom: 14 })
        .addTextSymbolizer({ size: 10, faceName: 'DejaVu Sans Book', fill: 'black', haloFill: 'white', haloRadius: 1, dy: -8 }, '[name]')
    .addStyle('infopoint_names')
      .addRule({ filter: "[type] = 'guidepost'", minZoom: 13 })
        .addTextSymbolizer({ size: 10, faceName: 'DejaVu Sans Book', fill: 'black', haloFill: 'white', haloRadius: 1, dy: -8,
          wrapWidth: 80, wrapBefore: true }, "[name] + '\n' + [ele]")
    .addStyle('amenity_names')
      .addRule({ minZoom: 15 })
        .addTextSymbolizer({ size: 10, faceName: 'DejaVu Sans Book', fill: 'black', haloFill: 'white', haloRadius: 1 }, '[name]')
    .addStyle('water_area_names')
      .addRule({ filter: "not([type] = 'riverbank')", minZoom: 12 })
        .addTextSymbolizer({ size: 10, faceName: 'DejaVu Sans Book', fill: 'blue', haloFill: 'white', haloRadius: 1, placement: 'interior' }, '[name]')
    .addStyle('highway_names')
      .addRule({ minZoom: 15 })
        .addTextSymbolizer({ size: 10, faceName: 'DejaVu Sans Book', fill: '#3d1d1d', haloFill: 'white', haloRadius: 1, placement: 'line' }, '[name]')
    .addStyle('water_line_names')
      .addRule({ minZoom: 12, filter: '[type] = river' })
        .addTextSymbolizer({ size: 10, faceName: 'DejaVu Sans Book', fill: 'blue', haloFill: 'white', haloRadius: 1, placement: 'line' }, '[name]')
      .addRule({ minZoom: 14, filter: '[type] <> river' })
        .addTextSymbolizer({ size: 10, faceName: 'DejaVu Sans Book', fill: 'blue', haloFill: 'white', haloRadius: 1, placement: 'line' }, '[name]')

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
    .doInMap(addRoutes)
    .addStyle('contours', { opacity: 0.33 })
      .addRule({ minZoom: 13, filter: '([height] % 100 = 0) and ([height] != 0)' })
        .addLineSymbolizer({ stroke: colors.contour, strokeWidth: 0.3, smooth: smoothness })
      .addRule({ minZoom: 14, filter: '([height] % 10 = 0) and ([height] != 0)' })
        .addLineSymbolizer({ stroke: colors.contour, strokeWidth: 0.2, smooth: smoothness })
      .addRule({ maxZoom: 13, minZoom: 13, filter: '([height] % 20 = 0) and ([height] != 0)' })
        .addLineSymbolizer({ stroke: colors.contour, strokeWidth: 0.2, smooth: smoothness })
      .addRule({ maxZoom: 12, minZoom: 12, filter: '([height] % 50 = 0) and ([height] != 0)' })
        .addLineSymbolizer({ stroke: colors.contour, strokeWidth: 0.2, smooth: smoothness })

    .doInMap(addLayers)

    .stringify();
};
