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
  h_none: 0,
  h_red_loc: 0,
  h_blue_loc: 0,
  h_green_loc: 0,
  h_yellow_loc: 0,
  h_black_loc: 0,
  h_white_loc: 0,
  h_orange_loc: 0,
  h_purple_loc: 0,
  h_none_loc: 0,
  b_red: 0,
  b_blue: 0,
  b_green: 0,
  b_yellow: 0,
  b_black: 0,
  b_white: 0,
  b_orange: 0,
  b_purple: 0,
  b_none: 0,
  s_red: 0,
  s_blue: 0,
  s_green: 0,
  s_yellow: 0,
  s_black: 0,
  s_white: 0,
  s_orange: 0,
  s_purple: 0,
  s_none: 0,
  r_red: 0,
  r_blue: 0,
  r_green: 0,
  r_yellow: 0,
  r_black: 0,
  r_white: 0,
  r_orange: 0,
  r_purple: 0,
  r_none: 0,
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

const roadDefaults = {
  class: 'highway',
  service: '',
  bridge: '',
  tunnel: '',
  tracktype: '',
  oneway: 0,
  trail_visibility: 1,
};

function road(type, en, sk, noForest = false, trailVisibility = 0) {
  return {
    categoryId: 'communications',
    name: {
      en,
      sk,
    },
    layers: [
      noForest ? null : forest,
      asLine(['higwayGlows', 'highways', 'highway_names'], {
        ...roadDefaults, type, trail_visibility: 0.666 ** trailVisibility,
      }),
    ].filter(Boolean),
    ...props,
  };
}

