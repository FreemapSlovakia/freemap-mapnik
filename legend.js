function propsForZoom(zoom) {
  const factor = Math.pow(2, 18 - zoom);

  return {
    zoom,
    bbox: [-0.00018 * factor, -0.00008 * factor, 0.00018 * factor, 0.00008 * factor],
  };
}

const props = propsForZoom(18);

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
function asLine(styles, properties, reverse, forZoom = 18) {
  const factor = Math.pow(2, 18 - forZoom);

  return {
    styles,
    geojson: {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [reverse ? 0.00018 : -0.00018, reverse ? 0.00004 : -0.00004].map(x => x * factor),
          [ reverse? -0.00018 : 0.00018, reverse ? -0.00004 : 0.00004].map(x => x * factor),
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
function asArea(styles, properties, forZoom = 18) {
  const factor = Math.pow(2, 18 - forZoom);

  return {
    styles,
    geojson: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [factor * -0.00015, factor * -0.00007],
            [factor * -0.00017, factor * 0.00006],
            [factor * 0.00015, factor * 0.00007],
            [factor * 0.00017, factor * -0.00006],
            [factor * -0.00015, factor * -0.00007],
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

function accomodation(type, en, sk, eithEle) {
  return {
    ...poi(type, en, sk, eithEle),
    categoryId: 'accomodation',
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


const track1 = asLine(['higwayGlows', 'highways'], {
  type: 'track',
  tracktype: 'grade1',
  class: 'highway',
  bridge: '',
  tunnel: '',
});

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
        en: 'Roads',
        sk: 'Cesty',
      },
    },
    {
      id: 'railway',
      name: {
        en: 'Railways',
        sk: 'Železnice',
      },
    },
    {
      id: 'accessRestrictions',
      name: {
        en: 'Access restrictions',
        sk: 'Obmedzenia vstupu / vjazdu',
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
      id: 'borders',
      name: {
        en: 'Borders, areas',
        sk: 'Hranice, oblasti',
      },
    },
    {
      id: 'accomodation',
      name: {
        en: 'Acocmodation',
        sk: 'Ubytovanie',
      },
    },
    {
      id: 'poi',
      name: {
        en: 'Points of Interest',
        sk: 'Body záujmu',
      },
    },
    {
      id: 'waterways',
      name: {
        en: 'Watercourses',
        sk: 'Vodné toky',
      },
    },
    {
      id: 'terrain',
      name: {
        en: 'Terrain',
        sk: 'Terén',
      },
    },
    {
      id: 'other',
      name: {
        en: 'Other',
        sk: 'Ostatné',
      },
    },
  ],
  items: [
    {
      categoryId: 'terrain',
      name: {
        en: 'gully',
        sk: 'roklina',
      },
      layers: [
        forest,
        asLine(['feature_lines'], {
          type: 'gully'
        }),
      ],
      ...props,
    },
    {
      categoryId: 'terrain',
      name: {
        en: 'cliff',
        sk: 'bralo',
      },
      layers: [
        forest,
        asLine(['feature_lines'], {
          type: 'cliff'
        }),
      ],
      ...props,
    },
    {
      categoryId: 'terrain',
      name: {
        en: 'earth bank',
        sk: 'strmý svah',
      },
      layers: [
        forest,
        asLine(['feature_lines'], {
          type: 'earth_bank'
        }),
      ],
      ...props,
    },
    {
      categoryId: 'terrain',
      name: {
        en: 'embankment',
        sk: 'nábrežie, násyp, hrádza',
      },
      layers: [
        forest,
        asLine(['feature_lines'], {
          type: 'embankment'
        }),
      ],
      ...props,
    },
    {
      categoryId: 'terrain',
      name: {
        en: 'dyke',
        sk: 'násyp, hrádza',
      },
      layers: [
        forest,
        asLine(['feature_lines'], {
          type: 'dyke'
        }),
      ],
      ...props,
    },
    {
      categoryId: 'terrain',
      name: {
        en: 'cutline',
        sk: 'prierez',
      },
      layers: [
        forest,
        asLine(['cutlines'], {
          type: 'cutline'
        }),
      ],
      ...props,
    },
    {
      categoryId: 'terrain',
      name: {
        en: 'tree row',
        sk: 'stromoradie',
      },
      layers: [
        asLine(['feature_lines'], {
          type: 'tree_row'
        }, false, 16),
      ],
      ...propsForZoom(16),
    },
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
        sk: 'miestná turistická trasa',
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
    road('construction', 'road in construction', 'komunikácia vo výstavbe'),
    road('raceway', 'raceway', 'pretekárska dráha'),
    road('piste', 'piste', 'bežkárska dráha'),
    road('via_ferrata', 'via ferrata', 'ferrata'),
    {
      categoryId: 'communications',
      name: {
        en: 'bridge',
        sk: 'most',
      },
      layers: [
        forest,
        asLine(['higwayGlows', 'highways', 'highway_names'], {
          type: 'secondary',
          name: 'Abc',
          class: 'highway',
          bridge: 1,
          tunnel: '',
          tracktype: '',
        }),
      ],
      ...props,
    },
    {
      categoryId: 'communications',
      name: {
        en: 'tunnel',
        sk: 'tunel',
      },
      layers: [
        forest,
        asLine(['higwayGlows', 'highways', 'highway_names'], {
          type: 'secondary',
          name: 'Abc',
          class: 'highway',
          bridge: '',
          tunnel: 1,
          tracktype: '',
        }),
      ],
      ...props,
    },
    {
      categoryId: 'accessRestrictions',
      name: {
        en: 'access denied for pedestrians',
        sk: 'zákaz vstupu (pešo)',
      },
      layers: [
        forest,
        track1,
        asLine(['accessRestrictions'], {
          no_bicycle: 0,
          no_foot: 1
        }),
      ],
      ...props,
    },
    {
      categoryId: 'accessRestrictions',
      name: {
        en: 'access denied cyclists',
        sk: 'zákaz vjazdu pre bicykle',
      },
      layers: [
        forest,
        track1,
        asLine(['accessRestrictions'], {
          no_bicycle: 1,
          no_foot: 0
        }),
      ],
      ...props,
    },
    {
      categoryId: 'accessRestrictions',
      name: {
        en: 'access denied for pedestrians or cyclists',
        sk: 'zákaz vstupu (pešo) a zákaz vjazdu pre bicykle',
      },
      layers: [
        forest,
        track1,
        asLine(['accessRestrictions'], {
          no_bicycle: 1,
          no_foot: 1
        }),
      ],
      ...props,
    },
    {
      categoryId: 'railway',
      name: {
        en: 'main railway',
        sk: 'hlavná železničná trať',
      },
      layers: [
        forest,
        asLine(['higwayGlows', 'highways'], {
          name: 'Abc',
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
    {
      categoryId: 'railway',
      name: {
        en: 'service or light railway, tram railway',
        sk: 'servisná alebo ľahká železničná trať, električková trať',
      },
      layers: [
        forest,
        asLine(['higwayGlows', 'highways'], {
          name: 'Abc',
          type: 'rail',
          class: 'railway',
          service: 'service',
          bridge: '',
          tunnel: '',
          tracktype: '',
        }),
      ],
      ...props,
    },
    {
      categoryId: 'railway',
      name: {
        en: 'miniature, monorail, funicular, narrow_gauge or subway railway',
        sk: 'miniatúrna koľaj, jednokoľajka, úzkokoľajka, pozemná lanová dráha alebo metro',
      },
      layers: [
        forest,
        asLine(['higwayGlows', 'highways'], {
          name: 'Abc',
          type: 'miniature',
          class: 'railway',
          service: '',
          bridge: '',
          tunnel: '',
          tracktype: '',
        }),
      ],
      ...props,
    },
    {
      categoryId: 'railway',
      name: {
        en: 'railway in construction',
        sk: 'železničná trať vo výstavbe',
      },
      layers: [
        forest,
        asLine(['higwayGlows', 'highways'], {
          name: 'Abc',
          type: 'construction',
          class: 'railway',
          service: '',
          bridge: '',
          tunnel: '',
          tracktype: '',
        }),
      ],
      ...props,
    },
    {
      categoryId: 'railway',
      name: {
        en: 'railway bridge',
        sk: 'železničný most',
      },
      layers: [
        forest,
        asLine(['higwayGlows', 'highways'], {
          name: 'Abc',
          type: 'rail',
          class: 'railway',
          service: '',
          bridge: 1,
          tunnel: '',
          tracktype: '',
        }),
      ],
      ...props,
    },
    {
      categoryId: 'railway',
      name: {
        en: 'railway tunnel',
        sk: 'železničný tunel',
      },
      layers: [
        forest,
        asLine(['higwayGlows', 'highways'], {
          name: 'Abc',
          type: 'rail',
          class: 'railway',
          service: '',
          bridge: 0,
          tunnel: 1,
          tracktype: '',
        }),
      ],
      ...props,
    },
    accomodation('hotel', 'hotel', 'hotel'),
    accomodation('motel', 'motel', 'motel'),
    accomodation('guest_house', 'guest_house', 'penzión'),
    accomodation('hostel', 'hostel', 'ubytovňa'),
    accomodation('chalet', 'chalet', 'chata'),
    accomodation('alpine_hut', 'alpine hut', 'horská chata'),
    accomodation('wilderness_hut', 'wilderness hut', 'chata v divočine'),
    accomodation('hut', 'hut, cabin', 'búda, chatka'),
    accomodation('camp_site', 'camp site', 'kemp'),

    poi('guidepost', 'guidepost', 'smerovník', true),
    poi('board', 'board', 'tabuľa'),
    poi('map', 'map', 'mapa'),

    poi('peak', 'peak', 'vrchol', true),
    poi('saddle', 'saddle', 'sedlo'),
    poi('cave_entrance', 'cave', 'jaskyňa'),
    poi('arch', 'rock arch', 'skalné okno'),
    poi('rock', 'rock', 'skala'),
    {
      categoryId: 'poi',
      name: {
        en: 'tree',
        sk: 'strom',
      },
      layers: [
        asPoint(['trees'], {
          name: 'Abc',
          type: 'tree',
        }, 0),
      ],
      ...props,
    },
    poi('viewpoint', 'viewpoint', 'výhľad'),
    poi('spring', 'spring', 'prameň', true),
    poi('water_well', 'water well', 'studňa'),
    poi('waterfall', 'waterfall', 'vodopád'),

    poi('hunting_stand', 'hunting stand', 'poľovnícky posed'),
    poi('shelter', 'shelter', 'prístrešok'),

    poi('castle', 'castle', 'hrad'),
    poi('ruins', 'ruins', 'ruiny'),

    poi('monument', 'monument', 'pamätník'),
    poi('memorial', 'memorial', 'pamätník'),
    poi('artwork', 'artwork', 'umelecké dielo'),
    poi('fountain', 'fountain', 'fontána'),

    poi('townhall', 'townhall', 'radnica, obecný úrad'),
    poi('fire_station', 'fire station', 'hasičská stanica'),
    poi('police', 'police', 'polícia'),
    poi('community_centre', 'community centre', 'dom kultúru, komunitné centrum'),
    poi('office', 'office', 'informačné centrum'),
    poi('hospital', 'hospital', 'nemocnica'),
    poi('pharmacy', 'pharmacy', 'lekáreň'),

    poi('church', 'church, chapel, cathedral, temple, basilica', 'kostol, cerkva, kaplnka, katedrála, chrám, bazilika'),
    poi('wayside_shrine', 'wayside shrine', 'božia muka'),
    poi('cross', 'cross', 'kríž'),

    poi('cinema', 'cinema', 'kino'),
    poi('theatre', 'theatre', 'divadlo'),
    poi('museum', 'museum', 'múzeum'),
    poi('archaeological_site', 'archaeological site', 'archeologické nálezisko'),

    poi('pub', 'pub', 'hostinec, krčma'),
    poi('cafe', 'cafe', 'kaviareň'),
    poi('restaurant', 'restaurant', 'reštaurácia'),
    poi('convenience', 'convenience store', 'potraviny'),
    poi('supermarket', 'supermarket', 'supermarket'),
    poi('fast_food', 'fast food', 'rýchle občerstvenie'),
    poi('confectionery', 'confectionery', 'cukráreň'),

    poi('bunker', 'bunker', 'bunker'),
    poi('boundary_stone', 'boundary stone', 'hraničný kameň'),
    poi('post_office', 'post office', 'pošta'),
    poi('post_box', 'post box', 'poštová schránka'),
    poi('telephone', 'telephone', 'telefón'),

    poi('station', 'train station, halt', 'vlaková zastávka'),
    poi('bus_station', 'bus station', 'autobusová zastávka'),
    poi('bus_stop', 'bus stop', 'autobusová zastávka'),
    poi('taxi', 'taxi', 'taxi'),
    poi('fuel', 'fuel station', 'čerpacia stanica'),

    poi('tower_observation', 'observation tower', 'vyhliadková veža'),
    poi('tower_communication', 'communication tower', 'komunikačná veža'),
    poi('tower_other', 'tower', 'veža'),
    poi('water_tower', 'water tower', 'vodná veža'),
    poi('chimney', 'chimney', 'komín'),
    poi('mast_other', 'mast', 'stožiar'),

    poi('picnic_table', 'picnic table', 'stôl na piknik'),
    poi('picnic_site', 'picnic site', 'miesto na piknik'),

    poi('feeding_place', 'feeding place', 'krmidlo'),
    poi('watering_place', 'watering place', 'napájadlo'),
    poi('beehive', 'beehive', 'včelý úľ'),

    poi('water_works', 'water works', 'vodný zdroj, čistička'),
    poi('mine', 'mine, adit, mineshaft', 'baňa, štôlňa, šachta'),
    poi('attraction', 'attraction', 'atrakcia'),

    poi('firepit', 'firepit', 'ohnisko'),
    poi('toilets', 'toilets', 'toalety'),
    poi('bench', 'bench', 'lavička'),

    poi('lift_gate', 'lift gate', 'závora'),
    poi('gate', 'gate', 'brána'),
    poi('waste_disposal', 'waste disposal', 'kontajner na odpad'),
    {
      categoryId: 'landcover',
      name: {
        en: 'water area',
        sk: 'vodná plocha',
      },
      layers: [asArea(['water_area', 'water_area_names'], { name: 'Abc' })],
      ...props
    },
    landcover('forest', 'forest', 'les'),
    landcover('meadow', 'meadow, park, village green, grassland', 'lúka, park, mestská zeleň, trávnata plocha'),
    landcover('heath', 'heath', 'step'),
    landcover('scrub', 'scrub', 'kroviny'),
    landcover('clearcut', 'clearcut', 'holorub'),
    landcover('scree', 'scree', 'štrk'),
    landcover('bare_rock', 'bare rock', 'holá skala'),
    landcover('farmland', 'farmland', 'pole'),
    landcover('farmyard', 'farmyard', 'družstvo'),
    landcover('orchard', 'orchard', 'ovocný sad'),
    landcover('vineyard', 'vineyard', 'vinica'),
    landcover('garden', 'garden', 'záhrada'),
    landcover('plant_nursery', 'plant nursery', 'lesná škôlka'),
    landcover('beach', 'beach', 'pláž'),
    landcover('residential', 'residential zone', 'obytná zóna'),
    landcover('commercial', 'commercial zone', 'komerčná zóna'),
    landcover('industrial', 'industrial zone, wastewater plant', 'industriálna zóna, ČOV'),
    landcover('quarry', 'quarry', 'lom'),
    landcover('cemetery', 'cemetery', 'cintorín'),
    landcover('playground', 'pitch, playground, golf course', 'ihrisko, detské ihrisko, golfové ihrisko'),
    landcover('parking', 'parking', 'parkovisko'),
    landcover('feat:bunker_silo', 'bunker silo', 'silo'),
    landcover('landfill', 'landfill', 'skládka'),
    {
      categoryId: 'landcover',
      name: {
        en: 'solar power plant',
        sk: 'slnečná elektráreň',
      },
      layers: [asArea(['solar_power_plants'], {})],
      ...props
    },

    {
      categoryId: 'borders',
      name: {
        en: 'national park',
        sk: 'národný park',
      },
      layers: [asArea(['protected_areas'], {
        type: 'national_park',
      }, 10)],
      ...propsForZoom(10),
    },
    {
      categoryId: 'borders',
      name: {
        en: 'protected area, nature reserve',
        sk: 'chránená oblasť, prírodná rezervácia',
      },
      layers: [asArea(['protected_areas'], {
        type: 'protected_area',
      })],
      ...props,
    },
    {
      categoryId: 'borders',
      name: {
        en: 'military zone',
        sk: 'vojenská zóna',
      },
      layers: [asArea(['military_areas'], {
        type: 'military',
      }, 10)],
      ...propsForZoom(10),
    },
    {
      categoryId: 'borders',
      name: {
        en: 'state border',
        sk: 'štátna hranica',
      },
      layers: [asArea(['borders'], {})],
      ...props,
    },
    {
      categoryId: 'waterways',
      name: {
        en: 'river',
        sk: 'rieka',
      },
      layers: [asLine(['water_line', 'water_line_names'], {
        type: 'river',
        tunnel: 0,
        dasharray: '1000,0',
        name: 'Abc',
      })],
      ...props,
    },
    {
      categoryId: 'waterways',
      name: {
        en: 'stream',
        sk: 'potok',
      },
      layers: [asLine(['water_line', 'water_line_names'], {
        type: 'stream',
        tunnel: 0,
        dasharray: '1000,0',
        name: 'Abc',
      })],
      ...props,
    },
    {
      categoryId: 'waterways',
      name: {
        en: 'stream in culvert',
        sk: 'potok v priepuste',
      },
      layers: [asLine(['water_line', 'water_line_names'], {
        type: 'stream',
        tunnel: 1,
        dasharray: '1000,0',
        name: 'Abc',
      })],
      ...props,
    },
    {
      categoryId: 'waterways',
      name: {
        en: 'itermittend or seasonal stream',
        sk: 'občasný alebo sezónny potok',
      },
      layers: [asLine(['water_line', 'water_line_names'], {
        type: 'stream',
        tunnel: 0,
        dasharray: '6,3',
        name: 'Abc',
      })],
      ...props,
    },
    {
      categoryId: 'other',
      name: {
        en: 'aerialway',
        sk: 'lanovka, vlek',
      },
      layers: [
        asLine(['aerialways', 'aerialway_names'], {
          type: '',
          name: 'Abc',
        }),
      ],
      ...props,
    },
    {
      categoryId: 'other',
      name: {
        en: 'aeroway',
        sk: 'letisková dráha',
      },
      layers: [
        asLine(['aeroways'], {
          type: '',
          name: 'Abc',
        }),
      ],
      ...props,
    },
    {
      categoryId: 'other',
      name: {
        en: 'power line with power tower',
        sk: 'vedenie vysokého napätia so stožiarom',
      },
      layers: [
        asLine(['feature_lines'], {
          type: 'line',
        }),
        asPoint(['features'], {
          type: 'tower',
        }),
      ],
      ...props,
    },
    {
      categoryId: 'other',
      name: {
        en: 'minor power line with power pole',
        sk: 'elektrické vedenie so stĺpom',
      },
      layers: [
        asLine(['feature_lines'], {
          type: 'minor_line',
        }),
        asPoint(['features'], {
          type: 'pole',
        }),
      ],
      ...props,
    },
    {
      categoryId: 'other',
      name: {
        en: 'fence, wall',
        sk: 'plot, múr',
      },
      layers: [asLine(['barrierways'], {
        type: 'fence',
      })],
      ...props,
    },
    {
      categoryId: 'other',
      name: {
        en: 'locality name',
        sk: 'názov lokality',
      },
      layers: [
        forest,
        asPoint(['locality_names'], {
          type: 'locality',
          name: 'Abc'
        }),
      ],
      ...props,
    },
    {
      categoryId: 'other',
      name: {
        en: 'unfinished mapping, map feature for fixing',
        sk: 'nedomapovaný prvok, prvok na opravenie',
      },
      layers: [
        asPoint(['fixmes'], {}),
      ],
      ...props,
    },
    {
      ...road('water_slide', 'water slide', 'tobogán'),
      categoryId: 'other',
    }
  ],
};

module.exports = { legend };
//     .layer('placenames', { type: 'csv', inline: `
// id|name|type|wkt
// 1|Test 123|town|Point(21.219835 48.655111)
// ` }, { srs: '+init=epsg:4326', bufferSize: 1024 })
