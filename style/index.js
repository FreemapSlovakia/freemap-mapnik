/* eslint-disable indent */

const config = require('config');
const { createMap } = require('jsnik');
const { mercSrs } = require('freemap-mapserver/lib/projections'); // TODO ugly

const dbParams = config.get('db');
const contoursCfg = config.get('mapFeatures.contours');
const shadingCfg = config.get('mapFeatures.shading');
const hikingTrailsCfg = config.get('mapFeatures.hikingTrails');
const bicycleTrailsCfg = config.get('mapFeatures.bicycleTrails');
const horseTrailsCfg = config.get('mapFeatures.horseTrails');
const skiTrailsCfg = config.get('mapFeatures.skiTrails');
const dumpXml = config.get('dumpXml');

const { font } = require('./fontFactory');
const { colors, hsl } = require('./colors');
const { extensions } = require('./jsnikExtensions');

const { layers } = require('./layers');
const { routes } = require('./routes');
const { highways } = require('./highways');

const N = false;
const Y = true;
const NN = null;

// minIconZoom, minTextZoom, withEle, natural, types/icon, textOverrides
const pois = [
  // [11, 20, X, O, 'guidepost', { icon: 'guidepost_x', maxZoom: 11 }],
  [12, 12, Y, N, 'guidepost', { icon: 'guidepost_x', font: { faceName: 'PT Sans Bold', dy: -8 }, maxZoom: 12 }],
  [13, 13, Y, N, 'guidepost', { icon: 'guidepost_xx', font: { faceName: 'PT Sans Bold' } }],
  [10, 10, Y, Y, 'peak1', { icon: 'peak', font: { size: 13, dy: -8 } }],
  [11, 11, Y, Y, 'peak2', { icon: 'peak', font: { size: 13, dy: -8 } }],
  [12, 12, Y, Y, 'peak3', { icon: 'peak', font: { size: 13, dy: -8 } }],
  [13, 13, Y, Y, 'peak', { font: { size: 13, dy: -8 } }],
  [15, 15, Y, Y, 'saddle', { font: { size: 13, dy: -8 } }],

  [14, 15, N, N, 'castle'],
  [14, 15, N, N, 'ruins'],
  [14, 15, Y, Y, 'cave_entrance'],
  [14, 15, Y, Y, 'spring', { font: { fill: hsl(216, 100, 50) } }],
  [14, 15, Y, Y, 'waterfall', { font: { fill: hsl(216, 100, 50) } }],
  [14, 15, N, N, ['drinking_water', 'water_point'], { font: { fill: hsl(216, 100, 50) } }],
  [14, 15, N, N, 'water_well', { font: { fill: hsl(216, 100, 50) } }],
  [14, 15, Y, N, 'monument'],
  [14, 15, Y, Y, 'viewpoint'],
  [14, 15, Y, N, ['mine', 'adit', 'mineshaft']],
  [14, 15, Y, N, 'hotel'],
  [14, 15, Y, N, 'chalet'],
  [14, 15, Y, N, 'hostel'],
  [14, 15, Y, N, 'motel'],
  [14, 15, Y, N, 'guest_house'],
  [14, 15, Y, N, 'wilderness_hut'],
  [14, 15, Y, N, 'alpine_hut'],
  [14, 15, Y, N, 'camp_site'],
  [14, 15, N, N, 'attraction'],
  [14, 15, N, N, 'hospital'],
  [14, 15, N, N, 'townhall'],
  [14, 15, N, Y, ['hut', 'cabin']], //  fallback
  [14, 15, N, N, ['church', 'chapel', 'cathedral', 'temple', 'basilica']],
  [14, 15, Y, N, 'tower_observation'],
  [14, 15, Y, N, 'archaeological_site'],
  [14, 15, N, N, ['station', 'halt']],
  [14, 15, N, N, 'bus_station'],
  [14, 15, N, N, 'water_park'],

  [15, 16, N, N, 'water_tower'],
  [15, 16, N, N, 'chimney'],
  [15, 16, N, N, 'fire_station'],
  [15, 16, N, N, 'community_centre'],
  [15, 16, N, N, 'police'],
  [15, 16, N, N, 'office'], // information=office
  [15, 16, N, N, 'hunting_stand'],
  [15, 16, Y, N, 'shelter'],
  [15, 16, N, Y, ['rock', 'stone']],
  [15, 16, N, N, 'museum'],
  [15, 16, N, N, 'pharmacy'],
  [15, 16, N, N, 'cinema'],
  [15, 16, N, N, 'theatre'],
  [15, 16, N, N, 'memorial'],
  [15, 16, N, N, 'pub'],
  [15, 16, N, N, 'cafe'],
  [15, 16, N, N, 'restaurant'],
  [15, 16, N, N, 'convenience'],
  [15, 16, N, N, 'supermarket'],
  [15, 16, N, N, 'fast_food'],
  [15, 16, N, N, 'confectionery'],
  [15, 16, N, N, 'fuel'],
  [15, 16, N, N, 'post_office'],
  [15, 16, N, N, 'bunker'],
  [15, 16, N, N, 'boundary_stone'],
  [15, NN, N, N, 'mast_other'],
  [15, NN, N, N, 'tower_other'],
  [15, NN, N, N, ['tower_communication', 'mast_communication']],
  [15, 16, N, N, 'bus_stop'],
  [15, 16, N, N, 'taxi'],

  [16, 16, N, N, 'board'],
  [16, 17, N, N, 'map'],
  [16, 17, N, N, 'artwork'],
  [16, 17, N, N, 'fountain', { font: { fill: hsl(216, 100, 50) } }],
  [16, NN, N, N, 'watering_place'],
  [16, NN, N, N, 'feeding_place', { icon: 'manger' }],
  [16, NN, N, N, 'game_feedng', { icon: 'manger' }],
  [16, 17, N, N, 'playground'],

  [17, 18, N, N, 'wayside_shrine'],
  [17, 18, N, N, ['cross', 'wayside_cross']],
  [17, NN, N, N, 'firepit'],
  [17, NN, N, N, 'toilets'],
  [17, NN, N, N, 'bench'],

  [18, 19, N, N, 'post_box'],
  [18, 19, N, N, 'telephone'],
  [18, NN, N, N, 'gate'],
  [18, NN, N, N, 'lift_gate'],
  [18, NN, N, N, 'waste_disposal'],
];

