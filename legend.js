const props = {
  zoom: 18,
  bbox: [-0.00018, -0.00008, 0.00018, 0.00008],
  scale: 1,
};

const routeDefaults = {
  id: 1,
  h_red: 0,
  h_blue: 0,
  h_green: 0,
  h_yellow: 0,
  h_black: 0,
  h_white: 0,
  h_orange: 0,
  h_purple: 0,
  h_red_loc: 0,
  h_blue_loc: 0,
  h_green_loc: 0,
  h_yellow_loc: 0,
  h_black_loc: 0,
  h_white_loc: 0,
  h_orange_loc: 0,
  h_purple_loc: 0,
  b_red: 0,
  b_blue: 0,
  b_green: 0,
  b_yellow: 0,
  b_black: 0,
  b_white: 0,
  b_orange: 0,
  b_purple: 0,
  s_red: 0,
  s_blue: 0,
  s_green: 0,
  s_yellow: 0,
  s_black: 0,
  s_white: 0,
  s_orange: 0,
  s_purple: 0,
  r_red: 0,
  r_blue: 0,
  r_green: 0,
  r_yellow: 0,
  r_black: 0,
  r_white: 0,
  r_orange: 0,
  r_purple: 0,
  refs1: '',
  refs2: '',
  off1: 0,
  off2l: 0,
};

/**
 *
 * @param {string[]} styles
 * @param {Record<string, unknown>} properties
 */
function asLine(styles, properties, reverse) {
  return {
    styles,
    geojson: {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [reverse ? 0.00018 : -0.00018, reverse ? 0.00004 : -0.00004],
          [ reverse? -0.00018 : 0.00018, reverse ? -0.00004 : 0.00004],
        ],
      },
      properties,
    },
  };
}

/**
 *
 * @param {string[]} styles
 * @param {Record<string, unknown>} properties
 */
function asPoint(styles, properties, yOffset = 0) {
  return {
    styles,
    geojson: {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [0, yOffset] },
      properties,
    },
  };
}

/**
 *
 * @param {string[]} styles
 * @param {Record<string, unknown>} properties
 */
function asArea(styles, properties) {
  return {
    styles,
    geojson: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-0.00018, -0.00008],
            [-0.00018, 0.00008],
            [0.00018, 0.00008],
            [0.00018, -0.00008],
            [-0.00018, -0.00008],
          ],
        ],
      },
      properties,
    },
  };
}

const forest = asArea(['landcover'], { type: 'forest' });

function road(type, en, sk) {
  return {
    categoryId: 'communications',
    name: {
      en,
      sk,
    },
    layers: [
      forest,
      asLine(['higwayGlows', 'highways', 'highway_names'], {
        type,
        name: 'Abc',
        class: 'highway',
        bridge: '',
        tunnel: '',
        tracktype: '',
      }),
    ],
    ...props,
  };
}

function poi(type, en, sk, eithEle) {
  return {
    categoryId: 'poi',
    name: {
      en,
      sk,
    },
    layers: [
      forest,
      asPoint(['features', 'feature_names'], {
        name: 'Abc',
        type,
        ele: eithEle ? 320 : ''
      }, eithEle ? -0.00005 : -0.00003),
    ],
    ...props,
  };
}

function landcover(type, en, sk) {
  return {
    categoryId: 'landcover',
    name: {
      en,
      sk,
    },
    layers: [asArea(['landcover'], { type })],
    ...props
  };
}



const track3 = asLine(['higwayGlows', 'highways'], {
  type: 'track',
  tracktype: 'grade3',
  class: 'highway',
  bridge: '',
  tunnel: '',
});

const track3rev = asLine(['higwayGlows', 'highways'], {
  type: 'track',
  tracktype: 'grade3',
  class: 'highway',
  bridge: '',
  tunnel: '',
}, true);

// TODO

//     .layer('placenames', { type: 'csv', inline: `
// id|name|type|wkt
// 1|Test 123|town|Point(21.219835 48.655111)
// ` }, { srs: '+init=epsg:4326', bufferSize: 1024 })

//       .layer('protected_areas', { type: 'csv', inline: `
// id|type|wkt
// 1|protected_area|Polygon((21.21 48.655, 21.22 48.655, 21.22 48.654, 21.21 48.654, 21.21 48.655))
// ` }, { srs: '+init=epsg:4326', bufferSize: 1024 })

//     .layer('highways', { type: 'csv', inline: `
// id|type|tracktype|class|service|bridge|tunnel|wkt
// 1|track|grade3|highway||0|0|Linestring(21.21 48.655111, 21.22 48.654111)
// ` }, { srs: '+init=epsg:4326', bufferSize: 1024 })

