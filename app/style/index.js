const config = require('config');
const { createMap } = require('../styleBuilder');
const { mercSrs } = require('../projections');

const dbParams = config.get('db');

const layers = require('./layers');
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
const fontDflt = { faceName: 'DejaVu Sans Book', haloFill: 'white', haloRadius: 1 };

module.exports = function generateFreemapStyle() {
  /* eslint-disable indent */
  return createMap({
    backgroundColor: 'white',
    srs: mercSrs,
    bufferSize: 256,
  }, {
    dbParams,
  })
    .style('landcover')
      .rule({ filter: types(['forest', 'wood']) })
        .borderedPolygonSymbolizer('hsl(120, 40%, 75%)')
      .rule({ filter: "[type] = 'farmland'" })
        .borderedPolygonSymbolizer('hsl(60, 60%, 95%)')
      .rule({ filter: types(['meadow', 'grassland', 'park', 'grassland', 'park']) })
        .borderedPolygonSymbolizer('hsl(100, 100%, 85%)')
      .rule({ filter: "[type] = 'heath'" })
        .borderedPolygonSymbolizer('hsl(80, 85%, 80%)')
      .rule({ filter: "[type] = 'scrub'" })
        .borderedPolygonSymbolizer('hsl(128, 40%, 65%)')
      .rule({ filter: "[type] = 'quarry'" })
        .borderedPolygonSymbolizer('#9E9E9E')
      .rule({ filter: "[type] = 'landfill'" })
        .borderedPolygonSymbolizer('#A06D6D')
      .rule({ filter: types(['residential', 'living_street']) })
        .borderedPolygonSymbolizer('#e0e0e0')
      .rule({ filter: "[type] = 'farmyard'" })
        .borderedPolygonSymbolizer('#dec47c')
      .rule({ filter: "[type] = 'allotments'" })
        .borderedPolygonSymbolizer('#dec47c')
      .rule({ filter: "[type] = 'industrial'" })
        .borderedPolygonSymbolizer('#d0d0d0')
      .rule({ filter: "[type] = 'commercial'" })
        .borderedPolygonSymbolizer('#e79dcc')
      .rule({ filter: "[type] = 'orchard'" })
        .borderedPolygonSymbolizer('#e0ffcc')
      .rule({ filter: "[type] = 'wetland'" })
        .borderedPolygonSymbolizer('hsl(200, 80%, 90%)')
      .rule({ filter: types(['pitch', 'playground']) })
        .borderedPolygonSymbolizer('#ceac6e')
        .lineSymbolizer({ stroke: 'gray', strokeWidth: 1 })
      .rule({ filter: "[type] = 'parking'" })
        .borderedPolygonSymbolizer('#cc9999')
        .lineSymbolizer({ stroke: colors.track, strokeWidth: 1 })
    .style('water_area')
      .rule()
        .borderedPolygonSymbolizer(colors.water)
    .style('water_line')
      .rule({ filter: "[type] = 'river'" })
        .lineSymbolizer({ stroke: colors.water, strokeWidth: 2.2, smooth: smoothness })
      .rule({ filter: "[type] <> 'river'", minZoom: 11 })
        .lineSymbolizer({ stroke: colors.water, strokeWidth: 1.2, smooth: smoothness })
    .style('highways')
      .rule({ filter: types(['rail', 'tram', 'light_rail']) })
        .linePatternSymbolizer({ file: 'images/rail.svg' })
      .rule({ filter: types(['motorway', 'trunk', 'motorway_link', 'trunk_link']) })
        .lineSymbolizer({ ...highwayDflt, strokeWidth: 3 })
      .rule({ filter: types(['primary', 'secondary', 'tertiary', 'primary_link', 'secondary_link', 'tertiary_link']) })
        .lineSymbolizer({ ...highwayDflt, strokeWidth: 2 })
      .rule({ filter: types(['residential', 'service', 'unclassified', 'road']), minZoom: 12 })
        .lineSymbolizer({ ...highwayDflt, strokeWidth: 1.5 })
      .rule({ filter: "[type] = 'path'", minZoom: 12 })
        .lineSymbolizer({ ...highwayDflt, strokeWidth: 1, strokeDasharray: '3,3' })
      .rule({ filter: types(['footway', 'pedestrian', 'steps']), minZoom: 12 })
        .lineSymbolizer({ ...highwayDflt, strokeWidth: 1, strokeDasharray: '3,1' })
      .rule({ filter: "[type] = 'cycleway'", minZoom: 12 })
        .lineSymbolizer({ ...highwayDflt, strokeWidth: 1, strokeDasharray: '4,2' })
      .doInStyle((style) => {
        [undefined, '8,2', '6,4', '4,6', '2,8', '3,7,7,3'].forEach((strokeDasharray, i) => {
          style
            .rule({ filter: `[type] = 'track' and [tracktype] = ${i === 5 ? "''" : `'grade${i + 1}'`}`, minZoom: 12 })
              .lineSymbolizer({ ...highwayDflt, strokeWidth: 1.2, strokeDasharray });
        });
      })
    .style('higwayGlows')
      .rule({ filter: types(['path', 'footway', 'pedestrian', 'steps']), minZoom: 12 })
        .lineSymbolizer({ ...glowDflt, strokeWidth: 1 })
      .rule({ filter: "[type] = 'track'", minZoom: 12 })
        .lineSymbolizer({ ...glowDflt, strokeWidth: 1.2 })
    .style('buildings')
      .rule({ minZoom: 13 })
        .polygonSymbolizer({ fill: colors.building })
    .style('protected_areas')
      .rule({ minZoom: 11 })
        .linePatternSymbolizer({ file: 'images/protected_area.svg' })
    .style('borders')
      .rule()
      .lineSymbolizer({ stroke: '#a000ff', strokeWidth: 6, strokeOpacity: 0.5 })
    .style('feature_lines')
      .rule({ filter: "[type] = 'cliff'", minZoom: 12 })
        .linePatternSymbolizer({ file: 'images/cliff.svg' })
        .lineSymbolizer({ stroke: '#404040', strokeWidth: 1 })
      .rule({ filter: "[type] = 'line'", minZoom: 13 })
        .lineSymbolizer({ stroke: 'black', strokeWidth: 1, strokeOpacity: 0.5 })
    .style('hillshade')
      .rule()
        .rasterSymbolizer({ opacity: 0.5, compOp: 'multiply', scaling: 'bilinear' })
    .style('infopoints')
      .rule({ filter: "[type] = 'guidepost'", minZoom: 12 }) // TODO show some dot on 11, 10
        .markersSymbolizer({ file: 'images/guidepost.svg' })
    .style('feature_points')
      .rule({ filter: "[type] = 'peak'", minZoom: 11 })
        .markersSymbolizer({ file: 'images/peak.svg', width: 6, height: 6, fill: '#000000' })
      .rule({ filter: "[type] = 'spring'", minZoom: 13 })
        .markersSymbolizer({ file: 'images/spring.svg' })
      .rule({ filter: "[type] = 'cave_entrance'", minZoom: 13 })
        .markersSymbolizer({ file: 'images/cave.svg' })
      .rule({ filter: "[type] = 'tower'", minZoom: 13 })
        .markersSymbolizer({ file: 'images/power_tower.svg' })
      .rule({ filter: types(['hut', 'alpine_hut', 'chalet', 'guest_house', 'hostel', 'hotel']), minZoom: 13 })
        .markersSymbolizer({ file: 'images/hut.svg' })

    // texts

    .style('protected_area_names')
      .rule({ minZoom: 12 })
        .textSymbolizer({ ...fontDflt, fill: '#008000', placement: 'interior' }, '[name]')
    .style('feature_point_names', { filterMode: 'first' })
      .rule({ filter: "[type] = 'peak'", minZoom: 12 })
        .textSymbolizer({ ...fontDflt, dy: -8 }, "[name] + '\n' + [ele]")
      .rule({ filter: "[type] = 'cave_entrance'", minZoom: 14 })
        .textSymbolizer({ ...fontDflt, dy: -10 }, "[name] + '\n' + [ele]")
        .rule({ filter: types(['hut', 'alpine_hut', 'chalet', 'guest_house', 'hostel', 'hotel']), minZoom: 14 })
        .textSymbolizer({ ...fontDflt, dy: -10 }, "[name] + '\n' + [ele]")
      .rule({ filter: "[type] = 'spring'", minZoom: 14 })
        .textSymbolizer({ ...fontDflt, dy: -10 }, "[name] + '\n' + [ele]")
      .rule({ minZoom: 15 })
        .textSymbolizer({ ...fontDflt }, "[name] + '\n' + [ele]")
    .style('infopoint_names')
      .rule({ filter: "[type] = 'guidepost'", minZoom: 13 })
        .textSymbolizer({ ...fontDflt, dy: -10,
          wrapWidth: 80, wrapBefore: true }, "[name] + '\n' + [ele]")
    .style('water_area_names')
      .rule({ filter: "not([type] = 'riverbank')", minZoom: 12 })
        .textSymbolizer({ ...fontDflt, fill: 'blue', placement: 'interior' }, '[name]')
    .style('building_names')
      .rule({ minZoom: 15 })
        .textSymbolizer({ ...fontDflt, placement: 'interior' }, '[name]')
    .style('highway_names')
      .rule({ minZoom: 15 })
        .textSymbolizer({ ...fontDflt, fill: '#3d1d1d', placement: 'line' }, '[name]')
    .style('feature_line_names')
      .rule({ filter: '[type] = valley', minZoom: 13 })
        .textSymbolizer({ ...fontDflt, size: 16, opacity: 0.5, haloOpacity: 0.5, placement: 'line'  }, '[name]') // TODO size by zoom as for placenames
    .style('water_line_names')
      .rule({ minZoom: 12, filter: "[type] = 'river'" })
        .textSymbolizer({ ...fontDflt, fill: 'blue', placement: 'line' }, '[name]')
      .rule({ minZoom: 14, filter: "[type] <> 'river'" })
        .textSymbolizer({ ...fontDflt, fill: 'blue', placement: 'line' }, '[name]')

    .style('placenames')
      .doInStyle((style) => {
        for (let z = 6; z < 20; z++) {
          const opacity = 1 - ((z - 6) / (20 - 6));
          const sc = Math.pow(1.3, z);

          style
            .rule({ filter: "[type] = 'city' or [type] = 'town'", minZoom: z, maxZoom: z })
              .textSymbolizer({ ...fontDflt, size: 1.5 * sc, opacity, haloOpacity: opacity }, '[name]');

          if (z > 9) {
            style
              .rule({ filter: "[type] = 'village' or [type] = 'suburb'", minZoom: z, maxZoom: z })
                .textSymbolizer({ ...fontDflt, size: 0.75 * sc, opacity, haloOpacity: opacity }, '[name]');
          }

          if (z > 10) {
            style
              .rule({ filter: "[type] = 'hamlet'", minZoom: z, maxZoom: z })
                .textSymbolizer({ ...fontDflt, size: 0.5 * sc, opacity, haloOpacity: opacity }, '[name]');
          }
        }
      })
    .doInMap(addRoutes)
    .style('contours', { opacity: 0.33 })
      .rule({ minZoom: 13, filter: '([height] % 100 = 0) and ([height] != 0)' })
        .lineSymbolizer({ stroke: colors.contour, strokeWidth: 0.3, smooth: smoothness })
      .rule({ minZoom: 14, filter: '([height] % 10 = 0) and ([height] != 0)' })
        .lineSymbolizer({ stroke: colors.contour, strokeWidth: 0.2, smooth: smoothness })
      .rule({ maxZoom: 13, minZoom: 13, filter: '([height] % 20 = 0) and ([height] != 0)' })
        .lineSymbolizer({ stroke: colors.contour, strokeWidth: 0.2, smooth: smoothness })
      .rule({ maxZoom: 12, minZoom: 12, filter: '([height] % 50 = 0) and ([height] != 0)' })
        .lineSymbolizer({ stroke: colors.contour, strokeWidth: 0.2, smooth: smoothness })

    .doInMap(layers)

    .stringify();
};

function types(type) {
  return type.map((x) => `[type] = '${x}'`).join(' or ');
}
