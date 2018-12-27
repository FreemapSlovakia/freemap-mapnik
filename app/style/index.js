/* eslint-disable indent */

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

const glowDflt = { stroke: '#ffffff', strokeOpacity: 0.5 };
const highwayDflt = { stroke: colors.track };
const fontDflt = { faceName: 'DejaVu Sans Book', haloFill: 'white', haloRadius: 1 };
const fontDfltWrap = { ...fontDflt, wrapWidth: 100, wrapBefore: true };

const extensions = {
  style: {
    typesRule(style, ...t) {
      const q = [...t];
      let minZoom, maxZoom;
      if (typeof q[0] === 'number') {
        minZoom = q.shift();
      }
      if (typeof q[0] === 'number') {
        maxZoom = q.shift();
      }
      return style.rule({ filter: types(...q), minZoom, maxZoom });
    },
    poi(style, type, minIcoZoom, minTextZoom, withEle) {
      const types = Array.isArray(type) ? type : [type];
      if (minIcoZoom === minTextZoom) {
        return style
          .typesRule(minIcoZoom, ...types)
            .markersSymbolizer({ file: `images/${types[0]}.svg` })
            .textSymbolizer({ ...fontDfltWrap, dy: -10 }, withEle ? nameWithEle : '[name]');
      }
      return style
        .typesRule(minIcoZoom, ...types)
          .markersSymbolizer({ file: `images/${types[0]}.svg` })
        .typesRule(minTextZoom, ...types)
          .textSymbolizer({ ...fontDfltWrap, dy: -10 }, withEle ? nameWithEle : '[name]');
    }
  },
  rule: {
    borderedPolygonSymbolizer(rule, color) {
      return rule
        .polygonSymbolizer({ fill: color })
        .lineSymbolizer({ stroke: color, strokeWidth: 1 });
    },
  }
};

const nameWithEle = "[name] + '\n' + [ele]";

