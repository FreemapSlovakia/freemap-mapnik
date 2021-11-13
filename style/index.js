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
  [12, 12, N, N, 'aerodrome'],
  [12, 12, Y, N, 'guidepost', { icon: 'guidepost_x', font: { fontsetName: 'bold', dy: -8 }, maxZoom: 12 }],
  [13, 13, Y, N, 'guidepost', { icon: 'guidepost_xx', font: { fontsetName: 'bold' } }],
  [10, 10, Y, Y, 'peak1', { icon: 'peak', font: { size: 13, dy: -8 } }],
  [11, 11, Y, Y, 'peak2', { icon: 'peak', font: { size: 13, dy: -8 } }],
  [12, 12, Y, Y, 'peak3', { icon: 'peak', font: { size: 13, dy: -8 } }],
  [13, 13, Y, Y, 'peak', { font: { size: 13, dy: -8 } }],

  [14, 15, N, N, 'castle'],
  [14, 15, N, N, 'ruins'],
  [14, 15, Y, Y, 'arch'],
  [14, 15, Y, Y, 'cave_entrance'],
  [14, 15, Y, Y, 'spring', { font: { fill: colors.waterLabel } }],
  [14, 15, Y, Y, 'refitted_spring', { font: { fill: colors.waterLabel } }],
  [14, 15, Y, Y, 'drinking_spring', { font: { fill: colors.waterLabel } }],
  [14, 15, Y, Y, 'not_drinking_spring', { font: { fill: colors.waterLabel } }],
  [14, 15, Y, Y, 'refitted_drinking_spring', { font: { fill: colors.waterLabel } }],
  [14, 15, Y, Y, 'refitted_not_drinking_spring', { font: { fill: colors.waterLabel } }],
  [14, 15, Y, Y, 'hot_spring', { font: { fill: colors.waterLabel } }],
  [14, 15, Y, Y, 'waterfall', { font: { fill: colors.waterLabel } }],
  [14, 15, N, N, ['drinking_water', 'water_point'], { font: { fill: colors.waterLabel } }],
  [14, 15, N, N, 'water_well', { font: { fill: colors.waterLabel } }],
  [14, 15, Y, N, 'monument'],
  [14, 15, Y, Y, 'viewpoint'],
  [14, 15, Y, N, ['mine', 'adit', 'mineshaft']],
  [14, 15, Y, N, 'hotel'],
  [14, 15, Y, N, 'chalet'],
  [14, 15, Y, N, 'hostel'],
  [14, 15, Y, N, 'motel'],
  [14, 15, Y, N, 'guest_house'],
  [14, 15, Y, N, 'apartment'],
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
  [14, 15, N, N, 'museum'],
  [14, 15, N, N, 'free_flying'],
  [14, 15, N, N, 'forester\'s_lodge'],
  [14, 15, N, N, 'horse_riding'],

  [15, NN, Y, N, 'guidepost_noname', { icon: 'guidepost_x' }],
  [15, 15, Y, Y, 'saddle', { font: { size: 13, dy: -8 } }],

  [15, 16, N, N, 'chimney'],
  [15, 16, N, N, 'fire_station'],
  [15, 16, N, N, 'community_centre'],
  [15, 16, N, N, 'police'],
  [15, 16, N, N, 'office'], // information=office
  [15, 16, N, N, 'hunting_stand'],
  [15, 16, Y, N, 'shelter'],
  // [15, 16, Y, N, 'shopping_cart'],
  [15, 16, Y, N, 'lean_to'],
  [15, 16, Y, N, 'public_transport'],
  [15, 16, Y, N, 'picnic_shelter'],
  [15, 16, Y, N, 'basic_hut'],
  [15, 16, Y, N, 'weather_shelter'],
  [15, 16, N, Y, 'rock'],
  [15, 16, N, Y, 'stone'],
  [15, 16, N, N, 'pharmacy'],
  [15, 16, N, N, 'cinema'],
  [15, 16, N, N, 'theatre'],
  [15, 16, N, N, 'memorial'],
  [15, 16, N, N, 'pub'],
  [15, 16, N, N, 'cafe'],
  [15, 16, N, N, 'bar'],
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
  [15, 16, N, N, 'tower_bell_tower'],
  [15, 16, N, N, 'water_tower'],
  [15, 16, N, N, 'bus_stop'],
  [15, 16, N, N, 'taxi'],
  [15, 16, N, N, 'bicycle'],

  [16, NN, N, N, 'picnic_table'],
  [16, 17, N, N, 'picnic_site'],
  [16, 16, N, N, 'board'],
  [16, 17, N, N, 'map'],
  [16, 17, N, N, 'artwork'],
  [16, 17, N, N, 'fountain', { font: { fill: colors.waterLabel } }],
  [16, NN, N, N, 'watering_place', { font: { fill: colors.waterLabel } }],
  [16, NN, N, N, 'feeding_place', { icon: 'manger' }],
  [16, NN, N, N, 'game_feeding', { icon: 'manger' }],
  [16, 17, N, N, 'playground'],
  [16, 17, N, N, ['water_works', 'reservoir_covered', 'pumping_station', 'wastewater_plant'], { font: { fill: colors.waterLabel } }],

  [17, 18, N, N, 'wayside_shrine'],
  [17, 18, N, N, ['cross', 'wayside_cross']],
  [17, NN, N, N, 'firepit'],
  [17, NN, N, N, 'toilets'],
  [17, NN, N, N, 'bench'],
  [17, 18, N, N, 'beehive'],
  [17, NN, N, N, ['lift_gate', 'swing_gate']],

  [18, 19, N, N, 'post_box'],
  [18, 19, N, N, 'telephone'],
  [18, NN, N, N, 'gate'],
  [18, NN, N, N, 'waste_disposal'],
];