function poi(categoryId, type, en, sk, eithEle, additional = {}) {
  return {
    categoryId,
    name: {
      en,
      sk,
    },
    layers: [
      forest,
      asPoint(['features', 'feature_names'], {
        name: 'Abc',
        type,
        ele: eithEle ? 320 : '',
        ...additional
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


const track1 = asLine(['higwayGlows', 'highways'], {
  ...roadDefaults,
  type: 'track',
  tracktype: 'grade1',
});

const track3 = asLine(['higwayGlows', 'highways'], {
  ...roadDefaults,
  type: 'track',
  tracktype: 'grade3',
});

const track3rev = asLine(['higwayGlows', 'highways'], {
  ...roadDefaults,
  type: 'track',
  tracktype: 'grade3',
}, true);

const legend = {
  categories: [
    {
      id: 'communications',
      name: {
        en: 'Roads',
        sk: 'Cesty',
        it: 'Strade',
      },
    },
    {
      id: 'railway',
      name: {
        en: 'Railways',
        sk: 'Železnice',
        it: 'Ferrovie',
      },
    },
    {
      id: 'landcover',
      name: {
        en: 'Land use',
        sk: 'Plochy',
        it: 'Uso del suolo',
      },
    },
    {
      id: 'borders',
      name: {
        en: 'Borders, areas',
        sk: 'Hranice, oblasti',
        it: 'Confini, aree',
      },
    },
    {
      id: 'accomodation',
      name: {
        en: 'Accomodation and shelters',
        sk: 'Ubytovanie a prístrešky',
        it: 'Alloggi e rifugi',
      },
    },
    {
      id: 'natural_poi',
      name: {
        en: 'Natural Points of Interest',
        sk: 'Prírodné body záujmu',
        it: 'Punti di interesse naturale',
      },
    },
    {
      id: 'gastro_poi',
      name: {
        en: 'Gastronomy',
        sk: 'Gastronómia',
        it: 'Gastronomia',
      },
    },
    {
      id: 'water',
      name: {
        en: 'Water',
        sk: 'Voda',
        it: 'Acqua',
      },
    },
    {
      id: 'poi',
      name: {
        en: 'Other Points of Interest',
        sk: 'Ostatné body záujmu',
        it: 'Altri punti di interesse',
      },
    },
    {
      id: 'terrain',
      name: {
        en: 'Terrain',
        sk: 'Terén',
        it: 'Terreno',
      },
    },
    {
      id: 'other',
      name: {
        en: 'Other',
        sk: 'Ostatné',
        it: 'Altri',
      },
    },
  ],
  items: [
    {
      categoryId: 'terrain',
      name: {
        en: 'gully',
        sk: 'roklina',
        it: 'Canalone',
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
        it: 'Rupe',
      },
      layers: [
        forest,
        asLine(['feature_lines_maskable'], {
          type: 'cliff'
        }),
      ],
      ...props,
    },
    {
      categoryId: 'terrain',
      name: {
        en: 'earth bank',
        sk: 'ochranná hrádza',
        it: 'Terrapieno',
      },
      layers: [
        forest,
        asLine(['feature_lines_maskable'], {
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
        it: 'Argine',
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
        it: 'Diga',
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
        it: 'Area disboscata',
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
        it: 'Filare di alberi',
      },
      layers: [
        asLine(['feature_lines'], {
          type: 'tree_row'
        }, false, 16),
      ],
      ...propsForZoom(16),
    },
    {
      categoryId: 'communications',
      name: {
        en: 'international, national or regional hiking trail',
        sk: 'medzinárodná, národná alebo regionálna turistická trasa',
        it: 'Percorsi escursionistici internazionali, nazionali o regionali',
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
      categoryId: 'communications',
      name: {
        en: 'local hiking trail',
        sk: 'miestna turistická trasa',
        it: 'Percorso escursionistico locale',
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
      categoryId: 'communications',
      name: {
        en: 'bicycle trail',
        sk: 'cyklotrasa',
        it: 'percorso ciclistico',
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
      categoryId: 'communications',
      name: {
        en: 'x-country ski trail',
        sk: 'lyžiarska (bežkárska) trasa',
        it: 'percorso sci-alpinismo',
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
      categoryId: 'communications',
      name: {
        en: 'horse trail',
        sk: 'jazdecká trasa',
        it: 'percorso a cavallo',
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

    road('motorway', 'highway, motorway', 'diaľnica a cesta pre motorové vozidlá', 'autostrada'),
    road('primary', 'primary road', 'cesta 1. triedy', 'primaria'),
    road('secondary', 'secondary road', 'cesta 2. triedy', 'secondaria'),
    road('tertiary', 'tertiary road', 'cesta 3. triedy', 'terziaria'),
    road('residential', 'street, unclassified road or road of unknown kind', 'ulica, neklasifikovaná cesta alebo cesta neznámeho druhu', 'residenziale'),
    ...['', 1, 2, 3, 4, 5].map((grade) => ({
      categoryId: 'communications',
      name: {
        en: 'track ' + (grade ? `(grade ${grade})` : '(unknown grade)') + (grade === 1 ? ', service road' : ''),
        sk: `lesná alebo poľná cesta (${grade ? `kvalita ${grade}` : 'neznáma kvalita'})${grade === 1 ? ', servisná/prístupová cesta' : ''}`,
        it: 'traccia ' + (grade ? `(grade ${grade})` : '(grade sconosciuto)') + (grade === 1 ? ', strada di servizio' : ''),
      },
      layers: [
        forest,
        asLine(['higwayGlows', 'highways', 'highway_names'], {
          ...roadDefaults,
          type: 'track',
          name: 'Abc',
          tracktype: grade ? `grade${grade}` : '',
        }),
      ],
      ...props,
    })),
    road('bridleway', 'bridleway', 'chodník pre kone', 'mulattiera'),
    road('cycleway', 'cycleway', 'cyklochodník', 'pista ciclabile'),
    road('path', 'sidewalk, path, platform, pedestrian', 'chodník, cestička, nástupište, pešia zóna', 'sentiero'),
    road('steps', 'steps', 'schody', 'scale'),
    road('construction', 'road in construction', 'komunikácia vo výstavbe', 'in costruzione'),
    road('raceway', 'raceway', 'pretekárska dráha', 'pista'),
    road('piste', 'piste', 'bežkárska dráha/zjazdovka', 'pista'),
    road('via_ferrata', 'via ferrata', 'ferrata', 'via ferrata'),
    {
      categoryId: 'communications',
      name: {
        en: 'bridge',
        sk: 'most',
        it: 'ponte',
      },
      layers: [
        forest,
        asLine(['higwayGlows', 'highways', 'highway_names'], {
          ...roadDefaults,
          type: 'secondary',
          name: 'Abc',
          bridge: 1,
        }),
      ],
      ...props,
    },
    {
      categoryId: 'communications',
      name: {
        en: 'tunnel',
        sk: 'tunel',
        it: 'tunnel',
      },
      layers: [
        forest,
        asLine(['higwayGlows', 'highways', 'highway_names'], {
          ...roadDefaults,
          type: 'secondary',
          name: 'Abc',
          tunnel: 1,
        }),
      ],
      ...props,
    },
    {
      categoryId: 'communications',
      name: {
        en: 'access denied for pedestrians',
        sk: 'zákaz vstupu pre chodcov',
        it: 'accesso vietato ai pedoni',
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
      categoryId: 'communications',
      name: {
        en: 'access denied cyclists',
        sk: 'zákaz vjazdu pre cyklistov',
        it: 'accesso vietato ai ciclisti',
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
      categoryId: 'communications',
      name: {
        en: 'access denied for pedestrians or cyclists',
        sk: 'zákaz vstupu pre chodcov a cyklistov',
        it: 'accesso vietato a pedoni e ciclisti',
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
      categoryId: 'communications',
      name: {
        en: 'oneway',
        sk: 'jednosmerka',
        it: 'senso unico',
      },
      layers: [
        forest,
        asLine(['higwayGlows', 'highways'], {
          type: 'service',
          class: 'highway',
          bridge: '',
          tunnel: '',
          tracktype: '',
          oneway: 1
        }),
      ],
      ...props,
    },
    road('path', 'excellent or unspecified trail visibility', 'viditeľnosť trasy je výborná alebo neurčená', 'visibilitò eccellente o non specificata', false, 0),
    road('path', 'good trail visibility', 'viditeľnosť trasy je dobrá', 'buona visibilità della traccia', false, 1),
    road('path', 'trail is mostly visible', 'trasa je väčšinou viditeľná', 'traccia prevalentemente visibile', false, 2),
    road('path', 'trail is sometimes visible and sometimes not', 'trasa je striedavo viditeľná', 'traccia talvolta non visibile', false, 3),
    road('path', 'trail is mostly not visible', 'trasa nie je väčšinou viditeľná', 'traccia prevalentemente non visibile', false, 4),
    road('path', 'trail is not visible at all', 'trasa nie je vôbec viditeľná', 'traccia non visibile', false, 5),
    {
      categoryId: 'railway',
      name: {
        en: 'main railway',
        sk: 'hlavná železničná trať',
        it: 'ferrovia principale',
      },
      layers: [
        forest,
        asLine(['higwayGlows', 'highways'], {
          ...roadDefaults,
          name: 'Abc',
          type: 'rail',
          class: 'railway',
        }),
      ],
      ...props,
    },
    {
      categoryId: 'railway',
      name: {
        en: 'service or light railway, tram railway',
        sk: 'servisná alebo vedľajšia železničná trať, električková trať',
        it: 'ferrovia di servizio, linea tram',
      },
      layers: [
        forest,
        asLine(['higwayGlows', 'highways'], {
          ...roadDefaults,
          name: 'Abc',
          type: 'rail',
          class: 'railway',
          service: 'service',
        }),
      ],
      ...props,
    },
    {
      categoryId: 'railway',
      name: {
        en: 'miniature, monorail, funicular, narrow_gauge or subway railway',
        sk: 'miniatúrna koľaj, jednokoľajka, úzkokoľajka, pozemná lanová dráha alebo metro',
        it: 'ferrovia in miniatura, monorotaia, funicolare, a scartamento ridotto o metropolitana',
      },
      layers: [
        forest,
        asLine(['higwayGlows', 'highways'], {
          ...roadDefaults,
          name: 'Abc',
          type: 'miniature',
          class: 'railway',
        }),
      ],
      ...props,
    },
    {
      categoryId: 'railway',
      name: {
        en: 'railway in construction',
        sk: 'železničná trať vo výstavbe',
        it: 'ferrovia in costruzione',
      },
      layers: [
        forest,
        asLine(['higwayGlows', 'highways'], {
          ...roadDefaults,
          name: 'Abc',
          type: 'construction',
          class: 'railway',
        }),
      ],
      ...props,
    },
    {
      categoryId: 'railway',
      name: {
        en: 'railway bridge',
        sk: 'železničný most',
        it: 'ponte della ferrovia',
      },
      layers: [
        forest,
        asLine(['higwayGlows', 'highways'], {
          ...roadDefaults,
          name: 'Abc',
          type: 'rail',
          class: 'railway',
          bridge: 1,
        }),
      ],
      ...props,
    },
    {
      categoryId: 'railway',
      name: {
        en: 'railway tunnel',
        sk: 'železničný tunel',
        it: 'tunnel ferroviario',
      },
      layers: [
        forest,
        asLine(['higwayGlows', 'highways'], {
          ...roadDefaults,
          name: 'Abc',
          type: 'rail',
          class: 'railway',
          tunnel: 1,
        }),
      ],
      ...props,
    },
    poi('accomodation', 'hotel', 'hotel', 'hotel', 'hotel'),
    poi('accomodation', 'motel', 'motel', 'motel', 'motel'),
    poi('accomodation', 'guest_house', 'guest house', 'penzión', 'pensione'),
    poi('accomodation', 'apartment', 'apartment', 'apartmán','appartamento'),
    poi('accomodation', 'hostel', 'hostel', 'ubytovňa', 'ostello'),
    poi('accomodation', 'chalet', 'chalet', 'chata', 'chalet'),
    poi('accomodation', 'alpine_hut', 'alpine hut', 'horská chata', 'rifugio alpino'),
    poi('accomodation', 'wilderness_hut', 'wilderness hut', 'chata v divočine', 'bivacco'),
    poi('accomodation', 'building', 'building', 'budova', 'edificio'),
    poi('accomodation', 'camp_site', 'camp site', 'kemp', 'campeggio'),
    poi('accomodation', 'hunting_stand', 'hunting stand', 'poľovnícky posed', 'capanno di caccia'),
    poi('accomodation', 'basic_hut', 'basic hut', 'jednoduchá chatka', 'capanno'),
    poi('accomodation', 'shelter', 'shelter', 'prístrešok', 'riparo'),
    poi('accomodation', 'picnic_shelter', 'picnic shelter', 'piknikový prístrešok', 'tavolo da picnic'),
    poi('accomodation', 'weather_shelter', 'weather shelter', 'prístrešok pre nepriaznivé počasie', 'riparo'),
    poi('accomodation', 'lean_to', 'lean-to shelter', 'prístrešok na bivak', 'tettoia'),
    poi('accomodation', 'public_transport', 'public transport shelter', 'prístrešok hromadnej dopravy', 'riparo trasporti pubblici'),

    poi('poi', 'guidepost', 'guidepost', 'smerovník', 'guida', true),
    poi('poi', 'board', 'board', 'tabuľa', 'pannello informativo'),
    poi('poi', 'map', 'map', 'mapa', 'mappa'),

    poi('natural_poi', 'peak', 'peak', 'vrchol', 'cima', true),
    poi('natural_poi', 'saddle', 'saddle', 'sedlo', 'sella'),
    poi('natural_poi', 'cave_entrance', 'cave', 'jaskyňa', 'ingresso grotta'),
    poi('natural_poi', 'arch', 'rock arch', 'skalné okno','arco di roccia'),
    poi('natural_poi', 'rock', 'rock', 'skala', 'roccia'),
    poi('natural_poi', 'stone', 'stone', 'balvan', 'pietra'),
    poi('natural_poi', 'sinkhole', 'sinkhole', 'závrt', 'dolina'),
    {
      categoryId: 'natural_poi',
      name: {
        en: 'tree',
        sk: 'strom',
        it: 'albero',
      },
      layers: [
        asPoint(['trees'], {
          name: 'Abc',
          type: 'tree',
        }, 0),
      ],
      ...props,
    },
    poi('natural_poi', 'tree', 'protected tree', 'chránený strom', 'albero protetto'),
    poi('poi', 'viewpoint', 'viewpoint', 'výhľad', 'punto panoramico'),


    poi('water', 'drinking_water', 'drinking water', 'pitná voda', 'acqua'),
    poi('water', 'water_well', 'water well', 'studňa', 'pozzo'),
    poi('water', 'spring', 'spring', 'prameň', 'sorgente', true),
    poi('water', 'refitted_spring', 'refitted spring', 'upravený prameň', 'sorgente modificata', true),
    poi('water', 'drinking_spring', 'drinkable spring', 'prameň pitnej vody', 'sorgente potabile', true),
    poi('water', 'not_drinking_spring', 'not drinkable spring', 'prameň úžitkovej vody', 'sorgente non potabile', true),
    poi('water', 'hot_spring', 'hot spring', 'termálny prameň', 'sorgente calda', true),
    poi('water', 'watering_place', 'watering place', 'napájadlo','abbeveratoio'),
    poi('water', 'waterfall', 'waterfall', 'vodopád', 'cascata'),
    poi('water', 'dam', 'dam', 'vodopád', 'diga'),
    poi('water', 'weir', 'weir', 'hrádza','stramazzo'),
    poi('water', 'water_works', 'water works, covered water reservoir, water treatment plant', 'vodný zdroj, krytá vodná nádrž, čistička', 'opera idrica/trattamento acque'),
    poi('water', 'fountain', 'fountain', 'fontána', 'fontanella'),

    poi('poi', 'castle', 'castle', 'hrad','castello'),
    poi('poi', 'ruins', 'ruins', 'ruiny','rovine'),

    poi('poi', 'monument', 'monument', 'pomník'),
    poi('poi', 'memorial', 'memorial', 'pamätník'),
    poi('poi', 'artwork', 'artwork', 'umelecké dielo'),

    poi('poi', 'townhall', 'townhall', 'radnica, obecný úrad'),
    poi('poi', 'fire_station', 'fire station', 'hasičská stanica'),
    poi('poi', 'police', 'police', 'polícia'),
    poi('poi', 'community_centre', 'community centre', 'dom kultúru, komunitné centrum'),
    poi('poi', 'office', 'office', 'informačné centrum'),
    poi('poi', 'hospital', 'hospital', 'nemocnica'),
    poi('poi', 'pharmacy', 'pharmacy', 'lekáreň'),
    poi('poi', 'bicycle', 'bicycle shop', 'cykloobchod'),

    poi('poi', 'church', 'church, chapel, cathedral, temple, basilica', 'kostol, cerkev, kaplnka, katedrála, chrám, bazilika'),
    poi('poi', 'wayside_shrine', 'wayside shrine', 'božia muka'),
    poi('poi', 'cross', 'cross', 'kríž'),

    poi('poi', 'cinema', 'cinema', 'kino'),
    poi('poi', 'theatre', 'theatre', 'divadlo'),
    poi('poi', 'museum', 'museum', 'múzeum'),
    poi('poi', 'archaeological_site', 'archaeological site', 'archeologické nálezisko'),

    poi('gastro_poi', 'pub', 'pub', 'hostinec, krčma'),
    poi('gastro_poi', 'cafe', 'cafe', 'kaviareň'),
    poi('gastro_poi', 'bar', 'bar', 'bar'),
    poi('gastro_poi', 'restaurant', 'restaurant', 'reštaurácia'),
    poi('gastro_poi', 'convenience', 'convenience store', 'potraviny'),
    poi('gastro_poi', 'supermarket', 'supermarket', 'supermarket'),
    poi('gastro_poi', 'fast_food', 'fast food', 'rýchle občerstvenie'),
    poi('gastro_poi', 'confectionery', 'confectionery', 'cukráreň'), // also pastry

    poi('poi', 'bunker', 'bunker', 'bunker'),
    poi('poi', 'boundary_stone', 'boundary stone', 'hraničný kameň'),

    poi('poi', 'post_office', 'post office', 'pošta'),
    poi('poi', 'post_box', 'post box', 'poštová schránka'),
    poi('poi', 'telephone', 'telephone', 'telefón'),

    poi('railway', 'station', 'train station, halt', 'vlaková stanica, zastávka'),
    poi('poi', 'bus_station', 'bus station', 'autobusová zastávka'),
    poi('poi', 'bus_stop', 'bus stop', 'autobusová zastávka'),
    poi('poi', 'taxi', 'taxi', 'taxi'),
    poi('poi', 'fuel', 'fuel station', 'čerpacia stanica'),

    poi('poi', 'tower_observation', 'observation tower', 'vyhliadková veža'),
    poi('poi', 'tower_communication', 'communication tower', 'komunikačná veža'),
    poi('poi', 'tower_bell_tower', 'bell tower', 'zvonica'),
    poi('poi', 'tower_other', 'tower', 'veža'),
    poi('poi', 'water_tower', 'water tower', 'vodná veža'),
    poi('poi', 'chimney', 'chimney', 'komín'),
    poi('poi', 'mast_other', 'mast', 'stožiar'),

    poi('poi', 'picnic_table', 'picnic table', 'stôl na piknik'),
    poi('poi', 'picnic_site', 'picnic site', 'miesto na piknik'),

    poi('poi', 'feeding_place', 'feeding place', 'krmidlo'),
    poi('poi', 'beehive', 'beehive', 'včelí úľ'),

    poi('poi', 'horse_riding', 'horse riding', 'jazda na koni'),
    poi('poi', 'sauna', 'sauna', 'sauna'),
    poi('poi', 'free_flying', 'paragliding', 'paraglajding'),
    poi('poi', 'golf_course', 'golf course', 'golfový kurt'),
    poi('poi', 'miniature_golf', 'miniature golf', 'minigolf'),
    poi('poi', 'soccer', 'socces', 'futbal'),
    poi('poi', 'tennis', 'tennis', 'tenis'),
    poi('poi', 'basketball', 'basketball', 'basketbal'),

    poi('poi', 'forester\'s_lodge', 'forester\'s lodge', 'horáreň'),
    poi('poi', 'mine', 'mine, adit, mineshaft', 'baňa, štôlňa, šachta'),
    poi('poi', 'disused_mine', 'disused mine, adit or mineshaft', 'zatvorená baňa, štôlňa alebo šachta'),
    poi('poi', 'attraction', 'attraction', 'atrakcia'),

    poi('poi', 'firepit', 'firepit', 'ohnisko'),
    poi('poi', 'toilets', 'toilets', 'toalety'),
    poi('poi', 'bench', 'bench', 'lavička'),

    poi('poi', 'lift_gate', 'lift gate', 'závora'),
    poi('poi', 'gate', 'gate', 'brána'),
    poi('poi', 'ford', 'ford', 'brod'),
    poi('poi', 'waste_disposal', 'waste disposal', 'kontajner na odpad'),
    {
      categoryId: 'water',
      name: {
        en: 'water area',
        sk: 'vodná plocha',
      },
      layers: [asArea(['water_area', 'water_area_names'], { name: 'Abc' })],
      ...props
    },
    {
      categoryId: 'water',
      name: {
        en: 'itermittend or seasonal water area',
        sk: 'občasná alebo sezónna vodná plocha',
      },
      layers: [asArea(['water_area', 'water_area_names'], { name: 'Abc', tmp: 1 })],
      ...props
    },
    landcover('forest', 'forest', 'les'),
    landcover('meadow', 'meadow, park, village green, grassland', 'lúka, park, mestská zeleň, trávnatá plocha'),
    landcover('heath', 'heath', 'step'),
    landcover('scrub', 'scrub', 'kroviny'),
    landcover('clearcut', 'clearcut', 'holorub'),
    landcover('scree', 'scree', 'štrk'),
    landcover('bare_rock', 'bare rock', 'holá skala'),
    landcover('wetland', 'wetland', 'mokraď'),
    landcover('bog', 'bog', 'rašelinisko'),
    landcover('marsh', 'marsh, fen, wet meadow', 'močiar, slatinisko, mokrá lúka'),
    landcover('swamp', 'swamp', 'bahnisko'),
    landcover('reedbed', 'reedbed', 'rákosie'),
    landcover('mangrove', 'mangrove', 'mangrovy'),
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
    landcover('playground', 'pitch, playground, golf course, track', 'ihrisko, detské ihrisko, golfové ihrisko, pretekárska dráha'),
    landcover('parking', 'parking', 'parkovisko'),
    landcover('bunker_silo', 'bunker silo', 'silo'),
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
      categoryId: 'water',
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
      categoryId: 'water',
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
      categoryId: 'water',
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
      categoryId: 'water',
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
      ...road('water_slide', 'water slide', 'tobogán', true),
      categoryId: 'other',
    },
    {
      categoryId: 'other',
      name: {
        en: 'pipeline',
        sk: 'potrubie',
      },
      layers: [asLine(['pipelines'], {
        location: 'overground',
      })],
      ...props,
    },
    {
      categoryId: 'other',
      name: {
        en: 'underground pipeline',
        sk: 'podzemné potrubie',
      },
      layers: [asLine(['pipelines'], {
        location: 'underground',
      })],
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
    poi('other', 'picnic_shelter', 'private POI', 'súkromný bod záujmu', undefined, { access: 'no' }),
  ],
};

module.exports = { legend };
//     .layer('placenames', { type: 'csv', inline: `
// id|name|type|wkt
// 1|Test 123|town|Point(21.219835 48.655111)
// ` }, { srs: '+init=epsg:4326', bufferSize: 1024 })