function generateFreemapStyle(
  shading = shadingCfg,
  contours = contoursCfg,
  hikingTrails = hikingTrailsCfg,
  bicycleTrails = bicycleTrailsCfg,
  skiTrails = skiTrailsCfg,
  horseTrails = horseTrailsCfg,
) {
  return createMap({
    backgroundColor: 'white',
    srs: mercSrs,
  }, extensions)
    .datasource({ name: 'db' }, dbParams)
    .style('landcover')
      .area(colors.forest, 'forest', 'wood')
      .area(colors.farmland, 'farmland')
      .area(colors.grassy, 'meadow', 'grassland', 'grass', 'park', 'cemetery', 'village_green')
      .typesRule('cemetery')
        .polygonPatternSymbolizer({ file: 'images/grave.svg', alignment: 'global', opacity: 0.5 })
      .area(colors.heath, 'heath')
      .area(colors.scrub, 'scrub', 'vineyard') // TODO use different color/pattern for vineyard
      .typesRule('quarry')
        .borderedPolygonSymbolizer(hsl(0, 0, 70))
        .polygonPatternSymbolizer({ file: 'images/quarry.svg' })
      .area(colors.landfill, 'landfill')
      .area(colors.brownfield, 'brownfield')
      .area(hsl(0, 0, 88), 'residential', 'living_street')
      .area(colors.farmyard, 'farmyard')
      .area(colors.allotments, 'allotments')
      .area(hsl(0, 0, 80), 'industrial')
      .area(hsl(320, 40, 85), 'commercial', 'retail')
      .area(colors.orchard, 'orchard')
      .area(colors.wetland, 'wetland')
      .area(colors.wetland, 'wetland')
      .typesRule(12, 'pitch', 'playground')
        .borderedPolygonSymbolizer(hsl(140, 50, 70))
        .lineSymbolizer({ stroke: hsl(140, 50, 40), strokeWidth: 1 })
      .typesRule(13, 'parking')
        .polygonSymbolizer({ fill: hsl(0, 33, 80) })
        .lineSymbolizer({ stroke: hsl(0, 33, 65), strokeWidth: 1 })
      .typesRule(13, 'feat:bunker_silo')
        .polygonSymbolizer({ fill: hsl(50, 34, 35) })
        .lineSymbolizer({ stroke: hsl(50, 34, 20), strokeWidth: 1 })
    .style('water_area')
      .rule()
        .borderedPolygonSymbolizer(colors.water)
    .style('solar_power_plants')
      .rule({ minZoom: 12, maxZoom: 14, })
        .polygonPatternSymbolizer({ file: 'images/solar_small.svg', alignment: 'global' })
        .lineSymbolizer({ stroke: hsl(176, 153, 200), strokeWidth: 1 })
      .rule({ minZoom: 15 })
        .polygonPatternSymbolizer({ file: 'images/solar.svg', alignment: 'global' })
        .lineSymbolizer({ stroke: hsl(176, 153, 200), strokeWidth: 1 })
    .style('water_line')
      .typesRule('river')
        .lineSymbolizer({ stroke: colors.water, strokeWidth: 2.2 })
      .rule({ filter: "[type] <> 'river'", minZoom: 12 })
        .lineSymbolizer({ stroke: colors.water, strokeWidth: 1.2 })
    .style('barrierways')
      .rule({ minZoom: 16 })
        .lineSymbolizer({ stroke: hsl(0, 100, 50), strokeWidth: 1, strokeDasharray: '2,1' })
    .style('aeroways').doInStyle((style) => {
      const aeroBgLine = { stroke: hsl(240, 30, 40) };
      const aeroFgLine = { stroke: 'white', strokeWidth: 1 };

      style
        .rule({ minZoom: 11, maxZoom: 11 })
          .lineSymbolizer({ ...aeroBgLine, strokeWidth: 3 })
          .lineSymbolizer({ ...aeroFgLine, strokeWidth: 0.5, strokeDasharray: '3,3' })
        .rule({ minZoom: 12, maxZoom: 13 })
          .lineSymbolizer({ ...aeroBgLine, strokeWidth: 5 })
          .lineSymbolizer({ ...aeroFgLine, strokeDasharray: '4,4' })
        .rule({ minZoom: 14 })
          .lineSymbolizer({ ...aeroBgLine, strokeWidth: 8 })
          .lineSymbolizer({ ...aeroFgLine, strokeDasharray: '6,6' });
    })
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
        .lineSymbolizer({ stroke: hsl(278, 100, 50), strokeWidth: 6 })
    .style('cutlines').doInStyle((style) => {
      for (let z = 12; z <= 16; z++) {
        style.typesRule(z, z === 16 ? 20 : z, 'cutline')
          .lineSymbolizer({ stroke: colors.scrub, strokeWidth: 2 + 0.33 * Math.pow(2, z - 12) });
      }
    })
    .style('feature_lines')
      .typesRule(13, 'cliff')
        .linePatternSymbolizer({ file: 'images/cliff.svg' })
        .lineSymbolizer({ stroke: hsl(0, 0, 25), strokeWidth: 1 })
      .typesRule(13, 'line')
        .lineSymbolizer({ stroke: 'black', strokeWidth: 1, strokeOpacity: 0.5 })
      .typesRule(14, 'minor_line')
        .lineSymbolizer({ stroke: hsl(0, 0, 50), strokeWidth: 1, strokeOpacity: 0.5 })
      .doInStyle((style) => {
        for (let z = 13; z <= 19; z++) {
          style.typesRule(z, z === 16 ? 20 : z, 'tree_row')
            .linePatternSymbolizer({ file: 'images/tree.svg', transform: `scale(${(2 + Math.pow(2, z - 15)) / 4})` });
        }
      })
    .style('hillshade')
      .rule({ /* minZoom: 8, */ maxZoom: 8 })
        .rasterSymbolizer({ scaling: 'lanczos', opacity: 1.00 })
      .rule({ minZoom: 9, maxZoom: 9 })
        .rasterSymbolizer({ scaling: 'lanczos', opacity: 0.90 })
      .rule({ minZoom: 10, maxZoom: 11 })
        .rasterSymbolizer({ scaling: 'lanczos', opacity: 0.75 })
      .rule({ minZoom: 12, maxZoom: 12 })
        .rasterSymbolizer({ scaling: 'lanczos', opacity: 0.65 })
      .rule({ minZoom: 13, maxZoom: 13 })
        .rasterSymbolizer({ scaling: 'bilinear', opacity: 0.55 })
      .rule({ minZoom: 14, maxZoom: 14 })
        .rasterSymbolizer({ scaling: 'bilinear', opacity: 0.65 })
      .rule({ minZoom: 15 })
        .rasterSymbolizer({ scaling: 'bilinear', opacity: 0.80 })
    .style('military_areas')
      .rule({ minZoom: 10 })
        .lineSymbolizer({ stroke: hsl(0, 96, 39), strokeWidth: 3, strokeDasharray: '25,7', strokeOpacity: 0.8 })
      .rule({ minZoom: 10, maxZoom: 13 })
        .polygonPatternSymbolizer({ file: 'images/military_area.svg', alignment: 'global', opacity: 0.5 })
      .rule({ minZoom: 14 })
        .polygonPatternSymbolizer({ file: 'images/military_area.svg', alignment: 'global', opacity: 0.2 })
    .style('trees')
      .doInStyle((style) => {
        for (let z = 16; z <= 19; z++) {
          const size = 2 + Math.pow(2, z - 15);
          style
            .rule({ minZoom: z, maxZoom: z })
            .markersSymbolizer({ file: 'images/tree.svg', width: size, height: size, fill: colors.forest, allowOverlap: true, ignorePlacement: true });
        }
      })
    .style('feature_points')
      .typesRule(13, 'tower')
        .markersSymbolizer({ file: 'images/power_tower.svg', allowOverlap: true, ignorePlacement: true })
      .typesRule(14, 'pole')
        .markersSymbolizer({ file: 'images/power_pole.svg', allowOverlap: true, ignorePlacement: true })
      .typesRule(16, 'picnic_site', 'picnic_table')
        .markersSymbolizer({ file: 'images/picnic.svg' })
      .poiIcons(pois)
        // .rule({ minZoom: 16 }) // rest texts
        //   .textSymbolizer({ ...fontDfltWrap }, nameWithEle)

    // texts
    .style('locality_names')
      .typesRule(15, 'locality')
        .textSymbolizer(font().wrap().end({ fill: hsl(0, 0, 40), size: 11, haloRadius: 1.5, haloOpacity: 0.2 }), '[name]')
    .style('feature_point_names')
      .poiNames(pois)
    .style('protected_area_names').doInStyle((style) => {
      for (const z of [8, 9, 10]) {
        style
          .typesRule(z, z, 'national_park', 'nature_reserve')
            .textSymbolizer(font().nature().wrap().end({
              size: 9 + Math.pow(2, z - 7),
              fill: hsl(120, 100, 25),
              haloFill: 'white',
              haloRadius: 1.5,
              placement: 'interior',
            }), '[name]');
      }
    })
      .typesRule(12, 'protected_area')
        .textSymbolizer(font().nature().wrap().end({
          fill: hsl(120, 100, 25),
          haloFill: 'white',
          haloRadius: 1.5,
          placement: 'interior',
        }), '[name]')
    .style('water_area_names')
      .doInStyle((style) => {
        for (let z = 10; z <= 16; z++) {
          style.rule({ filter: `[area] > ${800000 / (1 << (2 * (z - 10)))}`, minZoom: z, maxZoom: z })
            .textSymbolizer(font().water().wrap().end({ placement: 'interior' }), '[name]');
        }
      })
      .rule({ minZoom: 17 })
        .textSymbolizer(font().water().wrap().end({ placement: 'interior' }), '[name]')
    .style('aeroport_names')
      .rule({ minZoom: 12 })
        .textSymbolizer(font().wrap().end({ placement: 'interior', dy: -10 }), '[name]')
        .markersSymbolizer({ file: 'images/aerodrome.svg', placement: 'interior' })
    .style('building_names')
      .rule({ minZoom: 17 }) // rest names
        .textSymbolizer(font().wrap().end({ placement: 'interior' }), '[name]')
    .style('highway_names')
      .rule({ minZoom: 15 })
        .textSymbolizer(font().line().end({ fill: colors.track }), '[name]')
    .style('aerialway_names')
      .rule()
        .textSymbolizer(font().line().end({ fill: 'black', dy: 6 }), '[name]')
    .style('valleys')
      .doInStyle((style) => {
        for (let z = 13; z < 18; z++) {
          const opacity = 0.5 - (z - 13) / 10;
          const cs = 3 + Math.pow(2.5, z - 12);
          const size = 10 + Math.pow(2.5, z - 12);
          const ts = style.rule({ minZoom: z, maxZoom: z })
            .textSymbolizer(font().nature().line(200).end({
              size,
              characterSpacing: cs * 3,
              haloRadius: 1.5,
              haloOpacity: opacity * 0.9,
              opacity,
              lineSpacing: 6 + 3 * Math.pow(2.5, z - 12), // this is to simulate dy adjusted to text orientation
              placementType: 'list',
              smooth: 0.2,
              // horizontalAlignment: 'adjust',
            }), '[name] + "\n "')
              .placement({ characterSpacing: cs * 2 })
              .placement({ characterSpacing: cs * 1.5 })
              .placement({ characterSpacing: cs })
              .placement({ characterSpacing: cs / 3 * 2 })
              .placement({ characterSpacing: cs / 3 })
              .placement({ characterSpacing: 0 });

            if (z > 13) {
              ts.placement({ characterSpacing: 0, size: size * 0.75 });
            }
        }
      })
    .style('water_line_names')
      .typesRule(12, 'river')
        .textSymbolizer(font().water().line(400).end({ characterSpacing: 2 }), '[name]')
      .rule({ minZoom: 14, filter: "[type] <> 'river'" })
        .textSymbolizer(font().water().line(400).end({ characterSpacing: 2 }), '[name]')
    .style('fixmes')
      .rule()
        .markersSymbolizer({ file: 'images/fixme.svg' })
    .style('placenames')
      .doInStyle((style) => {
        for (let z = 6; z < 20; z++) {
          const opacity = z <= 14 ? 1 : 0.5;
          const sc = 2.5 * Math.pow(1.2, z);
          // TODO wrap it respecting its size
          const placenamesFontStyle = font().wrap().end({
            haloFill: 'white',
            opacity,
            haloOpacity: opacity * 0.9,
            faceName: 'PT Sans Narrow Bold',
            characterSpacing: 1,
          });

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
      if (horseTrails) {
        x.push('horse');
      }
      if (x.length) {
        map
          .style('routeGlows').doInStyle(routes(true, ...x))
          .style('routes').doInStyle(routes(false, ...x));
      }
    })
    .style('contours', { opacity: 0.33 })
      .rule({ minZoom: 13, filter: '([height] % 100 = 0) and ([height] != 0)' })
        .lineSymbolizer({ stroke: colors.contour, strokeWidth: 0.3, smooth: 1 })
        .textSymbolizer(font().line().end({ fill: colors.contour, smooth: 1 }), '[height]')
      .rule({ minZoom: 12, maxZoom: 12, filter: '([height] % 50 = 0) and ([height] != 0)' })
        .lineSymbolizer({ stroke: colors.contour, strokeWidth: 0.2, smooth: 1 })
      .rule({ minZoom: 13, maxZoom: 14, filter: '([height] % 20 = 0) and ([height] != 0)' })
        .lineSymbolizer({ stroke: colors.contour, strokeWidth: 0.2, smooth: 1 })
      .rule({ minZoom: 15, filter: '([height] % 10 = 0) and ([height] != 0)' })
        .lineSymbolizer({ stroke: colors.contour, strokeWidth: 0.2, smooth: 1 })
      .rule({ minZoom: 15, filter: '([height] % 50 = 0) and ([height] % 100 != 0)' })
        .textSymbolizer(font().line().end({ fill: colors.contour, smooth: 1 }), '[height]')

    .style('crop', { imageFilters: 'agg-stack-blur(20,20)', imageFiltersInflate: true })
      .rule()
        .polygonSymbolizer({ fill: 'red' })
    .doInMap(highways())
    .doInMap(layers(shading, contours, hikingTrails, bicycleTrails, skiTrails, horseTrails))

    .stringify({ pretty: dumpXml });
}

const mapnikConfig = generateFreemapStyle();

if (dumpXml) {
  console.log('Mapnik config:', mapnikConfig);
}

module.exports = {
  mapnikConfig,
  generateFreemapStyle,
};
