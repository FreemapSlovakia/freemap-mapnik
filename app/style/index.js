const config = require('config');
const { createMap } = require('jsnik');
const { mercSrs } = require('../projections');

const dbParams = config.get('db');
const contoursCfg = config.get('mapFeatures.contours');
const shadingCfg = config.get('mapFeatures.shading');
const hikingTrailsCfg = config.get('mapFeatures.hikingTrails');
const bicycleTrailsCfg = config.get('mapFeatures.bicycleTrails');

const { layers } = require('./layers');
const { routes } = require('./routes');

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
const fontDfltWrap = { ...fontDflt,wrapWidth: 100, wrapBefore: true };

function generateFreemapStyle(shading = shadingCfg, contours = contoursCfg, hikingTrails = hikingTrailsCfg, bicycleTrails = bicycleTrailsCfg) {
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
        .borderedPolygonSymbolizer('hsl(120, 45%, 75%)')
      .rule({ filter: "[type] = 'farmland'" })
        .borderedPolygonSymbolizer('hsl(60, 70%, 95%)')
      .rule({ filter: types(['meadow', 'grassland', 'grass', 'park', 'cemetery']) })
        .borderedPolygonSymbolizer('hsl(100, 85%, 85%)')
      .rule({ filter: types(['cemetery']) })
        .polygonPatternSymbolizer({ file: 'images/grave.svg' })
      .rule({ filter: "[type] = 'heath'" })
        .borderedPolygonSymbolizer('hsl(85, 60%, 80%)')
      .rule({ filter: "[type] = 'scrub'" })
        .borderedPolygonSymbolizer('hsl(140, 40%, 70%)')
      .rule({ filter: "[type] = 'quarry'" })
        .borderedPolygonSymbolizer('#9E9E9E')
        .polygonPatternSymbolizer({ file: 'images/quarry.svg' })
      .rule({ filter: "[type] = 'landfill'" })
        .borderedPolygonSymbolizer('#A06D6D')
      .rule({ filter: types(['residential', 'living_street']) })
        .borderedPolygonSymbolizer('#e0e0e0')
      .rule({ filter: "[type] = 'farmyard'" })
        .borderedPolygonSymbolizer('hsl(50, 44%, 80%)')
      .rule({ filter: "[type] = 'allotments'" })
        .borderedPolygonSymbolizer('hsl(50, 45%, 85%)')
      .rule({ filter: "[type] = 'industrial'" })
        .borderedPolygonSymbolizer('#d0d0d0')
      .rule({ filter: "[type] = 'commercial'" })
        .borderedPolygonSymbolizer('#e79dcc')
      .rule({ filter: "[type] = 'orchard'" })
        .borderedPolygonSymbolizer('#e0ffcc')
      .rule({ filter: "[type] = 'wetland'" })
        .borderedPolygonSymbolizer('hsl(200, 80%, 90%)')
      .rule({ filter: types(['pitch', 'playground']) })
        .borderedPolygonSymbolizer('hsl(140, 50%, 70%)')
        .lineSymbolizer({ stroke: 'hsl(140, 50%, 40%)', strokeWidth: 1 })
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
    .style('barrierways')
      .rule({ minZoom: 15 })
        .lineSymbolizer({ stroke: '#ff0000', strokeWidth: 1, strokeDasharray: '2,1' })
    .style('highways')
      .rule({ filter: "[class] = 'railway'" })
        .linePatternSymbolizer({ file: 'images/rail.svg' })
      .rule({ filter: types(['motorway', 'trunk', 'motorway_link', 'trunk_link']) })
        .lineSymbolizer({ ...highwayDflt, strokeWidth: 3 })
      .rule({ filter: types(['primary', 'secondary', 'tertiary', 'primary_link', 'secondary_link', 'tertiary_link']) })
        .lineSymbolizer({ ...highwayDflt, strokeWidth: 2 })
      .rule({ filter: types(['living_street', 'residential', 'service', 'unclassified', 'road']), minZoom: 12 })
        .lineSymbolizer({ ...highwayDflt, strokeWidth: 1.5 })
      .rule({ filter: "[type] = 'path'", minZoom: 12 })
        .lineSymbolizer({ ...highwayDflt, strokeWidth: 1, strokeDasharray: '3,3' })
      .rule({ filter: types(['footway', 'pedestrian', 'steps']), minZoom: 12 })
        .lineSymbolizer({ ...highwayDflt, strokeWidth: 1, strokeDasharray: '4,2' })
      .rule({ filter: "[type] = 'cycleway'", minZoom: 12 })
        .lineSymbolizer({ ...highwayDflt, strokeWidth: 1, strokeDasharray: '6,3' })
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
      .rule({ minZoom: 14, filter: types(['church', 'chapel', 'catedhral', 'temple', 'basilica']) })
        .markersSymbolizer({ file: 'images/church.svg' })
    .style('protected_areas')
      .rule({ minZoom: 11 })
        .linePatternSymbolizer({ file: 'images/protected_area.svg' })
    .style('borders')
      .rule()
      .lineSymbolizer({ stroke: '#a000ff', strokeWidth: 6, strokeOpacity: 0.5 })
    .style('feature_lines')
      .rule({ filter: "[type] = 'cliff'", minZoom: 13 })
        .linePatternSymbolizer({ file: 'images/cliff.svg' })
        .lineSymbolizer({ stroke: '#404040', strokeWidth: 1 })
      .rule({ filter: "[type] = 'line'", minZoom: 13 })
        .lineSymbolizer({ stroke: 'black', strokeWidth: 1, strokeOpacity: 0.5 })
      .rule({ filter: "[type] = 'minor_line'", minZoom: 14 })
        .lineSymbolizer({ stroke: '#808080', strokeWidth: 1, strokeOpacity: 0.5 })
    .style('hillshade')
      .rule()
        .rasterSymbolizer({ opacity: 0.5, compOp: 'multiply', scaling: 'bilinear' })
    .style('infopoints')
      .rule({ filter: "[type] = 'guidepost'", minZoom: 12 }) // TODO show some dot on 11, 10
        .markersSymbolizer({ file: 'images/guidepost.svg' })
      .rule({ filter: "[type] = 'guidepost'", minZoom: 13 })
        .textSymbolizer({ ...fontDfltWrap, dy: -10 }, "[name] + '\n' + [ele]")
    .style('feature_points')
      .rule({ filter: "[type] = 'peak'", minZoom: 11 })
        .markersSymbolizer({ file: 'images/peak.svg', width: 6, height: 6, fill: '#000000' })
      .rule({ filter: "[type] = 'peak'", minZoom: 12 })
        .textSymbolizer({ ...fontDfltWrap, dy: -8 }, "[name] + '\n' + [ele]")
      .rule({ filter: "[type] = 'attraction'", minZoom: 13 })
        .markersSymbolizer({ file: 'images/attraction.svg' })
        .textSymbolizer({ ...fontDfltWrap, dy: -8 }, '[name]')
      .rule({ filter: "[type] = 'spring'", minZoom: 13 })
        .markersSymbolizer({ file: 'images/spring.svg' })
        .textSymbolizer({ ...fontDfltWrap, dy: -10, fill: 'blue' }, '[name]')
      .rule({ filter: "[type] = 'spring'", minZoom: 14 })
        .textSymbolizer({ ...fontDfltWrap, dy: -10 }, "[name] + '\n' + [ele]")
      .rule({ filter: "[type] = 'cave_entrance'", minZoom: 13 })
        .markersSymbolizer({ file: 'images/cave.svg' })
      .rule({ filter: types(['cave_entrance']), minZoom: 14 })
        .textSymbolizer({ ...fontDfltWrap, dy: -10 }, "[name] + '\n' + [ele]")
      .rule({ filter: "[type] = 'viewpoint'", minZoom: 13 })
        .markersSymbolizer({ file: 'images/view_point.svg' })
      .rule({ filter: types(['viewpoint']), minZoom: 14 })
        .textSymbolizer({ ...fontDfltWrap, dy: -10 }, "[name] + '\n' + [ele]")
      .rule({ filter: types(['mine', 'adit', 'mineshaft']), minZoom: 13 })
        .markersSymbolizer({ file: 'images/mine.svg' })
      .rule({ filter: types(['mine', 'adit', 'mineshaft']), minZoom: 14 })
        .textSymbolizer({ ...fontDfltWrap, dy: -10 }, "[name] + '\n' + [ele]")
      .rule({ filter: "[type] = 'hunting_stand'", minZoom: 15 })
        .markersSymbolizer({ file: 'images/hunting_stand.svg' })
      .rule({ filter: "[type] = 'tower'", minZoom: 13 })
        .markersSymbolizer({ file: 'images/power_tower.svg' })
      .rule({ filter: "[type] = 'pole'", minZoom: 14 })
        .markersSymbolizer({ file: 'images/power_pole.svg' })
      .rule({ filter: types(['hut', 'alpine_hut', 'chalet', 'guest_house', 'hostel', 'hotel', 'motel', 'cabin']), minZoom: 14 })
        .markersSymbolizer({ file: 'images/hut.svg' })
        .textSymbolizer({ ...fontDfltWrap, dy: -10 }, "[name] + '\n' + [ele]")
      .rule({ filter: types(['cross', 'wayside_cross', 'wayside_shrine']), minZoom: 16 })
        .markersSymbolizer({ file: 'images/cross.svg' })
        .textSymbolizer({ ...fontDfltWrap, dy: -10 }, '[name]')
      .rule({ filter: types(['shelter']), minZoom: 15 })
        .markersSymbolizer({ file: 'images/shelter.svg' })
        .textSymbolizer({ ...fontDfltWrap, dy: -10 }, '[name]')
      .rule({ filter: types(['stone', 'rock']), minZoom: 15 })
        .markersSymbolizer({ file: 'images/rock.svg' })
        .textSymbolizer({ ...fontDfltWrap, dy: -10 }, '[name]')
      .rule({ filter: types(['monument']), minZoom: 13 })
        .markersSymbolizer({ file: 'images/monument.svg' })
        .textSymbolizer({ ...fontDfltWrap, dy: -10 }, '[name]')
      .rule({ filter: types(['memorial']), minZoom: 15 })
        .markersSymbolizer({ file: 'images/memorial.svg' })
        .textSymbolizer({ ...fontDfltWrap, dy: -10 }, '[name]')
      .rule({ filter: types(['pub']), minZoom: 16 })
        .markersSymbolizer({ file: 'images/pub.svg' })
      .rule({ filter: types(['picnic_site', 'picnic_table']), minZoom: 16 })
        .markersSymbolizer({ file: 'images/picnic.svg' })
      .rule({ filter: types(['pub']), minZoom: 17 })
        .textSymbolizer({ ...fontDfltWrap, dy: -10 }, '[name]')
      .rule({ minZoom: 16 }) // rest texts
        .textSymbolizer({ ...fontDfltWrap }, "[name] + '\n' + [ele]")

    // texts

    .style('protected_area_names')
      .rule({ minZoom: 12 })
        .textSymbolizer({ ...fontDflt, fill: '#008000', placement: 'interior' }, '[name]')
    .style('water_area_names')
      .rule({ filter: "not([type] = 'riverbank')", minZoom: 12 })
        .textSymbolizer({ ...fontDfltWrap, fill: 'blue', placement: 'interior' }, '[name]')
    .style('building_names', { filterMode: 'first' })
      .rule({ minZoom: 14, filter: types(['church', 'chapel', 'catedhral', 'temple', 'basilica']) })
        .textSymbolizer({ ...fontDfltWrap, placement: 'interior', dy: -10 }, '[name]')
      .rule({ minZoom: 15 })
        .textSymbolizer({ ...fontDfltWrap, placement: 'interior' }, '[name]')
    .style('highway_names')
      .rule({ minZoom: 15 })
        .textSymbolizer({ ...fontDflt, fill: '#3d1d1d', placement: 'line', spacing: 200 }, '[name]')
    .style('feature_line_names')
      .rule({ filter: '[type] = valley', minZoom: 13 })
        .textSymbolizer({ ...fontDflt, size: 16, opacity: 0.5, haloOpacity: 0.5, placement: 'line', spacing: 400 }, '[name]') // TODO size by zoom as for placenames
    .style('water_line_names')
      .rule({ minZoom: 12, filter: "[type] = 'river'" })
        .textSymbolizer({ ...fontDflt, fill: 'blue', placement: 'line', spacing: 400 }, '[name]')
      .rule({ minZoom: 14, filter: "[type] <> 'river'" })
        .textSymbolizer({ ...fontDflt, fill: 'blue', placement: 'line', spacing: 400 }, '[name]')

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
    .doInMap((map) => {
      const s = map.style('routes');
      if (hikingTrails) {
        s.doInStyle(routes('hiking'));
      }
      if (bicycleTrails) {
        s.doInStyle(routes('bicycle'));
      }
    })
    .style('contours', { opacity: 0.33 })
      .rule({ minZoom: 13, filter: '([height] % 100 = 0) and ([height] != 0)' })
        .lineSymbolizer({ stroke: colors.contour, strokeWidth: 0.3, smooth: smoothness })
        .textSymbolizer({ ...fontDflt, fill: colors.contour, placement: 'line', spacing: 200 }, '[height]')
      .rule({ minZoom: 14, filter: '([height] % 10 = 0) and ([height] != 0)' })
        .lineSymbolizer({ stroke: colors.contour, strokeWidth: 0.2, smooth: smoothness })
      .rule({ maxZoom: 13, minZoom: 13, filter: '([height] % 20 = 0) and ([height] != 0)' })
        .lineSymbolizer({ stroke: colors.contour, strokeWidth: 0.2, smooth: smoothness })
      .rule({ maxZoom: 12, minZoom: 12, filter: '([height] % 50 = 0) and ([height] != 0)' })
        .lineSymbolizer({ stroke: colors.contour, strokeWidth: 0.2, smooth: smoothness })
      .rule({ minZoom: 15, filter: '([height] % 50 = 0) and ([height] % 100 != 0)' })
        .textSymbolizer({ ...fontDflt, fill: colors.contour, placement: 'line', spacing: 200 }, '[height]')

    .doInMap(layers(shading, contours))

    .stringify();
}

function types(type) {
  return type.map((x) => `[type] = '${x}'`).join(' or ');
}

const mapnikConfig = generateFreemapStyle();

if (config.get('dumpXml')) {
  console.log('Mapnik config:', mapnikConfig);
}

module.exports = {
  mapnikConfig,
  generateFreemapStyle,
};
