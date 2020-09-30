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

// console.log(mapping);

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

const forest = asArea(['landcover'], { type: 'forest' });

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
      id: 'landuse',
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

    {
      categoryId: 'communications',
      name: {
        en: 'highway, motorway',
        sk: 'diaľnica a cesta pre motorové vozidlá',
      },
      layers: [
        forest,
        asLine(['higwayGlows', 'highways'], {
          type: 'motorway',
          class: 'highway',
          bridge: '',
          tunnel: '',
          tracktype: '',
        }),
      ],
      ...props,
    },
    {
      categoryId: 'communications',
      name: {
        en: 'primary road',
        sk: 'cesta 1. triedy',
      },
      layers: [
        forest,
        asLine(['higwayGlows', 'highways'], {
          type: 'primary',
          class: 'highway',
          bridge: '',
          tunnel: '',
          tracktype: '',
        }),
      ],
      ...props,
    },
    {
      categoryId: 'communications',
      name: {
        en: 'secondary road',
        sk: 'cesta 2. triedy',
      },
      layers: [
        forest,
        asLine(['higwayGlows', 'highways'], {
          type: 'secondary',
          class: 'highway',
          bridge: '',
          tunnel: '',
          tracktype: '',
        }),
      ],
      ...props,
    },
    {
      categoryId: 'communications',
      name: {
        en: 'tertiary road',
        sk: 'cesta 3. triedy',
      },
      layers: [
        forest,
        asLine(['higwayGlows', 'highways'], {
          type: 'tertiary',
          class: 'highway',
          bridge: '',
          tunnel: '',
          tracktype: '',
        }),
      ],
      ...props,
    },
    {
      categoryId: 'communications',
      name: {
        en: 'street, unclassified road or road of unknown kind',
        sk: 'ulica, neklasifikovaná cesta alebo cesta neznámeho druhu',
      },
      layers: [
        forest,
        asLine(['higwayGlows', 'highways'], {
          type: 'residential', // same as: living_street, unclassified, road
          class: 'highway',
          bridge: '',
          tunnel: '',
          tracktype: '',
        }),
      ],
      ...props,
    },
    ...['', 1, 2, 3, 4, 5].map((grade) => ({
      categoryId: 'communications',
      name: {
        en: 'track ' + (grade ? `(grade ${grade})` : '(unknown grade)') + (grade === 1 ? ', service road' : ''),
        sk: `lesná alebo poľná cesta (${grade ? `kvalita ${grade}` : 'neznáma kvalita'})${grade === 1 ? ', servisná/prístupová cesta' : ''}`,
      },
      layers: [
        forest,
        asLine(['higwayGlows', 'highways'], {
          type: 'track',
          class: 'highway',
          bridge: '',
          tunnel: '',
          tracktype: grade ? `grade${grade}` : '',
        }),
      ],
      ...props,
    })),
    // {
    //   categoryId: 'communications',
    //   name: {
    //     en: 'bridleway',
    //     sk: 'chodník pre kone',
    //   },
    //   layers: [
    //     forest,
    //     asLine(['higwayGlows', 'highways'], {
    //       type: 'bridleway',
    //       class: 'highway',
    //       bridge: '',
    //       tunnel: '',
    //       tracktype: '',
    //     }),
    //   ],
    // ...props,
    // },
    {
      categoryId: 'communications',
      name: {
        en: 'cycleway',
        sk: 'cyklochodník',
      },
      layers: [
        forest,
        asLine(['higwayGlows', 'highways'], {
          type: 'cycleway',
          class: 'highway',
          bridge: '',
          tunnel: '',
          tracktype: '',
        }),
      ],
      ...props,
    },
    {
      categoryId: 'communications',
      name: {
        en: 'sidewalk, path, steps, platform, pedestrian',
        sk: 'chodník, cestička, schody, nástupište, pešia zóna',
      },
      layers: [
        forest,
        asLine(['higwayGlows', 'highways'], {
          type: 'path', // same as: footway, steps, platform, pedestrian
          class: 'highway',
          bridge: '',
          tunnel: '',
          tracktype: '',
        }),
      ],
      ...props,
    },
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

    {
      categoryId: 'poi',
      name: {
        en: 'spring',
        sk: 'prameň',
      },
      layers: [
        forest,
        asPoint(['features', 'feature_names'], {
          type: 'spring',
          name: 'Frndžalica',
        }, -0.000035),
      ],
      ...props,
    },
    {
      categoryId: 'poi',
      name: {
        en: 'guidepost',
        sk: 'smerovník',
      },
      layers: [
        forest,
        asPoint(['features', 'feature_names'], {
          type: 'guidepost',
          name: 'Kvietkovo',
          ele: '528'
        }, -0.00005),
      ],
      ...props,
    },
    {
      categoryId: 'poi',
      name: {
        en: 'peak',
        sk: 'vrchol',
      },
      layers: [
        forest,
        asPoint(['features', 'feature_names'], {
          type: 'peak',
          name: 'Hora',
          ele: '365'
        }, -0.00005),
      ],
      ...props,
    },

    {
      categoryId: 'poi',
      name: {
        en: 'castle',
        sk: 'hrad',
      },
      layers: [
        forest,
        asPoint(['features', 'feature_names'], {
          type: 'castle',
          name: 'Foo',
        }, -0.00003),
      ],
      ...props,
    },
    {
      categoryId: 'poi',
      name: {
        en: 'ruins',
        sk: 'ruiny',
      },
      layers: [
        forest,
        asPoint(['features', 'feature_names'], {
          type: 'ruins',
          name: 'Foo',
        }, -0.00003),
      ],
      ...props,
    },
    {
      categoryId: 'poi',
      name: {
        en: 'cave entrance',
        sk: 'vchod do jaskyne',
      },
      layers: [
        forest,
        asPoint(['features', 'feature_names'], {
          type: 'cave_entrance',
          name: 'Foo',
        }, -0.00003),
      ],
      ...props,
    },
    {
      categoryId: 'poi',
      name: {
        en: 'waterfall',
        sk: 'vodopád',
      },
      layers: [
        forest,
        asPoint(['features', 'feature_names'], {
          type: 'waterfall',
          name: 'Foo',
        }, -0.00003),
      ],
      ...props,
    },
	{
      categoryId: 'poi',
      name: {
        en: 'monument',
        sk: 'pamätník',
      },
      layers: [
        meadow,
        asPoint(['features', 'feature_names'], {
          name: 'SNP',
          type: 'monument',
        }, -0.000035),
      ],
      ...props,
    },

    {
      categoryId: 'landuse',
      name: {
        en: 'forest',
        sk: 'les',
      },
      layers: [asArea(['landcover'], { type: 'forest' })],
      ...props
    },
    {
      categoryId: 'landuse',
      name: {
        en: 'meadow, park, village green, grassland',
        sk: 'lúka, park, mestská zeleň, trávnata plocha',
      },
      layers: [asArea(['landcover'], { type: 'meadow' })],
      ...props
    },
    {
      categoryId: 'landuse',
      name: {
        en: 'quarry',
        sk: 'lom',
      },
      layers: [asArea(['landcover'], { type: 'quarry' })],
      ...props
    },
    {
      categoryId: 'landuse',
      name: {
        en: 'farmland',
        sk: 'pole',
      },
      layers: [asArea(['landcover'], { type: 'farmland' })],
      ...props
    },
    {
      categoryId: 'landuse',
      name: {
        en: 'cemetery',
        sk: 'cintorín',
      },
      layers: [asArea(['landcover'], { type: 'cemetery' })],
      ...props
    },
    {
      categoryId: 'landuse',
      name: {
        en: 'scrub',
        sk: 'kroviny',
      },
      layers: [asArea(['landcover'], { type: 'scrub' })],
      ...props
    },
    {
      categoryId: 'landuse',
      name: {
        en: 'scree',
        sk: 'štrk',
      },
      layers: [asArea(['landcover'], { type: 'scree' })],
      ...props
    },
    {
      categoryId: 'landuse',
      name: {
        en: 'landfill',
        sk: 'skládka',
      },
      layers: [asArea(['landcover'], { type: 'landfill' })],
      ...props
    },
    {
      categoryId: 'landuse',
      name: {
        en: 'clearcut',
        sk: 'holorub',
      },
      layers: [asArea(['landcover'], { type: 'clearcut' })],
      ...props
    },
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
    {
      categoryId: 'landuse',
      name: {
        en: 'pitch, playground',
        sk: 'ihrisko',
      },
      layers: [asArea(['landcover'], {type: 'playground'})],
      ...props
    },
    {
      categoryId: 'landuse',
      name: {
        en: 'bunker silo',
        sk: 'silo',
      },
      layers: [asArea(['landcover'], {type: 'feat:bunker_silo'})],
      ...props
    },
    {
      categoryId: 'landuse',
      name: {
        en: 'orchard',
        sk: 'ovocný sad',
      },
      layers: [asArea(['landcover'], {type: 'orchard'})],
      ...props
    },
    {
      categoryId: 'landuse',
      name: {
        en: 'vineyard',
        sk: 'vinica',
      },
      layers: [asArea(['landcover'], {type: 'vineyard'})],
      ...props
    },
    {
      categoryId: 'landuse',
      name: {
        en: 'allotments',
        sk: 'záhradkarska oblasť',
      },
      layers: [asArea(['landcover'], {type: 'allotments'})],
      ...props
    },
    {
      categoryId: 'landuse',
      name: {
        en: 'farmyard',
        sk: 'družstvo',
      },
      layers: [asArea(['landcover'], {type: 'farmyard'})],
      ...props
    },
    {
      categoryId: 'landuse',
      name: {
        en: 'residential zone',
        sk: 'obytná zóna',
      },
      layers: [asArea(['landcover'], {type: 'residential'})],
      ...props
    },
    {
      categoryId: 'landuse',
      name: {
        en: 'commercial zone',
        sk: 'komerčná zóna',
      },
      layers: [asArea(['landcover'], {type: 'commercial'})],
      ...props
    },
    {
      categoryId: 'landuse',
      name: {
        en: 'industrial zone',
        sk: 'industriálna zóna',
      },
      layers: [asArea(['landcover'], {type: 'industrial'})],
      ...props
    },
    {
      categoryId: 'landuse',
      name: {
        en: 'parking',
        sk: 'parkovanie',
      },
      layers: [asArea(['landcover'], {type: 'parking'})],
      ...props
    },
    {
      categoryId: 'landuse',
      name: {
        en: 'heath',
        sk: 'step',
      },
      layers: [asArea(['landcover'], {type: 'heath'})],
      ...props
    },
    {
      categoryId: 'landuse',
      name: {
        en: 'bare rock',
        sk: 'holá skala',
      },
      layers: [asArea(['landcover'], {type: 'bare_rock'})],
      ...props
    },
  ],
};

module.exports = { legend };
