/* eslint-disable indent */

const config = require('config');
const { createMap } = require('jsnik');
const { mercSrs } = require('freemap-mapserver/lib/projections'); // TODO ugly

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
  waterLabelHalo: 'hsl(220, 30%, 100%)',
  building: 'hsl(0, 0%, 50%)',
  track: '#804040',
  forest: 'hsl(120, 45%, 75%)',
  heath: 'hsl(85, 60%, 80%)',
  farmyard: 'hsl(50, 44%, 80%)',
  farmland: 'hsl(60, 70%, 95%)',
  wetland: 'hsl(200, 80%, 90%)',
  scrub: 'hsl(140, 40%, 70%)',
  grassy: 'hsl(100, 85%, 85%)',
  orchard: 'hsl(95, 20%, 100%)',
  allotments: 'hsl(50, 45%, 85%)',
  landfill: 'hsl(0, 30%, 60%)',
};

const glowDflt = { stroke: '#ffffff', strokeOpacity: 0.5 };
const highwayDflt = { stroke: colors.track };
const fontDflt = { faceName: 'PT Sans Regular', haloFill: 'white', haloRadius: 1 };
const fontDfltWrap = { ...fontDflt, wrapWidth: 100, wrapBefore: true };
const natureRelatedFontWrap = { ...fontDfltWrap, fill: '#000000',
  haloRadius: 1.5, haloOpacity: 0.7, faceName: 'PT Sans Italic' };

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
    poiIcons(style, pois) {
      for (const [minIcoZoom, , type] of pois) {
        const types = Array.isArray(type) ? type : [type];
        for (let z = minIcoZoom; z < 20; z++) {
          style.typesRule(z, z, ...types)
            .markersSymbolizer({ file: `images/${types[0]}.svg` });
        }
      }
      return style; // TODO remove
    },
    poiNames(style, pois) {
      const poiFontWrap = { ...fontDfltWrap, faceName: 'PT Sans Narrow Bold', spacing: 0.8 };
      for (const [, minTextZoom, type, withEle] of pois) {
        const types = Array.isArray(type) ? type : [type];
        style
          .typesRule(minTextZoom, ...types)
            .textSymbolizer({ ...poiFontWrap, dy: -10 }, withEle ? nameWithEle : '[name]');
      }
      return style; // TODO remove
    },
    area(style, color, ...types) {
      return style.typesRule(...types)
        .borderedPolygonSymbolizer(color);
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

const pois = [
  [13, 14, 'spring', true],
  [13, 14, 'cave_entrance', true],
  [13, 14, 'monument', true],
  [13, 14, 'viewpoint', true],
  [13, 14, ['mine', 'adit', 'mineshaft'], true],
  [14, 14, 'hotel', true],
  [14, 14, 'chalet', true],
  [14, 14, 'hostel', true],
  [14, 14, 'motel', true],
  [14, 14, 'guest_house', true],
  [14, 14, 'alpine_hut', true],
  [14, 15, 'hospital'],
  [14, 15, 'townhall'],
  [14, 15, ['hut', 'cabin'], true], // fallback
  [14, 15, ['church', 'chapel', 'cathedral', 'temple', 'basilica']],
  [15, 15, 'hunting_stand'],
  [15, 16, 'museum'],
  [15, 16, 'shelter', true],
  [15, 16, ['rock', 'stone']],
  [15, 16, 'pharmacy'],
  [15, 16, 'cinema'],
  [15, 16, 'theatre'],
  [15, 16, 'memorial'],
  [15, 16, 'artwork'],
  [15, 16, 'pub'],
  [15, 16, 'cafe'],
  [15, 16, 'restaurant'],
  [15, 16, 'convenience'],
  [15, 16, 'supermarket'],
  [15, 16, 'fast_food'],
  [15, 16, 'confectionery'],
  [16, 17, 'wayside_shrine'],
  [16, 17, 'fountain'],
  [16, 17, ['cross', 'wayside_cross']],
];

const infoPois = [
  [12, 13, 'guidepost', true], // TODO show some dot on 11, 10
  [15, 16, 'office'],
  [16, 16, 'board'],
  [16, 16, 'map'],
];

const nameWithEle = "[name] + '\n' + [ele]";
const nameWithSmallerEle = (eleSize) => '[name] + "\n"<<Format size="'+(eleSize)+'">>[ele]<</Format>>';

function generateFreemapStyle(shading = shadingCfg, contours = contoursCfg, hikingTrails = hikingTrailsCfg, bicycleTrails = bicycleTrailsCfg) {
  return createMap({
    backgroundColor: 'white',
    srs: mercSrs,
    bufferSize: 256,
  }, extensions)
    .datasource({ name: 'db' }, dbParams)
    .style('landcover')
      .area(colors.forest, 'forest', 'wood')
      .area(colors.farmland, 'farmland')
      .area(colors.grassy, 'meadow', 'grassland', 'grass', 'park', 'cemetery')
      .typesRule('cemetery')
        .polygonPatternSymbolizer({ file: 'images/grave.svg' })
      .area(colors.heath, 'heath')
      .area(colors.scrub, 'scrub')
      .typesRule('quarry')
        .borderedPolygonSymbolizer('#9E9E9E')
        .polygonPatternSymbolizer({ file: 'images/quarry.svg' })
      .area(colors.landfill, 'landfill')
      .area('#e0e0e0', 'residential', 'living_street')
      .area(colors.farmyard, 'farmyard')
      .area(colors.allotments, 'allotments')
      .area('#d0d0d0', 'industrial')
      // .area('hsl(320, 32%, 90%)', 'commercial')
      .area('#e69ccd', 'commercial')
      .area(colors.orchard, 'orchard')
      .area(colors.wetland, 'wetland')
      .typesRule('pitch', 'playground')
        .borderedPolygonSymbolizer('hsl(140, 50%, 70%)')
        .lineSymbolizer({ stroke: 'hsl(140, 50%, 40%)', strokeWidth: 1 })
      .typesRule('parking')
        .borderedPolygonSymbolizer('hsl(0, 25%, 80%)')
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
      .poiIcons(infoPois)
    .style('feature_points')
    .typesRule(11, 'peak')
      .markersSymbolizer({ file: 'images/peak.svg',
        width: 6, height: 6, fill: '#000000' })
    .typesRule(13, 'tower')
      .markersSymbolizer({ file: 'images/power_tower.svg' })
    .typesRule(14, 'pole')
      .markersSymbolizer({ file: 'images/power_pole.svg' })
    .typesRule(15, 'attraction')
      .markersSymbolizer({ file: 'images/attraction.svg' })
    .typesRule(16, 'picnic_site', 'picnic_table')
      .markersSymbolizer({ file: 'images/picnic.svg' })
    .poiIcons(pois)
      // .rule({ minZoom: 16 }) // rest texts
      //   .textSymbolizer({ ...fontDfltWrap }, nameWithEle)

    // texts
    .style('locality_names').doInStyle((style) => {
      const sizes = { 15: 11, 16: 12, 17: 12, 18: 12, 19: 12 };
      for (let z = 15; z < 20; z++) {
        style.typesRule(z, z, 'locality')
          .textSymbolizer({ ...fontDflt, fill: 'hsl(0, 0%, 40%)',
            opacity: 0.95, haloOpacity: 0, haloRadius: 0,
            size: sizes[z] }, '[name]');
      }
    })
    .style('infopoint_names').doInStyle((style) => {
      const fontSizes = { 12: 12, 13: 12, 14: 13, 15: 14, 16: 15 };
      for (let z = 13; z < 20; z++) {
        const size = fontSizes[z] || fontSizes[16];
        style.typesRule(z, z, 'guidepost')
          .textSymbolizer({ ...natureRelatedFontWrap, haloFill: '#dddddd', size, dy: -10 },
            nameWithSmallerEle(size - 2));
      }
    })
    .style('feature_point_names').doInStyle((style) => {
      const fontSizes = { 12: 12, 13: 12, 14: 13, 15: 14, 16: 15 };
      for (let z = 12; z < 20; z++) {
        const size = fontSizes[z] || fontSizes[16];
        style.typesRule(z, z, 'peak')
          .textSymbolizer({ ...natureRelatedFontWrap, haloFill: '#c3ffbe', size, dy: -8 },
            nameWithSmallerEle(size - 2));
      }
      for (let z = 14; z < 20; z++) {
        const size = (fontSizes[z] || fontSizes[16]) - 2;
        style.typesRule(z, z, 'spring')
          .textSymbolizer({ ...natureRelatedFontWrap, haloFill: colors.waterLabelHalo, size, dy: -10 }, '[name]');
      }

      style.typesRule(15, 'attraction')
        .textSymbolizer({ ...fontDfltWrap, dy: -8 }, '[name]');

      style.poiNames(pois);
    })
    .style('protected_area_names')
      .rule({ minZoom: 12 })
        .textSymbolizer({ ...natureRelatedFontWrap, fill: '#042c01', haloFill: '#ffffff', haloRadius: 0.8, haloOpacity: 0.7, placement: 'interior' }, '[name]')
    .style('water_area_names')
      .rule({ filter: "not([type] = 'riverbank')", minZoom: 12 })
        .textSymbolizer({ ...natureRelatedFontWrap, haloFill: colors.waterLabelHalo, placement: 'interior' }, '[name]')
    .style('building_names')
      // .rule({ minZoom: 15 }) // rest names
      //   .textSymbolizer({ ...fontDfltWrap, placement: 'interior' }, '[name]')
    .style('highway_names')
      .rule({ minZoom: 15 })
        .textSymbolizer({ ...fontDflt, fill: '#3d1d1d', placement: 'line', spacing: 200 }, '[name]')
    .style('feature_line_names')
      .doInStyle((style) => {
        const opacities = { 14: 0.4, 15: 0.4, 16: 0.35, 17: 0.35, 18: 0.35, 19: 0.35 };
        const sizes = { 14: 11, 15: 12, 16: 13, 17: 15, 18: 16, 19: 16 };
        const spacing = { 14: 3, 15: 4, 16: 5, 17: 5, 18: 5, 19: 5 };

        const vallyeText = { ...fontDflt, placement: 'line', repeatDistance: 400,
          fill: '#000000', haloOpacity: 0, haloRadius: 0 };
        for (let z = 14; z < 20; z++) {
          style.typesRule(z, z, 'valley')
            .textSymbolizer({ ...vallyeText, size: sizes[z], opacity: opacities[z],
              characterSpacing: spacing[z] }, '[name]');
        }
      })
    .style('water_line_names')
      .typesRule(12, 'river')
        .textSymbolizer({ ...natureRelatedFontWrap, haloFill: colors.waterLabelHalo, placement: 'line', spacing: 400 }, '[name]')
      .rule({ minZoom: 14, filter: "[type] <> 'river'" })
        .textSymbolizer({ ...natureRelatedFontWrap, haloFill: colors.waterLabelHalo, placement: 'line', spacing: 400 }, '[name]')

    .style('placenames')
      .doInStyle((style) => {
        const opacities = { 6: 0.9, 7: 0.9, 8: 0.9, 9: 0.9, 10: 0.9,
          11: 0.9, 12: 0.9, 13: 0.9, 14: 0.85, 15: 0.7, 16: 0.5 };
        for (let z = 6; z < 20; z++) {
          const opacity = opacities[z] || 0.0;
          const sc = Math.pow(1.3, z);
          const placenamesFontStyle = { ...fontDflt, fill: '#000000', haloFill: '#ffffff',
            opacity, haloOpacity: opacity * 0.9, faceName: 'PT Sans Narrow Bold', characterSpacing: 1 };

          style
            .typesRule(z, z, 'city', 'town')
              .textSymbolizer({ ...placenamesFontStyle, haloRadius: 2, textTransform: 'uppercase', size: 0.8 * sc }, '[name]');

          if (z > 9) {
            style
              .typesRule(z, z, 'village')
                .textSymbolizer({ ...placenamesFontStyle, haloRadius: 1.5, textTransform: 'uppercase', size: 0.55 * sc}, '[name]');
          }

          if (z > 11) {
            style
              .typesRule(z, z, 'suburb', 'hamlet')
                .textSymbolizer({ ...placenamesFontStyle, haloRadius: 1.5, size: 0.5 * sc }, '[name]');
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

const mapnikConfig = generateFreemapStyle()
  .replace(/&lt;&lt;/g, '<')
  .replace(/&gt;&gt;/g, '>');

if (config.get('dumpXml')) {
  console.log('Mapnik config:', mapnikConfig);
}

module.exports = {
  mapnikConfig,
  generateFreemapStyle,
};