//     .layer('routes', { type: 'csv', inline: `
// id|h_red|h_blue|h_green|h_yellow|h_black|h_white|h_orange|h_purple|h_red_loc|h_blue_loc|h_green_loc|h_yellow_loc|h_black_loc|h_white_loc|h_orange_loc|h_purple_loc|b_red|b_blue|b_green|b_yellow|b_black|b_white|b_orange|b_purple|s_red|s_blue|s_green|s_yellow|s_black|s_white|s_orange|s_purple|r_red|r_blue|r_green|r_yellow|r_black|r_white|r_orange|r_purple|refs1|refs2|off1|off2l|wkt
// 1|1|0|2|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|||0|0|Linestring(21.21 48.655111, 21.22 48.654111)
// ` }, { srs: '+init=epsg:4326', bufferSize: 1024 })

const legend = {
  categories: [
    {
      id: 'trails',
      name: {
        en: 'Marked trails',
        sk: 'Značené trasy',
      },
    },
    {
      id: 'communications',
      name: {
        en: 'Communications',
        sk: 'Komunikácie',
      },
    },
    {
      id: 'landcover',
      name: {
        en: 'Land use',
        sk: 'Plochy',
      },
    },
    {
      id: 'poi',
      name: {
        en: 'Points of Interest',
        sk: 'Body záujmu',
      },
    },
  ],
  items: [
    {
      categoryId: 'trails',
      name: {
        en: 'international, national or regional hiking trail',
        sk: 'medzinárodná, národná alebo regionálna turistická trasa',
      },
      layers: [
        forest,
        track3rev,
        asLine(['routes', 'route_names'], {
          ...routeDefaults,
          h_blue: 1,
          off1: 1,
          refs1: '2817',
        }, true),
      ],
      ...props,
    },
    {
      categoryId: 'trails',
      name: {
        en: 'local hiking trail',
        sk: 'miestná turistické trasa',
      },
      layers: [
        forest,
        track3rev,
        asLine(['routes', 'route_names'], {
          ...routeDefaults,
          h_blue_loc: 1,
          off1: 1,
          refs1: '1A',
        }, true),
      ],
      ...props,
    },
    {
      categoryId: 'trails',
      name: {
        en: 'bicycle trail',
        sk: 'cyklotrasa',
      },
      layers: [
        forest,
        track3,
        asLine(['routes', 'route_names'], {
          ...routeDefaults,
          b_blue: 1,
          off1: 1,
          refs2: '028',
        }),
      ],
      ...props,
    },
    {
      categoryId: 'trails',
      name: {
        en: 'x-country ski trail',
        sk: 'lyžiarská (bežkárska) trasa',
      },
      layers: [
        forest,
        track3,
        asLine(['routes', 'route_names'], {
          ...routeDefaults,
          s_blue: 1,
          off1: 1,
          refs2: 'X2',
        }),
      ],
      ...props,
    },
    {
      categoryId: 'trails',
      name: {
        en: 'horse trail',
        sk: 'jazdecká trasa',
      },
      layers: [
        forest,
        track3rev,
        asLine(['routes', 'route_names'], {
          ...routeDefaults,
          r_blue: 1,
          off1: 1,
          refs1: 'Neigh',
        }, true),
      ],
      ...props,
    },

    road('motorway', 'highway, motorway', 'diaľnica a cesta pre motorové vozidlá'),
    road('primary', 'primary road', 'cesta 1. triedy'),
    road('secondary', 'secondary road', 'cesta 2. triedy'),
    road('tertiary', 'tertiary road', 'cesta 3. triedy'),
    road('residential', 'street, unclassified road or road of unknown kind', 'ulica, neklasifikovaná cesta alebo cesta neznámeho druhu'),
    ...['', 1, 2, 3, 4, 5].map((grade) => ({
      categoryId: 'communications',
      name: {
        en: 'track ' + (grade ? `(grade ${grade})` : '(unknown grade)') + (grade === 1 ? ', service road' : ''),
        sk: `lesná alebo poľná cesta (${grade ? `kvalita ${grade}` : 'neznáma kvalita'})${grade === 1 ? ', servisná/prístupová cesta' : ''}`,
      },
      layers: [
        forest,
        asLine(['higwayGlows', 'highways', 'highway_names'], {
          type: 'track',
          name: 'Abc',
          class: 'highway',
          bridge: '',
          tunnel: '',
          tracktype: grade ? `grade${grade}` : '',
        }),
      ],
      ...props,
    })),
    // road('bridleway', 'bridleway', 'chodník pre kone'),
    road('cycleway', 'cycleway', 'cyklochodník'),
    road('path', 'sidewalk, path, steps, platform, pedestrian', 'chodník, cestička, schody, nástupište, pešia zóna'),
    {
      categoryId: 'communications',
      name: {
        en: 'railway',
        sk: 'koľajnice',
      },
      layers: [
        forest,
        asLine(['higwayGlows', 'highways'], {
          type: 'rail',
          class: 'railway',
          service: '',
          bridge: '',
          tunnel: '',
          tracktype: '',
        }),
      ],
      ...props,
    },
    //       [
    //         'track-grade1',
    //         'servisná a prístupová cesta, spevnená lesná alebo poľná cesta (stupeň 1)',
    //       ], // highway-service TODO parking_aisle
    //       ['track-grade2', 'mierne spevnená lesná alebo poľná cesta (stupeň 2)'],
    //       [
    //         'track-grade3',
    //         'kvalitná nespevnená lesná alebo poľná cesta (stupeň 3)',
    //       ],
    //       [
    //         'track-grade4',
    //         'nekvalitná nespevnená lesná alebo poľná cesta (stupeň 4)',
    //       ],
    //       ['track-grade5', 'lesná alebo poľná cesta (stupeň 5)'],
    //       ['highway-track', 'lesná alebo poľná cesta neznámaj kvality'],

    //       ['highway-cycleway', 'cyklochodník'],
    //       ['highway-construction', 'komunikácia vo výstavbe'],
    //       ['highway-raceway', 'pretekárska dráha'],
    //       ['rail-rail', 'rail'],
    //       ['rail-tram', 'električkové trať'],
    //       ['rail-abandoned', 'opustená koľajová dráha'],
    //       ['rail-disused', 'nepouživaná koľajová dráha'],
    //       ['rail-construction', 'koľajová dráha vo výstavbe'],
    //       ['rail-funicular', 'pozemná lanová dráha'],
    //       ['rail-light_rail', 'ľahká koľajová dráha'],
    //       ['rail-monorail', 'jednokoľajka'],
    //       ['rail-narrow_gauge', 'úzkokoľajka'],
    //       ['rail-preserved', 'historická koľajová dráha'],
    //       ['rail-subway', 'dráha metra'],


    //   // ...Object.values((mapping).tables.features.mappings)
    //   //   .flatMap((x: any) => Object.values(x.mapping))
    //   //   .flat()
    //   //   .map((type) =>
    //   //     run(`poi-${type}.png`, pack([forest, asPoint(['features'], { type })]))
    //   //   ),

    poi('guidepost', 'guidepost', 'smerovník', true),
    poi('spring', 'spring', 'prameň', true),
    poi('water_well', 'water well', 'studňa'),
    poi('waterfall', 'waterfall', 'vodopád'),
    poi('peak', 'peak', 'vrchol', true),
    poi('saddle', 'saddle', 'sedlo'),
    poi('viewpoint', 'viewpoint', 'výhľad'),
    poi('cave_entrance', 'cave', 'jaskyňa'),
    poi('castle', 'castle', 'hrad'),
    poi('ruins', 'ruins', 'ruiny'),
    poi('monument', 'monument', 'pamätník'),
    poi('memorial', 'memorial', 'pamätník'),
    poi('mine', 'mine, adit, mineshaft', 'baňa, štôlňa, šachta'),
    poi('hotel', 'hotel', 'hotel'),
    poi('chalet', 'chalet', 'chata'),
    poi('hostel', 'hostel', 'ubytovňa'),
    poi('motel', 'motel', 'motel'),
    poi('guest_house', 'guest_house', 'penzión'),
    poi('wilderness_hut', 'wilderness hut', 'chata v divočine'),
    poi('alpine_hut', 'alpine hut', 'horská chata'),
    poi('camp_site', 'camp site', 'kemp'),
    poi('attraction', 'attraction', 'atrakcia'),
    poi('hospital', 'hospital', 'nemocnica'),
    poi('townhall', 'townhall', 'radnica, obecný úrad'),
    poi('hut', 'hut, cabin', 'búda, chatka'),
    poi('church', 'church, chapel, cathedral, temple, basilica', 'kostol, cerkva, kaplnka, katedrála, chrám, bazilika'),
    poi('tower_observation', 'observation tower', 'vyhliadková veža'),
    poi('archaeological_site', 'archaeological site', 'archeologické nálezisko'),
    poi('station', 'train station, halt', 'vlaková zastávka'),
    poi('bus_station', 'bus station', 'autobusová zastávka'),
    poi('museum', 'museum', 'múzeum'),
    poi('water_tower', 'water tower', 'vodná veža'),
    poi('chimney', 'chimney', 'komín'),
    poi('fire_station', 'fire station', 'hasičská stanica'),
    poi('community_centre', 'community centre', 'dom kultúru, komunitné centrum'),
    poi('police', 'police', 'polícia'),
    poi('office', 'office', 'informačné centrum'),
    poi('hunting_stand', 'hunting stand', 'poľovnícky posed'),
    poi('shelter', 'shelter', 'prístrešok'),
    poi('rock', 'rock', 'skala'),
    poi('pharmacy', 'pharmacy', 'lekáreň'),
    poi('cinema', 'cinema', 'kino'),
    poi('theatre', 'theatre', 'divadlo'),
    poi('pub', 'pub', 'hostinec, krčma'),
    poi('cafe', 'cafe', 'kaviareň'),
    poi('restaurant', 'restaurant', 'reštaurácia'),
    poi('convenience', 'convenience store', 'potraviny'),
    poi('supermarket', 'supermarket', 'supermarket'),
    poi('fast_food', 'fast food', 'rýchle občerstvenie'),
    poi('confectionery', 'confectionery', 'cukráreň'),
    poi('fuel', 'fuel station', 'čerpacia stanica'),
    poi('post_office', 'post office', 'pošta'),
    poi('bunker', 'bunker', 'bunker'),
    poi('boundary_stone', 'boundary stone', 'hraničný kameň'),
    poi('mast_other', 'mast', 'stožiar'),
    poi('tower_other', 'tower', 'veža'),
    poi('tower_communication', 'communication tower', 'komunikačná veža'),
    poi('bus_stop', 'bus stop', 'autobusová zastávka'),
    poi('taxi', 'taxi', 'taxi'),
    poi('picnic_table', 'picnic table', 'stôl na piknik'),
    poi('picnic_site', 'picnic site', 'miesto na piknik'),
    poi('board', 'board', 'tabuľa'),
    poi('map', 'map', 'mapa'),
    poi('artwork', 'artwork', 'umelecké dielo'),
    poi('fountain', 'fountain', 'fontána'),
    poi('watering_place', 'watering place', 'napájadlo'),
    poi('feeding_place', 'feeding place', 'krmidlo'),
    poi('water_works', 'water works', 'vodný zdroj, čistička'),
    poi('wayside_shrine', 'wayside shrine', 'božia muka'),
    poi('cross', 'cross', 'kríž'),
    poi('firepit', 'firepit', 'ohnisko'),
    poi('toilets', 'toilets', 'toalety'),
    poi('bench', 'bench', 'lavička'),
    poi('beehive', 'beehive', 'včelý úľ'),
    poi('lift_gate', 'lift gate', 'závora'),
    poi('post_box', 'post box', 'poštová schránka'),
    poi('telephone', 'telephone', 'telefón'),
    poi('gate', 'gate', 'brána'),
    poi('waste_disposal', 'waste disposal', 'kontajner na odpad'),

    landcover('forest', 'forest', 'les'),
    landcover('meadow', 'meadow, park, village green, grassland', 'lúka, park, mestská zeleň, trávnata plocha'),
    landcover('quarry', 'quarry', 'lom'),
    landcover('farmland', 'farmland', 'pole'),
    landcover('cemetery', 'cemetery', 'cintorín'),
    landcover('scrub', 'scrub', 'kroviny'),
    landcover('scree', 'scree', 'štrk'),
    landcover('landfill', 'landfill', 'skládka'),
    landcover('clearcut', 'clearcut', 'holorub'),
    {
      categoryId: 'landuse',
      name: {
        en: 'solar power plant',
        sk: 'slnečná elektráreň',
      },
      layers: [asArea(['solar_power_plants'], {})],
      ...props
    },
    {
      categoryId: 'landuse',
      name: {
        en: 'water area',
        sk: 'vodná plocha',
      },
      layers: [asArea(['water_area'], {})],
      ...props
    },
    landcover('playground', 'pitch, playground', 'ihrisko'),
    landcover('feat:bunker_silo', 'bunker silo', 'silo'),
    landcover('orchard', 'orchard', 'ovocný sad'),
    landcover('vineyard', 'vineyard', 'vinica'),
    landcover('farmyard', 'farmyard', 'družstvo'),
    landcover('residential', 'residential zone', 'obytná zóna'),
    landcover('commercial', 'commercial zone', 'komerčná zóna'),
    landcover('industrial', 'industrial zone', 'industriálna zóna'),
    landcover('parking', 'parking', 'parkovisko'),
    landcover('heath', 'heath', 'step'),
    landcover('bare_rock', 'bare rock', 'holá skala'),
  ],
};

module.exports = { legend };
