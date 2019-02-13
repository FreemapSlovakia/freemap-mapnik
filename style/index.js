/* eslint-disable indent */

const config = require('config');
const convert = require('color-convert');
const { createMap } = require('jsnik');
const { mercSrs } = require('freemap-mapserver/lib/projections'); // TODO ugly

const dbParams = config.get('db');
const contoursCfg = config.get('mapFeatures.contours');
const shadingCfg = config.get('mapFeatures.shading');
const hikingTrailsCfg = config.get('mapFeatures.hikingTrails');
const bicycleTrailsCfg = config.get('mapFeatures.bicycleTrails');
const skiTrailsCfg = config.get('mapFeatures.skiTrails');
const dumpXml = config.get('dumpXml');

const { layers } = require('./layers');
const { routes } = require('./routes');

function hsl(h, s, l) {
  return `#${convert.hsl.hex(h, s, l)}`;
}

const colors = {
  contour: 'black',
  water: hsl(210, 65, 65),
  waterLabelHalo: hsl(210, 30, 100),
  building: hsl(0, 0, 50),
  ruin: hsl(0, 0, 60),
  track: hsl(0, 33, 25),
  forest: hsl(120, 45, 78),
  heath: hsl(85, 60, 80),
  farmyard: hsl(50, 44, 80),
  farmland: hsl(60, 70, 95),
  wetland: hsl(200, 80, 90),
  scrub: hsl(100, 40, 65),
  grassy: hsl(100, 85, 90),
  orchard: hsl(95, 20, 100),
  allotments: hsl(50, 45, 85),
  landfill: hsl(0, 30, 60),
};

const glowDflt = { stroke: hsl(0, 33, 70)};
const highwayDflt = { stroke: colors.track };