function generateFreemapStyle(shading = shadingCfg, contours = contoursCfg, hikingTrails = hikingTrailsCfg, bicycleTrails = bicycleTrailsCfg) {
  return createMap({
    backgroundColor: 'white',
    srs: mercSrs,
    bufferSize: 256,
  }, extensions)
    .datasource({ name: 'db' }, dbParams)
    .style('landcover')
      .typesRule('forest', 'wood')
        .borderedPolygonSymbolizer('hsl(120, 45%, 75%)')
      .typesRule('farmland')
        .borderedPolygonSymbolizer('hsl(60, 70%, 95%)')
      .typesRule('meadow', 'grassland', 'grass', 'park', 'cemetery')
        .borderedPolygonSymbolizer('hsl(100, 85%, 85%)')
      .typesRule('cemetery')
        .polygonPatternSymbolizer({ file: 'images/grave.svg' })
      .typesRule('heath')
        .borderedPolygonSymbolizer('hsl(85, 60%, 80%)')
      .typesRule('scrub')
        .borderedPolygonSymbolizer('hsl(140, 40%, 70%)')
      .typesRule('quarry')
        .borderedPolygonSymbolizer('#9E9E9E')
        .polygonPatternSymbolizer({ file: 'images/quarry.svg' })
      .typesRule('landfill')
        .borderedPolygonSymbolizer('#A06D6D')
      .typesRule('residential', 'living_street')
        .borderedPolygonSymbolizer('#e0e0e0')
      .typesRule('farmyard')
        .borderedPolygonSymbolizer('hsl(50, 44%, 80%)')
      .typesRule('allotments')
        .borderedPolygonSymbolizer('hsl(50, 45%, 85%)')
      .typesRule('industrial')
        .borderedPolygonSymbolizer('#d0d0d0')
      .typesRule('commercial')
        .borderedPolygonSymbolizer('#e79dcc')
      .typesRule('orchard')
        .borderedPolygonSymbolizer('#e0ffcc')
      .typesRule('wetland')
        .borderedPolygonSymbolizer('hsl(200, 80%, 90%)')
      .typesRule('pitch', 'playground')
        .borderedPolygonSymbolizer('hsl(140, 50%, 70%)')
        .lineSymbolizer({ stroke: 'hsl(140, 50%, 40%)', strokeWidth: 1 })
      .typesRule('parking')
        .borderedPolygonSymbolizer('#cc9999')
        .lineSymbolizer({ stroke: colors.track, strokeWidth: 1 })
    .style('water_area')
      .rule()
        .borderedPolygonSymbolizer(colors.water)
    .style('water_line')
      .typesRule('river')
        .lineSymbolizer({ stroke: colors.water, strokeWidth: 2.2 })
      .rule({ filter: "[type] <> 'river'", minZoom: 11 })
        .lineSymbolizer({ stroke: colors.water, strokeWidth: 1.2 })
    .style('barrierways')
      .rule({ minZoom: 16 })
        .lineSymbolizer({ stroke: '#ff0000', strokeWidth: 1, strokeDasharray: '2,1' })
    .style('highways')
      .rule({ filter: "[class] = 'railway'" })
        .linePatternSymbolizer({ file: 'images/rail.svg' })
      .typesRule('motorway', 'trunk', 'motorway_link', 'trunk_link')
        .lineSymbolizer({ ...highwayDflt, strokeWidth: 3 })
      .typesRule('primary', 'secondary', 'tertiary', 'primary_link', 'secondary_link', 'tertiary_link')
        .lineSymbolizer({ ...highwayDflt, strokeWidth: 2 })
      .typesRule(12, 'living_street', 'residential', 'service', 'unclassified', 'road')
        .lineSymbolizer({ ...highwayDflt, strokeWidth: 1.5 })
      .typesRule(12, 'path')
        .lineSymbolizer({ ...highwayDflt, strokeWidth: 1, strokeDasharray: '3,3' })
      .typesRule(12, 'footway', 'pedestrian', 'steps')
        .lineSymbolizer({ ...highwayDflt, strokeWidth: 1, strokeDasharray: '4,2' })
      .typesRule(12, 'cycleway')
        .lineSymbolizer({ ...highwayDflt, strokeWidth: 1, strokeDasharray: '6,3' })
      .doInStyle((style) => {
        [undefined, '8,2', '6,4', '4,6', '2,8', '3,7,7,3'].forEach((strokeDasharray, i) => {
          style
            .rule({ filter: `[type] = 'track' and [tracktype] = ${i === 5 ? "''" : `'grade${i + 1}'`}`, minZoom: 12 })
              .lineSymbolizer({ ...highwayDflt, strokeWidth: 1.2, strokeDasharray });
        });
      })
    .style('higwayGlows')
      .typesRule(12, 'path', 'footway', 'pedestrian', 'steps')
        .lineSymbolizer({ ...glowDflt, strokeWidth: 1 })
      .typesRule(12, 'track')
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
      .typesRule(13, 'cliff')
        .linePatternSymbolizer({ file: 'images/cliff.svg' })
        .lineSymbolizer({ stroke: '#404040', strokeWidth: 1 })
      .typesRule(13, 'line')
        .lineSymbolizer({ stroke: 'black', strokeWidth: 1, strokeOpacity: 0.5 })
      .typesRule(14, 'minor_line')
        .lineSymbolizer({ stroke: '#808080', strokeWidth: 1, strokeOpacity: 0.5 })
    .style('hillshade')
      .rule()
        .rasterSymbolizer({ opacity: 0.5, compOp: 'multiply', scaling: 'bilinear' })
    .style('infopoints')
      // TODO show some dot on 11, 10
      .poi('guidepost', 12, 13, true)
      .poi('board', 16, 16)
      .poi('map', 16, 16)
      .poi('office', 15, 16)
    .style('feature_points')
      .typesRule(11, 'peak')
        .markersSymbolizer({ file: 'images/peak.svg', width: 6, height: 6, fill: '#000000' })
      .typesRule(12, 'peak')
        .textSymbolizer({ ...fontDfltWrap, dy: -8 }, nameWithEle)
      .typesRule(13, 'tower')
        .markersSymbolizer({ file: 'images/power_tower.svg' })
      .poi('spring', 13, 14, true) // TODO fill: blue
      .poi('cave_entrance', 13, 14, true)
      .poi('monument', 13, 14, true)
      .poi('viewpoint', 13, 14, true)
      .poi(['mine', 'adit', 'mineshaft'], 13, 14, true)
      .typesRule(14, 'pole')
        .markersSymbolizer({ file: 'images/power_pole.svg' })
      .poi('hotel', 14, 14, true)
      .poi('chalet', 14, 14, true)
      .poi('hostel', 14, 14, true)
      .poi('motel', 14, 14, true)
      .poi('guest_house', 14, 14, true)
      .poi('alpine_hut', 14, 14, true)
      .poi('hospital', 14, 15)
      .poi('museum', 15, 16)
      .poi(['hut', 'cabin'], 14, 15, true) // fallback
      .poi(['church', 'chapel', 'cathedral', 'temple', 'basilica'], 14, 15)
      .typesRule(15, 'attraction')
        .markersSymbolizer({ file: 'images/attraction.svg' })
        .textSymbolizer({ ...fontDfltWrap, dy: -8 }, '[name]')
      .poi('hunting_stand', 15, 15)
      .poi('shelter', 15, 16, true)
      .poi(['rock', 'stone'], 15, 16)
      .poi('pharmacy', 15, 16)
      .poi('cinema', 15, 16)
      .poi('theatre', 15, 16)
      .poi('memorial', 15, 16)
      .poi('artwork', 15, 16)
      .poi('pub', 15, 16)
      .poi('cafe', 15, 16)
      .poi('restaurant', 15, 16)
      .poi('convenience', 15, 16) // TODO not rendered yet - this is in shops layer
      .poi('wayside_shrine', 16, 17)
      .poi(['cross', 'wayside_cross'], 16, 17)

      .typesRule(16, 'picnic_site', 'picnic_table')
        .markersSymbolizer({ file: 'images/picnic.svg' })
      // .rule({ minZoom: 16 }) // rest texts
      //   .textSymbolizer({ ...fontDfltWrap }, nameWithEle)

    // texts

    .style('protected_area_names')
      .rule({ minZoom: 12 })
        .textSymbolizer({ ...fontDflt, fill: '#008000', placement: 'interior' }, '[name]')
    .style('water_area_names')
      .rule({ filter: "not([type] = 'riverbank')", minZoom: 12 })
        .textSymbolizer({ ...fontDfltWrap, fill: 'blue', placement: 'interior' }, '[name]')
    .style('building_names')
      // .rule({ minZoom: 15 }) // rest names
      //   .textSymbolizer({ ...fontDfltWrap, placement: 'interior' }, '[name]')
    .style('highway_names')
      .rule({ minZoom: 15 })
        .textSymbolizer({ ...fontDflt, fill: '#3d1d1d', placement: 'line', spacing: 200 }, '[name]')
    .style('feature_line_names')
      .typesRule(13, 'valley')
        .textSymbolizer({ ...fontDflt, size: 16, opacity: 0.5, haloOpacity: 0.5, placement: 'line', spacing: 400 }, '[name]') // TODO size by zoom as for placenames
    .style('water_line_names')
      .typesRule(12, 'river')
        .textSymbolizer({ ...fontDflt, fill: 'blue', placement: 'line', spacing: 400 }, '[name]')
      .rule({ minZoom: 14, filter: "[type] <> 'river'" })
        .textSymbolizer({ ...fontDflt, fill: 'blue', placement: 'line', spacing: 400 }, '[name]')

    .style('placenames')
      .doInStyle((style) => {
        for (let z = 6; z < 20; z++) {
          const opacity = 1 - ((z - 6) / (20 - 6));
          const sc = Math.pow(1.3, z);

          style
            .typesRule(z, z, 'city', 'town')
              .textSymbolizer({ ...fontDflt, size: 1.5 * sc, opacity, haloOpacity: opacity }, '[name]');

          if (z > 9) {
            style
              .typesRule(z, z, 'village', 'suburb')
                .textSymbolizer({ ...fontDflt, size: 0.75 * sc, opacity, haloOpacity: opacity }, '[name]');
          }

          if (z > 10) {
            style
              .typesRule(z, z, 'hamlet')
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
        .lineSymbolizer({ stroke: colors.contour, strokeWidth: 0.3 })
        .textSymbolizer({ ...fontDflt, fill: colors.contour, placement: 'line', spacing: 200 }, '[height]')
      .rule({ minZoom: 14, filter: '([height] % 10 = 0) and ([height] != 0)' })
        .lineSymbolizer({ stroke: colors.contour, strokeWidth: 0.2 })
      .rule({ maxZoom: 13, minZoom: 13, filter: '([height] % 20 = 0) and ([height] != 0)' })
        .lineSymbolizer({ stroke: colors.contour, strokeWidth: 0.2 })
      .rule({ maxZoom: 12, minZoom: 12, filter: '([height] % 50 = 0) and ([height] != 0)' })
        .lineSymbolizer({ stroke: colors.contour, strokeWidth: 0.2 })
      .rule({ minZoom: 15, filter: '([height] % 50 = 0) and ([height] % 100 != 0)' })
        .textSymbolizer({ ...fontDflt, fill: colors.contour, placement: 'line', spacing: 200 }, '[height]')

    .doInMap(layers(shading, contours))

    .stringify();
}

function types(...type) {
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