function generateFreemapStyle({
  features: {
    shading,
    contours,
    hikingTrails,
    bicycleTrails,
    skiTrails,
    horseTrails,
  } = {
    shading: shadingCfg,
    contours: contoursCfg,
    hikingTrails: hikingTrailsCfg,
    bicycleTrails: bicycleTrailsCfg,
    skiTrails: skiTrailsCfg,
    horseTrails: horseTrailsCfg,
  },
  custom, legendLayers, format } = {}
) {
  return createMap({
    backgroundColor: legendLayers ? undefined : colors.water,
    srs: mercSrs,
  }, extensions)
    .fontSet('regular', ['PT Sans Regular', 'Fira Sans Condensed Regular'])
    .fontSet('italic', ['PT Sans Italic', 'Fira Sans Condensed Italic'])
    .fontSet('bold', ['PT Sans Bold', 'Fira Sans Condensed Bold'])
    .fontSet('narrow bold', ['PT Sans Narrow Bold', 'Fira Sans Extra Condensed Bold'])
    .datasource({ name: 'db' }, dbParams)
    .style('sea')
      .rule()
        .borderedPolygonSymbolizer('white')
    .style('landcover')
      .area(colors.forest, 'forest', 'wood')
      .area(colors.farmland, 'farmland')
      .area(colors.grassy, 'meadow', 'park', 'cemetery', 'village_green')
      .area(colors.grassy, 'fell', 'grassland', 'grass')
        // .polygonPatternSymbolizer({ file: 'images/fell.svg', alignment: 'global', opacity: 0.5 })
      .typesRule('cemetery')
        .polygonPatternSymbolizer({ file: 'images/grave.svg', alignment: 'local', opacity: 0.5 })
      .area(colors.heath, 'heath')
      .area('white', 'bare_rock')
        .polygonPatternSymbolizer({ file: 'images/bare_rock.svg', alignment: 'global', opacity: 0.2 })
      .area(colors.orchard, 'vineyard')
        .polygonPatternSymbolizer({ file: 'images/grapes.svg', alignment: 'global', opacity: 0.20 })
      .area(colors.orchard, 'garden')
        .lineSymbolizer({ stroke: hsl(0, 0, 0), strokeWidth: 1, strokeOpacity: 0.2 })
      .area(colors.orchard, 'orchard')
        .polygonPatternSymbolizer({ file: 'images/orchard.svg', alignment: 'global', opacity: 0.20 })
      .area(hsl(60, 90, 85), 'beach')
        .polygonPatternSymbolizer({ file: 'images/sand.svg', alignment: 'global', opacity: 0.25 })
      .area(colors.scrub, 'scrub')
        .polygonPatternSymbolizer({ file: 'images/scrub.svg', alignment: 'global', opacity: 0.2 })
      .area(colors.scrub, 'plant_nursery')
        .polygonPatternSymbolizer({ file: 'images/plant_nursery.svg', alignment: 'global', opacity: 0.2 })
      .area(hsl(0, 0, 70), 'quarry')
        .polygonPatternSymbolizer({ file: 'images/quarry.svg' })
      .area(hsl(0, 0, 90), 'scree')
        .polygonPatternSymbolizer({ file: 'images/scree.svg', opacity: 0.33 })
      .area(colors.landfill, 'landfill')
      .area(hsl(74, 29, 68), 'clearcut')
        .polygonPatternSymbolizer({ file: 'images/stump.svg', opacity: 0.33 })
      .area(colors.brownfield, 'brownfield')
      .area(hsl(0, 0, 88), 'residential', 'living_street')
      .area(colors.farmyard, 'farmyard')
      .area(colors.allotments, 'allotments')
      .area(hsl(0, 0, 80), 'industrial', 'wastewater_plant')
      .area(hsl(320, 40, 85), 'commercial', 'retail')
      .typesRule(12, 'pitch', 'playground', 'golf_course')
        .borderedPolygonSymbolizer(hsl(140, 50, 70))
        .lineSymbolizer({ stroke: hsl(140, 50, 40), strokeWidth: 1 })
      .typesRule(13, 'parking')
        .polygonSymbolizer({ fill: hsl(0, 33, 80) })
        .lineSymbolizer({ stroke: hsl(0, 33, 65), strokeWidth: 1 })
      .typesRule(13, 'bunker_silo')
        .polygonSymbolizer({ fill: hsl(50, 34, 35) })
        .lineSymbolizer({ stroke: hsl(50, 34, 20), strokeWidth: 1 })
    .style('water_area')
      .rule({ minZoom: 8, maxZoom: 13, filter: '[tmp] = 1' })
        .polygonPatternSymbolizer({ file: 'images/temp_water.svg', alignment: 'local', transform: 'scale(0.5)' })
      .rule({ minZoom: 14, filter: '[tmp] = 1' })
        .polygonPatternSymbolizer({ file: 'images/temp_water.svg', alignment: 'local' })
      .rule({ minZoom: 8, filter: '[tmp] != 1' })
        .borderedPolygonSymbolizer(colors.water)
      .rule({ maxZoom: 9, filter: '[tmp] != 1' })
        .polygonSymbolizer({ fill: colors.water })
    .style('solar_power_plants')
      .rule({ minZoom: 12, maxZoom: 14, })
        .polygonPatternSymbolizer({ file: 'images/solar_small.svg', alignment: 'global' })
        .lineSymbolizer({ stroke: hsl(176, 153, 200), strokeWidth: 1 })
      .rule({ minZoom: 15 })
        .polygonPatternSymbolizer({ file: 'images/solar.svg', alignment: 'global' })
        .lineSymbolizer({ stroke: hsl(176, 153, 200), strokeWidth: 1 })
    .style('water_line')
      .typesRule(0, 8, 'river')
        .lineSymbolizer({ stroke: colors.water, strokeWidth: 'pow(1.5, @zoom - 8)' })
      .typesRule(9, 9, 'river')
        .lineSymbolizer({ stroke: colors.water, strokeWidth: 1.5 })
      .typesRule(10, 'river')
        .lineSymbolizer({ stroke: colors.water, strokeWidth: 2.2, strokeOpacity: '1 - [tunnel] / 0.6', strokeDasharray: '[dasharray]' })
      .rule({ filter: "[type] <> 'river'", minZoom: 12 })
        .lineSymbolizer({ stroke: colors.water, strokeWidth: 1.2, strokeOpacity: '1 - [tunnel] / 0.6', strokeDasharray: '[dasharray]' })
      .rule({ minZoom: 14 })
        .markersSymbolizer({ file: 'images/waterway-arrow.svg', spacing: 300, placement: 'line' })
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
        .lineSymbolizer({ strokeWidth: 5, stroke: 'black', strokeDasharray: '1,25' })
    .style('buildings')
      .rule({ minZoom: 13 })
        .polygonSymbolizer({ fill: colors.building })
    .style('ruin_polys')
      .rule({ minZoom: 13 })
        .polygonSymbolizer({ fill: colors.ruin })
    .style('protected_areas')
      .typesRule(8, 11, 'national_park')
        .lineSymbolizer({ stroke: hsl(120, 100, 31), strokeWidth: 3, strokeDasharray: '25,7', strokeOpacity: 0.8 })
        .polygonPatternSymbolizer({ file: 'images/national_park_area.svg', alignment: 'global', opacity: 0.4 })
      .typesRule(12, 12, 'national_park')
        .polygonPatternSymbolizer({ file: 'images/national_park_area.svg', alignment: 'global', opacity: 0.2 })
        .lineSymbolizer({ stroke: hsl(120, 100, 31), strokeWidth: 4, strokeDasharray: '25,7', strokeOpacity: 0.4 })
      .typesRule(13, 'national_park')
        .lineSymbolizer({ stroke: hsl(120, 100, 31), strokeWidth: 4, strokeDasharray: '25,7', strokeOpacity: 0.4 })
      .typesRule(12, 'protected_area', 'nature_reserve')
        .linePatternSymbolizer({ file: 'images/protected_area.svg' })
    .style('borders')
      .rule({ maxZoom: 10 })
        .lineSymbolizer({ stroke: hsl(278, 100, 50), strokeWidth: '0.5 + 6 * pow(1.4, @zoom - 11)', strokeLinejoin: 'round' })
      .rule({ minZoom: 11 })
        .lineSymbolizer({ stroke: hsl(278, 100, 50), strokeWidth: 6, strokeLinejoin: 'round' })
    .style('cutlines').doInStyle((style) => {
      for (let z = 12; z <= 16; z++) {
        style.typesRule(z, z === 16 ? 20 : z, 'cutline')
          .lineSymbolizer({ stroke: colors.scrub, strokeWidth: 2 + 0.33 * Math.pow(2, z - 12) });
      }
    })
    .style('pipelines')
      .rule({ minZoom: 11, filter: '[location] = "overground" or [location] = "overhead" or [location] = ""' })
        .lineSymbolizer({ stroke: hsl(0, 0, 50), strokeWidth: 2, strokeLinejoin: 'round' })
        .lineSymbolizer({ stroke: hsl(0, 0, 50), strokeWidth: 4, strokeLinejoin: 'round', strokeDasharray: '0,15,1.5,1.5,1.5,1' })
      .rule({ minZoom: 15, filter: '[location] = "underground" or [location] = "underwater"' })
        .lineSymbolizer({ stroke: hsl(0, 0, 50), strokeWidth: 2, strokeLinejoin: 'round', strokeOpacity: 0.33 })
        .lineSymbolizer({ stroke: hsl(0, 0, 50), strokeWidth: 4, strokeLinejoin: 'round', strokeDasharray: '0,15,1.5,1.5,1.5,1', strokeOpacity: 0.33 })

    .style('feature_lines_maskable')
      .typesRule(13, 'cliff')
        .linePatternSymbolizer({ file: 'images/cliff.svg' })
        .lineSymbolizer({ stroke: hsl(0, 0, 33), strokeWidth: 1 })
      .typesRule(14, 'earth_bank')
        .linePatternSymbolizer({ file: 'images/earth_bank.svg' })
    .style('feature_lines')
      .typesRule(16, 'dyke')
        .linePatternSymbolizer({ file: 'images/dyke.svg' })
      .typesRule(16, 'embankment')
        .linePatternSymbolizer({ file: 'images/embankment-half.svg' })
      .typesRule(16, 'gully')
        .linePatternSymbolizer({ file: 'images/gully.svg' })
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
    .style('embankments')
      .rule({})
        .linePatternSymbolizer({ file: 'images/embankment.svg' })
    .style('mask') // hillshading helper for mask
      .rule()
        .rasterSymbolizer({ scaling: 'bilinear', opacity: 1.00 })
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
    .style('features')
      .typesRule(13, 'tower')
        .markersSymbolizer({ file: 'images/power_tower.svg', allowOverlap: true, ignorePlacement: true })
      .typesRule(14, 'pole')
        .markersSymbolizer({ file: 'images/power_pole.svg', allowOverlap: true, ignorePlacement: true })
      .poiIcons(pois)
        // .rule({ minZoom: 16 }) // rest texts
        //   .textSymbolizer({ ...fontDfltWrap }, nameWithEle)

    // texts
    .style('locality_names')
      .typesRule(15, 'locality')
        .textSymbolizer(font().wrap().end({ fill: hsl(0, 0, 40), size: 11, haloRadius: 1.5, haloOpacity: 0.2 }), '[name]')
    .style('feature_names')
      .poiNames(pois)
    .style('protected_area_names').doInStyle((style) => {
      for (const z of [8, 9, 10]) {
        style
          .typesRule(z, z, 'national_park')
            .textSymbolizer(font().nature().wrap().end({
              size: 9 + Math.pow(2, z - 7),
              fill: hsl(120, 100, 25),
              haloFill: 'white',
              haloRadius: 1.5,
              placement: 'interior',
            }), '[name]');
      }
    })
      .typesRule(12, 'protected_area', 'nature_reserve')
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
    .style('feature_poly_names')
      .doInStyle((style) => {
        for (let z = 12; z <= 16; z++) {
          style.rule({ filter: `[area] > ${2400000 / (1 << (2 * (z - 10)))}`, minZoom: z, maxZoom: z })
            .textSymbolizer(font().wrap().end({ placement: 'interior', fill: hsl(0, 0, 33) }), '[name]');
        }
      })
      .rule({ minZoom: 17 })
        .textSymbolizer(font().wrap().end({ placement: 'interior' }), '[name]')
    .style('landcover_names_natural')
      .doInStyle((style) => {
        for (let z = 12; z <= 16; z++) {
          style.rule({ filter: `[area] > ${2400000 / (1 << (2 * (z - 10)))}`, minZoom: z, maxZoom: z })
            .textSymbolizer(font().wrap().end({ placement: 'interior', fill: hsl(120, 100, 25), fontsetName: 'italic' }), '[name]');
        }
      })
      .rule({ minZoom: 17 })
        .textSymbolizer(font().wrap().end({ placement: 'interior' }), '[name]')
    .style('landcover_names')
      .doInStyle((style) => {
        for (let z = 12; z <= 16; z++) {
          style.rule({ filter: `[area] > ${2400000 / (1 << (2 * (z - 10)))}`, minZoom: z, maxZoom: z })
            .textSymbolizer(font().wrap().end({ placement: 'interior', fill: hsl(0, 0, 33) }), '[name]');
        }
      })
      .rule({ minZoom: 17 })
        .textSymbolizer(font().wrap().end({ placement: 'interior' }), '[name]')
    .style('building_names')
      .rule({ minZoom: 17 }) // rest names
        .textSymbolizer(font().wrap().end({ placement: 'interior' }), '[name]')
    .style('housenumbers')
      .rule({})
        .textSymbolizer(font().end({ placement: 'interior', size: 8, haloOpacity: 0.5, fill: hsl(0, 0, 33) }), '[housenumber]')
    .style('highway_names')
      .rule({ minZoom: 15 })
        .textSymbolizer(font().line().end({ fill: colors.track }), '[name]')
    .style('aerialway_names')
      .rule()
        .textSymbolizer(font().line().end({ fill: 'black', dy: 6 }), '[name]')
    .style('valleys_ridges')
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
              lineSpacing: `[offset_factor] * ${6 + 3 * Math.pow(2.5, z - 12)}`, // this is to simulate dy adjusted to text orientation
              placementType: 'list',
              smooth: 0.2,
              maxCharAngleDelta: 180,
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
            if (z > 14) {
              ts.placement({ characterSpacing: 0, size: size * 0.5 });
            }
        }
      })
    .style('water_line_names')
      .typesRule(12, 'river')
        .textSymbolizer(font().water().line(400).end({ characterSpacing: 2 }), '[name]')
      .rule({ minZoom: 14, filter: "[type] <> 'river'" })
        .textSymbolizer(font().water().line(300).end({ characterSpacing: 2 }), '[name]')
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
            fontsetName: 'narrow bold',
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
    .style('geonames')
      .rule()
        .textSymbolizer(
          font().line().nature().end({
            haloFill: 'white',
            characterSpacing: 1,
            haloRadius: 2,
            allowOverlap: true,
            opacity: '0.8 - pow(1.5, @zoom - 9) / 5',
            haloOpacity: '0.8 - pow(1.5, @zoom - 9) / 5',
            size: '8 + pow(1.9, @zoom - 6)',
            horizontalAlignment: 'adjust',
            smooth: 0.2,
            maxCharAngleDelta: 180,
          }),
          '[name]')
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
    .style('route_names')
      .rule()
        .textSymbolizer(font().line(500).end({ fill: 'black', size: 11, haloRadius: 1.5, haloOpacity: 0.2, dy: '4 + [off1] * 2.5' }), '[refs1]')
        .textSymbolizer(font().line(500).end({ fill: 'black', size: 11, haloRadius: 1.5, haloOpacity: 0.2, dy: '-4 - [off2] * 4' }), '[refs2]')
    .style('contours', { opacity: 0.33 })
      .rule({ minZoom: 13, maxZoom: 14, filter: '([height] % 100 = 0) and ([height] != 0)' })
        .lineSymbolizer({ stroke: colors.contour, strokeWidth: 0.4, smooth: 1 })
        .textSymbolizer(font().line().end({ fill: colors.contour, smooth: 1, upright: 'left' }), '[height]')
      .rule({ minZoom: 12, maxZoom: 12, filter: '([height] % 50 = 0) and ([height] != 0)' })
        .lineSymbolizer({ stroke: colors.contour, strokeWidth: 0.2, smooth: 1 })
      .rule({ minZoom: 13, maxZoom: 14, filter: '([height] % 20 = 0) and ([height] != 0)' })
        .lineSymbolizer({ stroke: colors.contour, strokeWidth: 0.2, smooth: 1 })

      .rule({ minZoom: 15, filter: '([height] % 100 = 0) and ([height] != 0)' })
        .lineSymbolizer({ stroke: colors.contour, strokeWidth: 0.6, smooth: 1 })
        .textSymbolizer(font().line().end({ fill: colors.contour, smooth: 1, upright: 'left' }), '[height]')
      .rule({ minZoom: 15, filter: '([height] % 10 = 0) and ([height] != 0)' })
        .lineSymbolizer({ stroke: colors.contour, strokeWidth: 0.3, smooth: 1 })
      .rule({ minZoom: 15, filter: '([height] % 50 = 0) and ([height] % 100 != 0)' })
        .textSymbolizer(font().line().end({ fill: colors.contour, smooth: 1, upright: 'left' }), '[height]')

    .doInMap(map => {
      if (format !== 'svg' && format !== 'pdf') {
        map.style('crop', { imageFilters: 'agg-stack-blur(20,20)', imageFiltersInflate: true })
          .rule()
            .polygonSymbolizer({ fill: 'red' });
      }

      return map;
    })
    .doInMap(highways())
    .doInMap(layers(shading, contours, hikingTrails, bicycleTrails, skiTrails, horseTrails, format, custom, legendLayers))

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