// fonts
const dfltFont = { faceName: 'PT Sans Regular', fill: 'black', haloFill: 'white', haloRadius: 1.5, haloOpacity: 0.75, size: 12, lineSpacing: -2 };
const wrapFont = { ...dfltFont, wrapWidth: 100, wrapBefore: true };
const natureRelatedFont = { ...wrapFont, faceName: 'PT Sans Italic', fill: 'black' };
const waterFont = { ...natureRelatedFont, fill: hsl(216, 100, 50), haloFill: colors.waterLabelHalo };
const valleyFont = { ...dfltFont, faceName: 'PT Sans Italic', placement: 'line', repeatDistance: 400, fill: 'black', haloRadius: 0 };

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
      for (const [minIcoZoom, , , , type, extra = {}] of pois) {
        if (typeof minIcoZoom !== 'number') {
          continue;
        }
        const types = Array.isArray(type) ? type : [type];
        const zoom = [minIcoZoom];
        if (extra.maxZoom) {
          zoom.push(extra.maxZoom);
        }
        style.typesRule(...zoom, ...types)
          .markersSymbolizer({ file: `images/${extra.icon || types[0]}.svg` });
      }
      return style; // TODO remove
    },
    poiNames(style, pois) {
      for (const [, minTextZoom, withEle, natural, type, extra = {}] of pois) {
        if (typeof minTextZoom !== 'number') {
          continue;
        }
        const types = Array.isArray(type) ? type : [type];
        const font = { ...(natural ? natureRelatedFont : wrapFont), dy: -10, ...(extra.font || {}) };
        const { textSymbolizerEle } = style
          .typesRule(minTextZoom, ...types)
            .textSymbolizer(font,
              withEle ? undefined : '[name]');
        if (withEle) {
          textSymbolizerEle.text('[name] + "\n"');
          textSymbolizerEle.ele('Format', { size: font.size * 0.8 }, '[ele]');
        }
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

// minIconZoom, minTextZoom, withEle, natural, types/icon, textOverrides
const pois = [
  [11, 20, true, false, 'guidepost', { icon: 'guidepost_x', maxZoom: 11 }],
  [12, 12, true, false, 'guidepost', { icon: 'guidepost_x', font: { faceName: 'PT Sans Bold', dy: -8 }, maxZoom: 12 }],
  [13, 13, true, false, 'guidepost', { icon: 'guidepost_xx', font: { faceName: 'PT Sans Bold' } }],
  [12, 20, true, true, 'peak', { icon: 'peak_small', maxZoom: 12 }], // TODO show only prominent peaks and include label
  [13, 13, true, true, 'peak', { font: { size: 13, dy: -8 } }],

  [14, 15, false, false , 'castle'],
  [14, 15, false, false , 'ruins'],
  [14, 15, true, true, 'cave_entrance'],
  [14, 15, true, true, 'spring', { font: { fill: hsl(216, 100, 50) } }],
  [14, 15, true, true, 'waterfall', { font: { fill: hsl(216, 100, 50) } }],
  [14, 15, true, false, 'monument'],
  [14, 15, true, true, 'viewpoint'],
  [14, 15, true, false, ['mine', 'adit', 'mineshaft']],
  [14, 15, true, false, 'hotel'],
  [14, 15, true, false, 'chalet'],
  [14, 15, true, false, 'hostel'],
  [14, 15, true, false, 'motel'],
  [14, 15, true, false, 'guest_house'],
  [14, 15, true, false, 'alpine_hut'],
  [14, 15, true, false, 'camp_site'],
  [14, 15, false, false, 'attraction'],
  [14, 15, false, false, 'hospital'],
  [14, 15, false, false, 'townhall'],
  [14, 15, false, true, ['hut', 'cabin']], //  fallback
  [14, 15, false, false, ['church', 'chapel', 'cathedral', 'temple', 'basilica']],
  [14, 15, true, false, 'tower_observation'],
  [14, 15, true, false, 'archaeological_site'],

  [15, 16, false, false, 'water_tower'],
  [15, 16, false, false, 'chimney'],
  [15, 16, false, false, 'fire_station'],
  [15, 16, false, false, 'community_centre'],
  [15, 16, false, false, 'police'],
  [15, 16, false, false, 'office'], // information=office
  [15, 16, false, false, 'hunting_stand'],
  [15, 16, true, false, 'shelter'],
  [15, 16, false, true, ['rock', 'stone']],
  [15, 16, false, false, 'museum'],
  [15, 16, false, false, 'pharmacy'],
  [15, 16, false, false, 'cinema'],
  [15, 16, false, false, 'theatre'],
  [15, 16, false, false, 'memorial'],
  [15, 16, false, false, 'pub'],
  [15, 16, false, false, 'cafe'],
  [15, 16, false, false, 'restaurant'],
  [15, 16, false, false, 'convenience'],
  [15, 16, false, false, 'supermarket'],
  [15, 16, false, false, 'fast_food'],
  [15, 16, false, false, 'confectionery'],
  [15, 16, false, false, 'fuel'],
  [15, 16, false, false, 'post_office'],
  [15, 16, false, false, 'bunker'],
  [15, 16, false, false, 'boundary_stone'],
  [15, null, false, false, 'mast_other'],
  [15, null, false, false, 'tower_other'],
  [15, null, false, false, ['tower_communication', 'mast_communication']],

  [16, 16, false, false, 'board'],
  [16, 17, false, false, 'map'],
  [16, 17, false, false, 'artwork'],
  [16, 17, false, false, 'fountain', { font: { fill: hsl(216, 100, 50) } }],
  [16, null, false, false, 'feeding_place', { icon: 'manger' }],
  [16, null, false, false, 'game_feedng', { icon: 'manger' }],
  [16, 17, false, false, 'playground'],
  [16, 17, false, false, 'bus_stop'],

  [17, 18, false, false, 'wayside_shrine'],
  [17, 18, false, false, ['cross', 'wayside_cross']],
  [17, null, false, false, 'firepit'],
  [17, null, false, false, 'toilets'],

  [18, 19, false, false, 'post_box'],
  [18, 19, false, false, 'telephone'],
  [18, null, false, false, 'gate'],
  [18, null, false, false, 'lift_gate'],
  [18, null, false, false, 'waste_disposal'],
];

function generateFreemapStyle(
  shading = shadingCfg,
  contours = contoursCfg,
  hikingTrails = hikingTrailsCfg,
  bicycleTrails = bicycleTrailsCfg,
  skiTrails = skiTrailsCfg,
) {
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
        .polygonPatternSymbolizer({ file: 'images/grave.svg', alignment: 'global', opacity: 0.5 })
      .area(colors.heath, 'heath')
      .area(colors.scrub, 'scrub', 'vineyard') // TODO use different color/pattern for vineyard
      .typesRule('quarry')
        .borderedPolygonSymbolizer(hsl(0, 0, 62))
        .polygonPatternSymbolizer({ file: 'images/quarry.svg' })
      .area(colors.landfill, 'landfill')
      .area(hsl(0, 0, 88), 'residential', 'living_street')
      .area(colors.farmyard, 'farmyard')
      .area(colors.allotments, 'allotments')
      .area(hsl(0, 0, 80), 'industrial')
      .area(hsl(320, 40, 85), 'commercial', 'retail')
      .area(colors.orchard, 'orchard')
      .area(colors.wetland, 'wetland')
      .typesRule(12, 'pitch', 'playground')
        .borderedPolygonSymbolizer(hsl(140, 50, 70))
        .lineSymbolizer({ stroke: hsl(140, 50, 40), strokeWidth: 1 })
      .typesRule(13, 'parking')
        .polygonSymbolizer({ fill: hsl(0, 33, 80) })
        .lineSymbolizer({ stroke: hsl(0, 33, 65), strokeWidth: 1 })
    .style('water_area')
      .rule()
        .borderedPolygonSymbolizer(colors.water)
    .style('solar_power_plants')
      .rule({ minZoom: 13, maxZoom: 14, })
        .polygonPatternSymbolizer({ file: 'images/solar_small.svg', alignment: 'global' })
        .lineSymbolizer({ stroke: hsl(176, 153, 200), strokeWidth: 1 })
      .rule({ minZoom: 15 })
        .polygonPatternSymbolizer({ file: 'images/solar.svg', alignment: 'global' })
        .lineSymbolizer({ stroke: hsl(176, 153, 200), strokeWidth: 1 })
    .style('water_line')
      .typesRule('river')
        .lineSymbolizer({ stroke: colors.water, strokeWidth: 2.2 })
      .rule({ filter: "[type] <> 'river'", minZoom: 11 })
        .lineSymbolizer({ stroke: colors.water, strokeWidth: 1.2 })
    .style('barrierways')
      .rule({ minZoom: 16 })
        .lineSymbolizer({ stroke: hsl(0, 100, 50), strokeWidth: 1, strokeDasharray: '2,1' })
    .style('aeroways').doInStyle((style) => {
      const aeroBgLine = { stroke: hsl(240, 50, 35) };
      const aeroFgLine = { stroke: 'white', strokeDasharray: '10,10' };

      style
        .rule({ minZoom: 11, maxZoom: 11 })
          .lineSymbolizer({ ...aeroBgLine, strokeWidth: 2 })
          .lineSymbolizer({ ...aeroFgLine, strokeWidth: 0.7 })
        .rule({ minZoom: 12, maxZoom: 13 })
          .lineSymbolizer({ ...aeroBgLine, strokeWidth: 3 })
          .lineSymbolizer({ ...aeroFgLine, strokeWidth: 1 })
        .rule({ minZoom: 14 })
          .lineSymbolizer({ ...aeroBgLine, strokeWidth: 4 })
          .lineSymbolizer({ ...aeroFgLine, strokeWidth: 1.5 });
    })
    .style('highways')
      .rule({ filter: "[class] = 'railway' and [type] != 'abandoned'" })
        .lineSymbolizer({ stroke: 'white', strokeWidth: 3 })
        .lineSymbolizer({ stroke: 'black', strokeWidth: 1.5 })
        .linePatternSymbolizer({ file: 'images/rail.svg' })
      .typesRule('motorway', 'trunk', 'motorway_link', 'trunk_link')
        .lineSymbolizer({ ...highwayDflt, strokeWidth: 3 })
      .typesRule('primary', 'secondary', 'tertiary', 'primary_link', 'secondary_link', 'tertiary_link')
        .lineSymbolizer({ ...highwayDflt, strokeWidth: 2 })
      .typesRule(12, 'living_street', 'residential', 'unclassified', 'road')
        .lineSymbolizer({ ...highwayDflt, strokeWidth: 1.5 })
      .rule({ filter: "[type] = 'service' and [service] != 'parking_aisle'", minZoom: 12 })
        .lineSymbolizer({ ...highwayDflt, strokeWidth: 1.5 })
      .rule({ filter: "[type] = 'service' and [service] = 'parking_aisle'", minZoom: 14 })
        .lineSymbolizer({ ...highwayDflt, strokeWidth: 1 })
      .typesRule(14, 'footway', 'pedestrian', 'steps')
        .lineSymbolizer({ ...highwayDflt, strokeWidth: 1, strokeDasharray: '4,2' })
      .doInStyle((style) => {
        const w = [0.5, 0.75, 1];
        const zz = [[12, 12], [13, 13], [14]];
        for (const a of [0, 1, 2]) {
          const k = w[a];
          style
            .typesRule(...zz[a], 'path')
              .lineSymbolizer({ ...highwayDflt, strokeWidth: k * 1, strokeDasharray: '3,3' })
            .typesRule(...zz[a], 'cycleway')
              .lineSymbolizer({ ...highwayDflt, strokeWidth: k * 1, strokeDasharray: '6,3' })
            .doInStyle((style) => {
              [undefined, '8,2', '6,4', '4,6', '2,8', '3,7,7,3'].forEach((strokeDasharray, i) => {
                style
                  .rule({
                      filter: `[type] = 'track' and [tracktype] = ${i === 5 ? "''" : `'grade${i + 1}'`}`,
                      minZoom: zz[a][0],
                      maxZoom: zz[a][1],
                  })
                    .lineSymbolizer({ ...highwayDflt, strokeWidth: k * 1.2, strokeDasharray });
              });
            });
        }
      })
    .style('higwayGlows')
      .typesRule(14, 'footway', 'pedestrian', 'steps')
        .lineSymbolizer({ ...glowDflt, strokeWidth: 1 })
      .typesRule(12, 'path')
        .lineSymbolizer({ ...glowDflt, strokeWidth: 1 })
      .typesRule(12, 'track')
        .lineSymbolizer({ ...glowDflt, strokeWidth: 1.2 })
    .style('aerialways')
      .rule()
        .lineSymbolizer({ strokeWidth: 1, stroke: 'black' })
        .lineSymbolizer({ strokeWidth: 5, stroke: 'black',strokeDasharray: '1,25' })
    .style('buildings')
      .rule({ minZoom: 13 })
        .polygonSymbolizer({ fill: colors.building })
    .style('ruin_polys')
      .rule({ minZoom: 13 })
        .polygonSymbolizer({ fill: colors.ruin })
    .style('protected_areas')
      .typesRule(8, 11, 'national_park', 'nature_reserve')
        .lineSymbolizer({ stroke: hsl(120, 100, 31), strokeWidth: 3, strokeDasharray: '25,7', strokeOpacity: 0.8 })
        .polygonPatternSymbolizer({ file: 'images/national_park_area.svg', alignment: 'global', opacity: 0.4 })
      .typesRule(12, 12, 'national_park', 'nature_reserve')
        .polygonPatternSymbolizer({ file: 'images/national_park_area.svg', alignment: 'global', opacity: 0.2 })
        .lineSymbolizer({ stroke: hsl(120, 100, 31), strokeWidth: 4, strokeDasharray: '25,7', strokeOpacity: 0.4 })
      .typesRule(13, 'national_park', 'nature_reserve')
        .lineSymbolizer({ stroke: hsl(120, 100, 31), strokeWidth: 4, strokeDasharray: '25,7', strokeOpacity: 0.4 })
      .typesRule(12, 'protected_area')
        .linePatternSymbolizer({ file: 'images/protected_area.svg' })
    .style('borders')
      .rule()
        .lineSymbolizer({ stroke: hsl(278, 100, 50), strokeWidth: 6, strokeOpacity: 0.5 })
    .style('feature_lines')
      .typesRule(13, 'cliff')
        .linePatternSymbolizer({ file: 'images/cliff.svg' })
        .lineSymbolizer({ stroke: hsl(0, 0, 25), strokeWidth: 1 })
      .typesRule(13, 'line')
        .lineSymbolizer({ stroke: 'black', strokeWidth: 1, strokeOpacity: 0.5 })
      .typesRule(14, 'minor_line')
        .lineSymbolizer({ stroke: hsl(0, 0, 50), strokeWidth: 1, strokeOpacity: 0.5 })
    .style('hillshade')
      .rule({ maxZoom: 13 })
        .rasterSymbolizer({ scaling: 'bicubic' })
      .rule({ minZoom: 14, maxZoom: 14 })
        .rasterSymbolizer({ scaling: 'bicubic', opacity: 0.5 })
      .rule({ minZoom: 15 })
        .rasterSymbolizer({ scaling: 'bicubic' })
    .style('military_areas')
      .rule({ minZoom: 10 })
        .lineSymbolizer({ stroke: hsl(0, 96, 39), strokeWidth: 3, strokeDasharray: '25,7', strokeOpacity: 0.8 })
      .rule({ minZoom: 10, maxZoom: 13 })
        .polygonPatternSymbolizer({ file: 'images/military_area.svg', alignment: 'global', opacity: 0.5 })
      .rule({ minZoom: 14 })
        .polygonPatternSymbolizer({ file: 'images/military_area.svg', alignment: 'global', opacity: 0.2 })
    .style('feature_points')
      .typesRule(13, 'tower')
        .markersSymbolizer({ file: 'images/power_tower.svg' })
      .typesRule(14, 'pole')
        .markersSymbolizer({ file: 'images/power_pole.svg' })
      .typesRule(16, 'picnic_site', 'picnic_table')
        .markersSymbolizer({ file: 'images/picnic.svg' })
      .poiIcons(pois)
        // .rule({ minZoom: 16 }) // rest texts
        //   .textSymbolizer({ ...fontDfltWrap }, nameWithEle)

    // texts
    .style('locality_names')
      .typesRule(15, 'locality')
        .textSymbolizer({ ...dfltFont, fill: hsl(0, 0, 40), size: 11, haloRadius: 1.5, haloOpacity: 0.2 }, '[name]')
    .style('feature_point_names')
      .poiNames(pois)
    .style('protected_area_names')
      .typesRule(8, 11, 'national_park', 'nature_reserve')
        .textSymbolizer({ ...natureRelatedFont, size: 16, fill: hsl(120, 100, 25), haloFill: 'white', haloRadius: 1.5, placement: 'interior' }, '[name]')
      .typesRule(12, 'protected_area')
        .textSymbolizer({ ...natureRelatedFont, fill: hsl(120, 100, 25), haloFill: 'white', haloRadius: 1.5, placement: 'interior' }, '[name]')
    .style('water_area_names')
      .rule({ filter: "not([type] = 'riverbank')", minZoom: 12 })
        .textSymbolizer({ ...waterFont, placement: 'interior' }, '[name]')
    .style('aeroport_names')
      .rule({ minZoom: 12 })
        .textSymbolizer({ ...wrapFont, placement: 'interior', dy: -10 }, '[name]')
        .markersSymbolizer({ file: 'images/aerodrome.svg', placement: 'interior' })
    .style('building_names')
      .rule({ minZoom: 17 }) // rest names
        .textSymbolizer({ ...wrapFont, placement: 'interior' }, '[name]')
    .style('highway_names')
      .rule({ minZoom: 15 })
        .textSymbolizer({ ...dfltFont, fill: colors.track, placement: 'line', spacing: 200 }, '[name]')
    .style('aerialway_names')
      .rule()
        .textSymbolizer({ ...dfltFont, fill: 'black', placement: 'line', spacing: 200, dy: 6 }, '[name]')
    .style('feature_line_names')
      .doInStyle((style) => {
        // TODO i've disabled opacity - we should re-enable it to see things behind text; then also prevent label cache for it
        // const opacities = { 14: 0.4, 15: 0.4, 16: 0.35, 17: 0.35, 18: 0.35, 19: 0.35 };

        for (let z = 14; z < 20; z++) {
          style.typesRule(z, z, 'valley')
            .textSymbolizer({ ...valleyFont, size: 10 + Math.pow(3, z - 14), fill: hsl(0, 0, 40), // opacity: opacities[z],
              characterSpacing: 3 + Math.pow(3, z - 14), haloRadius: 1.5, haloOpacity: 0.2 }, '[name]');
        }
      })
    .style('water_line_names')
      .typesRule(12, 'river')
        .textSymbolizer({ ...waterFont, placement: 'line', spacing: 400 }, '[name]')
      .rule({ minZoom: 14, filter: "[type] <> 'river'" })
        .textSymbolizer({ ...waterFont, placement: 'line', spacing: 400 }, '[name]')
    .style('fixmes')
      .rule()
        .markersSymbolizer({ file: 'images/fixme.svg' })
    .style('placenames')
      .doInStyle((style) => {
        for (let z = 6; z < 20; z++) {
          const opacity = z <= 14 ? 1 : 0.5;
          const sc = 2.5 * Math.pow(1.2, z);
          const placenamesFontStyle = { ...dfltFont, fill: 'black', haloFill: 'white', // TODO wrap it respecting its size
            opacity, haloOpacity: opacity * 0.9, faceName: 'PT Sans Narrow Bold', characterSpacing: 1 };

          style
            .typesRule(z, z, 'city')
              .textSymbolizer({ ...placenamesFontStyle, haloRadius: 2, textTransform: 'uppercase', size: 1.2 * sc }, '[name]');

          if (z > 8) {
            style
              .typesRule(z, z, 'town')
                .textSymbolizer({ ...placenamesFontStyle, haloRadius: 2, textTransform: 'uppercase', size: 0.8 * sc }, '[name]');
          }

          if (z > 10) {
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
      const x = [];
      if (hikingTrails) {
        x.push('hiking');
      }
      if (bicycleTrails) {
        x.push('bicycle');
      }
      if (skiTrails) {
        x.push('ski');
      }
      if (x.length) {
        s.doInStyle(routes(...x));
      }
    })
    .style('contours', { opacity: 0.33 })
      .rule({ minZoom: 13, filter: '([height] % 100 = 0) and ([height] != 0)' })
        .lineSymbolizer({ stroke: colors.contour, strokeWidth: 0.3 })
        .textSymbolizer({ ...dfltFont, fill: colors.contour, placement: 'line', spacing: 200 }, '[height]')
      .rule({ minZoom: 12, maxZoom: 12, filter: '([height] % 50 = 0) and ([height] != 0)' })
        .lineSymbolizer({ stroke: colors.contour, strokeWidth: 0.2 })
      .rule({ minZoom: 13, maxZoom: 14, filter: '([height] % 20 = 0) and ([height] != 0)' })
        .lineSymbolizer({ stroke: colors.contour, strokeWidth: 0.2 })
      .rule({ minZoom: 15, filter: '([height] % 10 = 0) and ([height] != 0)' })
        .lineSymbolizer({ stroke: colors.contour, strokeWidth: 0.2 })
      .rule({ minZoom: 15, filter: '([height] % 50 = 0) and ([height] % 100 != 0)' })
        .textSymbolizer({ ...dfltFont, fill: colors.contour, placement: 'line', spacing: 200 }, '[height]')

    .doInMap(layers(shading, contours, hikingTrails, bicycleTrails, skiTrails))

    .stringify({ pretty: dumpXml });
}

function types(...type) {
  return type.map((x) => `[type] = '${x}'`).join(' or ');
}

const mapnikConfig = generateFreemapStyle();

if (dumpXml) {
  console.log('Mapnik config:', mapnikConfig);
}

module.exports = {
  mapnikConfig,
  generateFreemapStyle,
};
