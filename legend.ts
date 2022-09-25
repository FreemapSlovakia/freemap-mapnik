function propsForZoom(zoom: number) {
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
  refs1: "",
  refs2: "",
  off1: 0,
  off2l: 0,
};

/**
 *
 * @param {string[]} styles
 * @param {Record<string, unknown>} properties
 */
function asLine(styles: string[], properties: Record<string, unknown>, reverse?: boolean, forZoom = 18) {
  const factor = Math.pow(2, 18 - forZoom);

  return {
    styles,
    geojson: {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [reverse ? 0.00018 : -0.00018, reverse ? 0.00004 : -0.00004].map((x) => x * factor),
          [reverse ? -0.00018 : 0.00018, reverse ? -0.00004 : 0.00004].map((x) => x * factor),
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
function asPoint(styles: string[], properties: Record<string, unknown>, yOffset = 0) {
  return {
    styles,
    geojson: {
      type: "Feature",
      geometry: { type: "Point", coordinates: [0, yOffset] },
      properties,
    },
  };
}

/**
 *
 * @param {string[]} styles
 * @param {Record<string, unknown>} properties
 */
function asArea(styles: string[], properties: Record<string, unknown>, forZoom = 18) {
  const factor = Math.pow(2, 18 - forZoom);

  return {
    styles,
    geojson: {
      type: "Feature",
      geometry: {
        type: "Polygon",
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

const forest = asArea(["landcover"], { type: "forest" });

const roadDefaults = {
  class: "highway",
  service: "",
  bridge: "",
  tunnel: "",
  tracktype: "",
  oneway: 0,
  trail_visibility: 1,
};

function road(type: string, en: string, sk: string, it: string, noForest = false, trailVisibility = 0) {
  return {
    categoryId: "communications",
    name: {
      en,
      sk,
      it,
    },
    layers: [
      noForest ? null : forest,
      asLine(["higwayGlows", "highways", "highway_names"], {
        ...roadDefaults,
        type,
        trail_visibility: 0.666 ** trailVisibility,
      }),
    ].filter(Boolean),
    ...props,
  };
}

function poi(
  categoryId: string,
  type: string,
  en: string,
  sk: string,
  it: string,
  eithEle?: boolean,
  additional: Record<string, unknown> = {}
) {
  return {
    categoryId,
    name: {
      en,
      sk,
      it,
    },
    layers: [
      forest,
      asPoint(
        ["features", "feature_names"],
        {
          name: "Abc",
          type,
          ele: eithEle ? 320 : "",
          ...additional,
        },
        eithEle ? -0.00005 : -0.00003
      ),
    ],
    ...props,
  };
}

function landcover(type: string, en: string, sk: string, it: string) {
  return {
    categoryId: "landcover",
    name: {
      en,
      sk,
      it,
    },
    layers: [asArea(["landcover"], { type })],
    ...props,
  };
}

const track1 = asLine(["higwayGlows", "highways"], {
  ...roadDefaults,
  type: "track",
  tracktype: "grade1",
});

const track3 = asLine(["higwayGlows", "highways"], {
  ...roadDefaults,
  type: "track",
  tracktype: "grade3",
});

const track3rev = asLine(
  ["higwayGlows", "highways"],
  {
    ...roadDefaults,
    type: "track",
    tracktype: "grade3",
  },
  true
);

export const legend = {
  categories: [
    {
      id: "communications",
      name: {
        en: "Roads",
        sk: "Cesty",
        it: "Strade",
      },
    },
    {
      id: "railway",
      name: {
        en: "Railways",
        sk: "Železnice",
        it: "Ferrovie",
      },
    },
    {
      id: "landcover",
      name: {
        en: "Land use",
        sk: "Plochy",
        it: "Uso del suolo",
      },
    },
    {
      id: "borders",
      name: {
        en: "Borders, areas",
        sk: "Hranice, oblasti",
        it: "Confini, aree",
      },
    },
    {
      id: "accomodation",
      name: {
        en: "Accomodation and shelters",
        sk: "Ubytovanie a prístrešky",
        it: "Alloggi e rifugi",
      },
    },
    {
      id: "natural_poi",
      name: {
        en: "Natural Points of Interest",
        sk: "Prírodné body záujmu",
        it: "Punti di interesse naturale",
      },
    },
    {
      id: "gastro_poi",
      name: {
        en: "Gastronomy",
        sk: "Gastronómia",
        it: "Gastronomia",
      },
    },
    {
      id: "water",
      name: {
        en: "Water",
        sk: "Voda",
        it: "Acqua",
      },
    },
    {
      id: "poi",
      name: {
        en: "Other Points of Interest",
        sk: "Ostatné body záujmu",
        it: "Altri punti di interesse",
      },
    },
    {
      id: "terrain",
      name: {
        en: "Terrain",
        sk: "Terén",
        it: "Terreno",
      },
    },
    {
      id: "other",
      name: {
        en: "Other",
        sk: "Ostatné",
        it: "Altri",
      },
    },
  ],
  items: [
    {
      categoryId: "terrain",
      name: {
        en: "gully",
        sk: "roklina",
        it: "Canalone",
      },
      layers: [
        forest,
        asLine(["feature_lines_maskable"], {
          type: "gully",
        }),
      ],
      ...props,
    },
    {
      categoryId: "terrain",
      name: {
        en: "cliff",
        sk: "bralo",
        it: "Rupe",
      },
      layers: [
        forest,
        asLine(["feature_lines_maskable"], {
          type: "cliff",
        }),
      ],
      ...props,
    },
    {
      categoryId: "terrain",
      name: {
        en: "earth bank",
        sk: "ochranná hrádza",
        it: "Terrapieno",
      },
      layers: [
        forest,
        asLine(["feature_lines_maskable"], {
          type: "earth_bank",
        }),
      ],
      ...props,
    },
    {
      categoryId: "terrain",
      name: {
        en: "embankment",
        sk: "nábrežie, násyp, hrádza",
        it: "Argine",
      },
      layers: [
        forest,
        asLine(["feature_lines_maskable"], {
          type: "embankment",
        }),
      ],
      ...props,
    },
    {
      categoryId: "terrain",
      name: {
        en: "dyke",
        sk: "násyp, hrádza",
        it: "Diga",
      },
      layers: [
        forest,
        asLine(["feature_lines_maskable"], {
          type: "dyke",
        }),
      ],
      ...props,
    },
    {
      categoryId: "terrain",
      name: {
        en: "cutline",
        sk: "prierez",
        it: "Area disboscata",
      },
      layers: [
        forest,
        asLine(["cutlines"], {
          type: "cutline",
        }),
      ],
      ...props,
    },
    {
      categoryId: "terrain",
      name: {
        en: "tree row",
        sk: "stromoradie",
        it: "Filare di alberi",
      },
      layers: [
        asLine(
          ["feature_lines"],
          {
            type: "tree_row",
          },
          false,
          16
        ),
      ],
      ...propsForZoom(16),
    },
    {
      categoryId: "communications",
      name: {
        en: "international, national or regional hiking trail",
        sk: "medzinárodná, národná alebo regionálna turistická trasa",
        it: "Percorsi escursionistici internazionali, nazionali o regionali",
      },
      layers: [
        forest,
        track3rev,
        asLine(
          ["routes", "route_names"],
          {
            ...routeDefaults,
            h_blue: 1,
            off1: 1,
            refs1: "2817",
          },
          true
        ),
      ],
      ...props,
    },
    {
      categoryId: "communications",
      name: {
        en: "local hiking trail",
        sk: "miestna turistická trasa",
        it: "Percorso escursionistico locale",
      },
      layers: [
        forest,
        track3rev,
        asLine(
          ["routes", "route_names"],
          {
            ...routeDefaults,
            h_blue_loc: 1,
            off1: 1,
            refs1: "1A",
          },
          true
        ),
      ],
      ...props,
    },
    {
      categoryId: "communications",
      name: {
        en: "bicycle trail",
        sk: "cyklotrasa",
        it: "percorso ciclistico",
      },
      layers: [
        forest,
        track3,
        asLine(["routes", "route_names"], {
          ...routeDefaults,
          b_blue: 1,
          off1: 1,
          refs2: "028",
        }),
      ],
      ...props,
    },
    {
      categoryId: "communications",
      name: {
        en: "x-country ski trail",
        sk: "lyžiarska (bežkárska) trasa",
        it: "percorso sci-alpinismo",
      },
      layers: [
        forest,
        track3,
        asLine(["routes", "route_names"], {
          ...routeDefaults,
          s_blue: 1,
          off1: 1,
          refs2: "X2",
        }),
      ],
      ...props,
    },
    {
      categoryId: "communications",
      name: {
        en: "horse trail",
        sk: "jazdecká trasa",
        it: "percorso a cavallo",
      },
      layers: [
        forest,
        track3rev,
        asLine(
          ["routes", "route_names"],
          {
            ...routeDefaults,
            r_blue: 1,
            off1: 1,
            refs1: "Neigh",
          },
          true
        ),
      ],
      ...props,
    },

    road("motorway", "highway, motorway", "diaľnica a cesta pre motorové vozidlá", "autostrada"),
    road("primary", "primary road", "cesta 1. triedy", "primaria"),
    road("secondary", "secondary road", "cesta 2. triedy", "secondaria"),
    road("tertiary", "tertiary road", "cesta 3. triedy", "terziaria"),
    road(
      "residential",
      "street, unclassified road or road of unknown kind",
      "ulica, neklasifikovaná cesta alebo cesta neznámeho druhu",
      "residenziale"
    ),
    ...["", 1, 2, 3, 4, 5].map((grade) => ({
      categoryId: "communications",
      name: {
        en: "track " + (grade ? `(grade ${grade})` : "(unknown grade)") + (grade === 1 ? ", service road" : ""),
        sk: `lesná alebo poľná cesta (${grade ? `kvalita ${grade}` : "neznáma kvalita"})${
          grade === 1 ? ", servisná/prístupová cesta" : ""
        }`,
        it:
          "traccia " +
          (grade ? `(grade ${grade})` : "(grade sconosciuto)") +
          (grade === 1 ? ", strada di servizio" : ""),
      },
      layers: [
        forest,
        asLine(["higwayGlows", "highways", "highway_names"], {
          ...roadDefaults,
          type: "track",
          name: "Abc",
          tracktype: grade ? `grade${grade}` : "",
        }),
      ],
      ...props,
    })),
    road("bridleway", "bridleway", "chodník pre kone", "mulattiera"),
    road("cycleway", "cycleway", "cyklochodník", "pista ciclabile"),
    road("footway", "sidewalk, platform, pedestrian", "chodník, nástupište, pešia zóna", "sentiero"),
    road("path", "path", "cestička", "sentiero"),
    {
      categoryId: "communications",
      name: {
        en: "path for pedestrians and bicycles",
        sk: "komunikácia pre peších aj cyklistov",
        it: "path for pedestrians and bicycles", // TODO translate
      },
      layers: [
        forest,
        asLine(["higwayGlows", "highways", "highway_names"], {
          ...roadDefaults,
          type: "path",
          foot: "designated",
          bicycle: "designated",
        }),
      ].filter(Boolean),
      ...props,
    },
    road("steps", "steps", "schody", "scale"),
    road("construction", "road in construction", "komunikácia vo výstavbe", "in costruzione"),
    road("raceway", "raceway", "pretekárska dráha", "pista"),
    road("piste", "piste", "bežkárska dráha/zjazdovka", "pista"),
    road("via_ferrata", "via ferrata", "ferrata", "via ferrata"),
    {
      categoryId: "communications",
      name: {
        en: "bridge",
        sk: "most",
        it: "ponte",
      },
      layers: [
        forest,
        asLine(["higwayGlows", "highways", "highway_names"], {
          ...roadDefaults,
          type: "secondary",
          name: "Abc",
          bridge: 1,
        }),
      ],
      ...props,
    },
    {
      categoryId: "communications",
      name: {
        en: "tunnel",
        sk: "tunel",
        it: "tunnel",
      },
      layers: [
        forest,
        asLine(["higwayGlows", "highways", "highway_names"], {
          ...roadDefaults,
          type: "secondary",
          name: "Abc",
          tunnel: 1,
        }),
      ],
      ...props,
    },
    {
      categoryId: "communications",
      name: {
        en: "access denied for pedestrians",
        sk: "zákaz vstupu pre chodcov",
        it: "accesso vietato ai pedoni",
      },
      layers: [
        forest,
        track1,
        asLine(["accessRestrictions"], {
          no_bicycle: 0,
          no_foot: 1,
        }),
      ],
      ...props,
    },
    {
      categoryId: "communications",
      name: {
        en: "access denied cyclists",
        sk: "zákaz vjazdu pre cyklistov",
        it: "accesso vietato ai ciclisti",
      },
      layers: [
        forest,
        track1,
        asLine(["accessRestrictions"], {
          no_bicycle: 1,
          no_foot: 0,
        }),
      ],
      ...props,
    },
    {
      categoryId: "communications",
      name: {
        en: "access denied for pedestrians or cyclists",
        sk: "zákaz vstupu pre chodcov a cyklistov",
        it: "accesso vietato a pedoni e ciclisti",
      },
      layers: [
        forest,
        track1,
        asLine(["accessRestrictions"], {
          no_bicycle: 1,
          no_foot: 1,
        }),
      ],
      ...props,
    },
    {
      categoryId: "communications",
      name: {
        en: "oneway",
        sk: "jednosmerka",
        it: "senso unico",
      },
      layers: [
        forest,
        asLine(["higwayGlows", "highways"], {
          type: "service",
          class: "highway",
          bridge: "",
          tunnel: "",
          tracktype: "",
          oneway: 1,
        }),
      ],
      ...props,
    },
    road(
      "path",
      "excellent or unspecified trail visibility",
      "viditeľnosť trasy je výborná alebo neurčená",
      "visibilitò eccellente o non specificata",
      false,
      0
    ),
    road("path", "good trail visibility", "viditeľnosť trasy je dobrá", "buona visibilità della traccia", false, 1),
    road(
      "path",
      "trail is mostly visible",
      "trasa je väčšinou viditeľná",
      "traccia prevalentemente visibile",
      false,
      2
    ),
    road(
      "path",
      "trail is sometimes visible and sometimes not",
      "trasa je striedavo viditeľná",
      "traccia talvolta non visibile",
      false,
      3
    ),
    road(
      "path",
      "trail is mostly not visible",
      "trasa nie je väčšinou viditeľná",
      "traccia prevalentemente non visibile",
      false,
      4
    ),
    road("path", "trail is not visible at all", "trasa nie je vôbec viditeľná", "traccia non visibile", false, 5),
    {
      categoryId: "railway",
      name: {
        en: "main railway",
        sk: "hlavná železničná trať",
        it: "ferrovia principale",
      },
      layers: [
        forest,
        asLine(["higwayGlows", "highways"], {
          ...roadDefaults,
          name: "Abc",
          type: "rail",
          class: "railway",
        }),
      ],
      ...props,
    },
    {
      categoryId: "railway",
      name: {
        en: "service or light railway, tram railway",
        sk: "servisná alebo vedľajšia železničná trať, električková trať",
        it: "ferrovia di servizio, linea tram",
      },
      layers: [
        forest,
        asLine(["higwayGlows", "highways"], {
          ...roadDefaults,
          name: "Abc",
          type: "rail",
          class: "railway",
          service: "service",
        }),
      ],
      ...props,
    },
    {
      categoryId: "railway",
      name: {
        en: "miniature, monorail, funicular, narrow_gauge or subway railway",
        sk: "miniatúrna koľaj, jednokoľajka, úzkokoľajka, pozemná lanová dráha alebo metro",
        it: "ferrovia in miniatura, monorotaia, funicolare, a scartamento ridotto o metropolitana",
      },
      layers: [
        forest,
        asLine(["higwayGlows", "highways"], {
          ...roadDefaults,
          name: "Abc",
          type: "miniature",
          class: "railway",
        }),
      ],
      ...props,
    },
    {
      categoryId: "railway",
      name: {
        en: "railway in construction",
        sk: "železničná trať vo výstavbe",
        it: "ferrovia in costruzione",
      },
      layers: [
        forest,
        asLine(["higwayGlows", "highways"], {
          ...roadDefaults,
          name: "Abc",
          type: "construction",
          class: "railway",
        }),
      ],
      ...props,
    },
    {
      categoryId: "railway",
      name: {
        en: "railway bridge",
        sk: "železničný most",
        it: "ponte della ferrovia",
      },
      layers: [
        forest,
        asLine(["higwayGlows", "highways"], {
          ...roadDefaults,
          name: "Abc",
          type: "rail",
          class: "railway",
          bridge: 1,
        }),
      ],
      ...props,
    },
    {
      categoryId: "railway",
      name: {
        en: "railway tunnel",
        sk: "železničný tunel",
        it: "tunnel ferroviario",
      },
      layers: [
        forest,
        asLine(["higwayGlows", "highways"], {
          ...roadDefaults,
          name: "Abc",
          type: "rail",
          class: "railway",
          tunnel: 1,
        }),
      ],
      ...props,
    },
    poi("accomodation", "hotel", "hotel", "hotel", "hotel"),
    poi("accomodation", "motel", "motel", "motel", "motel"),
    poi("accomodation", "guest_house", "guest house", "penzión", "pensione"),
    poi("accomodation", "apartment", "apartment", "apartmán", "appartamento"),
    poi("accomodation", "hostel", "hostel", "ubytovňa", "ostello"),
    poi("accomodation", "chalet", "chalet", "chata", "chalet"),
    poi("accomodation", "alpine_hut", "alpine hut", "horská chata", "rifugio alpino"),
    poi("accomodation", "wilderness_hut", "wilderness hut", "chata v divočine", "bivacco"),
    poi("accomodation", "building", "building", "budova", "edificio"),
    poi("accomodation", "camp_site", "camp site", "kemp", "campeggio"),
    poi("accomodation", "hunting_stand", "hunting stand", "poľovnícky posed", "capanno di caccia"),
    poi("accomodation", "basic_hut", "basic hut", "jednoduchá chatka", "capanno"),
    poi("accomodation", "shelter", "shelter", "prístrešok", "riparo"),
    poi("accomodation", "picnic_shelter", "picnic shelter", "piknikový prístrešok", "gazebo"),
    poi("accomodation", "weather_shelter", "weather shelter", "prístrešok pre nepriaznivé počasie", "riparo"),
    poi("accomodation", "lean_to", "lean-to shelter", "prístrešok na bivak", "tettoia"),
    poi(
      "accomodation",
      "public_transport",
      "public transport shelter",
      "prístrešok hromadnej dopravy",
      "riparo trasporti pubblici"
    ),

    poi("poi", "guidepost", "guidepost", "smerovník", "guida", true),
    poi("poi", "board", "board", "tabuľa", "pannello informativo"),
    poi("poi", "map", "map", "mapa", "mappa"),

    poi("natural_poi", "peak", "peak", "vrchol", "cima", true),
    poi("natural_poi", "saddle", "saddle", "sedlo", "sella"),
    poi("natural_poi", "cave_entrance", "cave", "jaskyňa", "ingresso grotta"),
    poi("natural_poi", "arch", "rock arch", "skalné okno", "arco di roccia"),
    poi("natural_poi", "rock", "rock", "skala", "roccia"),
    poi("natural_poi", "stone", "stone", "balvan", "pietra"),
    poi("natural_poi", "sinkhole", "sinkhole", "závrt", "dolina"),
    {
      categoryId: "natural_poi",
      name: {
        en: "tree",
        sk: "strom",
        it: "albero",
      },
      layers: [
        asPoint(
          ["trees"],
          {
            name: "Abc",
            type: "tree",
          },
          0
        ),
      ],
      ...props,
    },
    poi("natural_poi", "tree_protected", "protected tree", "chránený strom", "albero protetto"),
    poi(
      "natural_poi",
      "tree",
      "monumental tree",
      "monumentálny strom",
      "monumental tree" // TODO translate
    ),
    poi("poi", "viewpoint", "viewpoint", "výhľad", "punto panoramico"),

    poi("water", "drinking_water", "drinking water", "pitná voda", "acqua"),
    poi("water", "water_well", "water well", "studňa", "pozzo"),
    poi("water", "spring", "spring", "prameň", "sorgente", true),
    poi("water", "refitted_spring", "refitted spring", "upravený prameň", "sorgente modificata", true),
    poi("water", "drinking_spring", "drinkable spring", "prameň pitnej vody", "sorgente potabile", true),
    poi("water", "not_drinking_spring", "not drinkable spring", "prameň úžitkovej vody", "sorgente non potabile", true),
    poi("water", "hot_spring", "hot spring", "termálny prameň", "sorgente calda", true),
    poi("water", "watering_place", "watering place", "napájadlo", "abbeveratoio"),
    poi("water", "waterfall", "waterfall", "vodopád", "cascata"),
    poi("water", "dam", "dam", "vodopád", "diga"),
    poi("water", "weir", "weir", "hrádza", "stramazzo"),
    poi(
      "water",
      "water_works",
      "water works, covered water reservoir, water treatment plant",
      "vodný zdroj, krytá vodná nádrž, čistička",
      "opera idrica/trattamento acque"
    ),
    poi("water", "fountain", "fountain", "fontána", "fontanella"),

    poi("poi", "castle", "castle", "hrad", "castello"),
    poi("poi", "ruins", "ruins", "ruiny", "rovine"),

    poi("poi", "monument", "monument", "pomník", "monumento"),
    poi("poi", "memorial", "memorial", "pamätník", "memoriale"),
    poi("poi", "artwork", "artwork", "umelecké dielo", "opera d'arte"),

    poi("poi", "townhall", "townhall", "radnica, obecný úrad", "municipio"),
    poi("poi", "fire_station", "fire station", "hasičská stanica", "pompieri"),
    poi("poi", "police", "police", "polícia", "polizia"),
    poi("poi", "community_centre", "community centre", "dom kultúru, komunitné centrum", "centro comunitario"),
    poi("poi", "office", "office", "informačné centrum", "ufficio"),
    poi("poi", "hospital", "hospital", "nemocnica", "ospedale"),
    poi("poi", "pharmacy", "pharmacy", "lekáreň", "farmacia"),
    poi("poi", "bicycle", "bicycle shop", "cykloobchod", "negozio bici"),

    poi(
      "poi",
      "church",
      "church, chapel, cathedral, temple, basilica",
      "kostol, cerkev, kaplnka, katedrála, chrám, bazilika",
      "chiesa, cappella, cattedrale, tempio, basilica"
    ),
    poi("poi", "wayside_shrine", "wayside shrine", "božia muka", "edicola votiva"),
    poi("poi", "cross", "cross", "kríž", "croce"),

    poi("poi", "cinema", "cinema", "kino", "cinema"),
    poi("poi", "theatre", "theatre", "divadlo", "teatro"),
    poi("poi", "museum", "museum", "múzeum", "museo"),
    poi("poi", "archaeological_site", "archaeological site", "archeologické nálezisko", "sito archeologico"),

    poi("gastro_poi", "pub", "pub", "hostinec, krčma", "pub"),
    poi("gastro_poi", "cafe", "cafe", "kaviareň", "caffè"),
    poi("gastro_poi", "bar", "bar", "bar", "bar"),
    poi("gastro_poi", "restaurant", "restaurant", "reštaurácia", "ristorante"),
    poi("gastro_poi", "convenience", "convenience store", "potraviny", "minimarket"),
    poi("gastro_poi", "supermarket", "supermarket", "supermarket", "supermercato"),
    poi("gastro_poi", "fast_food", "fast food", "rýchle občerstvenie", "fastfood"),
    poi("gastro_poi", "confectionery", "confectionery", "cukráreň", "pasticceria"), // also pastry

    poi("poi", "bunker", "bunker", "bunker", "bunker"),
    poi("poi", "boundary_stone", "boundary stone", "hraničný kameň", "cippo di confine"),

    poi("poi", "post_office", "post office", "pošta", "ufficio postale"),
    poi("poi", "post_box", "post box", "poštová schránka", "cassetta postale"),
    poi("poi", "telephone", "telephone", "telefón", "telefono"),

    poi("railway", "station", "train station, halt", "vlaková stanica, zastávka", "stazione treni, fermata"),
    poi("poi", "bus_station", "bus station", "autobusová zastávka", "stazione autobus"),
    poi("poi", "bus_stop", "bus stop", "autobusová zastávka", "fermata autobus"),
    poi("poi", "taxi", "taxi", "taxi", "taxi"),
    poi("poi", "fuel", "fuel station", "čerpacia stanica", "stazione di servizio"),

    poi("poi", "tower_observation", "observation tower", "vyhliadková veža", "torre di osservazione"),
    poi("poi", "tower_communication", "communication tower", "komunikačná veža", "torre comunicazioni"),
    poi("poi", "tower_bell_tower", "bell tower", "zvonica", "torre campanaria"),
    poi("poi", "tower_other", "tower", "veža", "torre"),
    poi("poi", "water_tower", "water tower", "vodná veža", "torre acquedotto"),
    poi("poi", "chimney", "chimney", "komín", "ciminiera"),
    poi("poi", "mast_other", "mast", "stožiar", "antenna"),

    poi("poi", "picnic_table", "picnic table", "stôl na piknik", "tavolo da picnic"),
    poi("poi", "picnic_site", "picnic site", "miesto na piknik", "area picnic"),

    poi("poi", "feeding_place", "feeding place", "krmidlo", "mangiatoia"),
    poi("poi", "beehive", "beehive", "včelí úľ", "alveare"),

    poi("poi", "horse_riding", "horse riding", "jazda na koni", "equitazione"),
    poi("poi", "sauna", "sauna", "sauna", "sauna"),
    poi("poi", "free_flying", "paragliding", "paraglajding", "parapendio"),
    poi("poi", "golf_course", "golf course", "golfový kurt", "golf"),
    poi("poi", "miniature_golf", "miniature golf", "minigolf", "minigolf"),
    poi("poi", "soccer", "socces", "futbal", "calcio"),
    poi("poi", "tennis", "tennis", "tenis", "tennis"),
    poi("poi", "basketball", "basketball", "basketbal", "pallacanestro"),

    poi("poi", "forester's_lodge", "forester's lodge", "horáreň", "casetta forestale"),
    poi("poi", "mine", "mine, adit, mineshaft", "baňa, štôlňa, šachta", "miniera"),
    poi(
      "poi",
      "disused_mine",
      "disused mine, adit or mineshaft",
      "zatvorená baňa, štôlňa alebo šachta",
      "miniera in disuso, pozzo minerario"
    ),
    poi("poi", "attraction", "attraction", "atrakcia", "attrazione"),

    poi("poi", "firepit", "firepit", "ohnisko", "focolare"),
    poi("poi", "toilets", "toilets", "toalety", "toilet"),
    poi("poi", "bench", "bench", "lavička", "panchina"),

    poi("poi", "lift_gate", "lift gate", "závora", "sbarra"),
    poi("poi", "gate", "gate", "brána", "cancello"),
    poi("poi", "ford", "ford", "brod", "guado"),
    poi("poi", "waste_disposal", "waste disposal", "kontajner na odpad", "smaltimento rifiuti"),
    {
      categoryId: "water",
      name: {
        en: "water area",
        sk: "vodná plocha",
        it: "area acquatica",
      },
      layers: [asArea(["water_area", "water_area_names"], { name: "Abc" })],
      ...props,
    },
    {
      categoryId: "water",
      name: {
        en: "itermittend or seasonal water area",
        sk: "občasná alebo sezónna vodná plocha",
        it: "area acquatica intermittente o stagionale",
      },
      layers: [asArea(["water_area", "water_area_names"], { name: "Abc", tmp: 1 })],
      ...props,
    },
    landcover("forest", "forest", "les", "foresta"),
    landcover(
      "meadow",
      "meadow, park, village green, grassland",
      "lúka, park, mestská zeleň, trávnatá plocha",
      "prato, parco, area verde, pascolo"
    ),
    landcover("heath", "heath", "step", "brughiera"),
    landcover("scrub", "scrub", "kroviny", "boscaglia"),
    landcover("clearcut", "clearcut", "holorub", "area disboscata"),
    landcover("scree", "scree", "štrk", "ghiaione"),
    landcover("bare_rock", "bare rock", "holá skala", "roccia nuda"),
    landcover("wetland", "wetland", "mokraď", "zona umida"),
    landcover("bog", "bog", "rašelinisko", "palude"),
    landcover("marsh", "marsh, fen, wet meadow", "močiar, slatinisko, mokrá lúka", "palude, prateria umida"),
    landcover("swamp", "swamp", "bahnisko", "pantano"),
    landcover("reedbed", "reedbed", "rákosie", "canneto"),
    landcover("mangrove", "mangrove", "mangrovy", "mangrovie"),
    landcover("farmland", "farmland", "pole", "terreno agricolo"),
    landcover("farmyard", "farmyard", "družstvo", "aia"),
    landcover("orchard", "orchard", "ovocný sad", "frutteto"),
    landcover("vineyard", "vineyard", "vinica", "vigneto"),
    landcover("garden", "garden", "záhrada", "giardino"),
    landcover("plant_nursery", "vivaio", "lesná škôlka", ""),
    landcover("beach", "beach", "pláž", "spiaggia"),
    landcover("residential", "residential zone", "obytná zóna", "zona residenziale"),
    landcover("commercial", "commercial zone", "komerčná zóna", "zona commerciale"),
    landcover("industrial", "industrial zone, wastewater plant", "industriálna zóna, ČOV", "zona industriale"),
    landcover("quarry", "quarry", "lom", "cava"),
    landcover("cemetery", "cemetery", "cintorín", "cimitero"),
    landcover(
      "playground",
      "pitch, playground, golf course, track",
      "ihrisko, detské ihrisko, golfové ihrisko, pretekárska dráha",
      "campo da gioco, parco giochi, campo da golf, pista"
    ),
    landcover("parking", "parking", "parkovisko", "parcheggio"),
    landcover("bunker_silo", "bunker silo", "silo", "sbancamento"),
    landcover("landfill", "landfill", "skládka", "discarica"),
    {
      categoryId: "landcover",
      name: {
        en: "solar power plant",
        sk: "slnečná elektráreň",
        it: "centrale fotovoltaica",
      },
      layers: [asArea(["solar_power_plants"], {})],
      ...props,
    },

    {
      categoryId: "borders",
      name: {
        en: "national park",
        sk: "národný park",
        it: "parco nazionale",
      },
      layers: [
        asArea(
          ["protected_areas"],
          {
            type: "national_park",
          },
          10
        ),
      ],
      ...propsForZoom(10),
    },
    {
      categoryId: "borders",
      name: {
        en: "protected area, nature reserve",
        sk: "chránená oblasť, prírodná rezervácia",
        it: "area protetta, riserva naturale",
      },
      layers: [
        asArea(["protected_areas"], {
          type: "protected_area",
        }),
      ],
      ...props,
    },
    {
      categoryId: "borders",
      name: {
        en: "military zone",
        sk: "vojenská zóna",
        it: "zona militare",
      },
      layers: [
        asArea(
          ["military_areas"],
          {
            type: "military",
          },
          10
        ),
      ],
      ...propsForZoom(10),
    },
    {
      categoryId: "borders",
      name: {
        en: "state border",
        sk: "štátna hranica",
        it: "confine di stato",
      },
      layers: [asArea(["borders"], {})],
      ...props,
    },
    {
      categoryId: "water",
      name: {
        en: "river",
        sk: "rieka",
        it: "fiume",
      },
      layers: [
        asLine(["water_line", "water_line_names"], {
          type: "river",
          tunnel: 0,
          dasharray: "1000,0",
          name: "Abc",
        }),
      ],
      ...props,
    },
    {
      categoryId: "water",
      name: {
        en: "stream",
        sk: "potok",
        it: "torrente",
      },
      layers: [
        asLine(["water_line", "water_line_names"], {
          type: "stream",
          tunnel: 0,
          dasharray: "1000,0",
          name: "Abc",
        }),
      ],
      ...props,
    },
    {
      categoryId: "water",
      name: {
        en: "stream in culvert",
        sk: "potok v priepuste",
        it: "canale sotterraneo",
      },
      layers: [
        asLine(["water_line", "water_line_names"], {
          type: "stream",
          tunnel: 1,
          dasharray: "1000,0",
          name: "Abc",
        }),
      ],
      ...props,
    },
    {
      categoryId: "water",
      name: {
        en: "itermittend or seasonal stream",
        sk: "občasný alebo sezónny potok",
        it: "torrente intermittente o stagionale",
      },
      layers: [
        asLine(["water_line", "water_line_names"], {
          type: "stream",
          tunnel: 0,
          dasharray: "6,3",
          name: "Abc",
        }),
      ],
      ...props,
    },
    {
      categoryId: "other",
      name: {
        en: "aerialway",
        sk: "lanovka, vlek",
        it: "via aerea, teleferica",
      },
      layers: [
        asLine(["aerialways", "aerialway_names"], {
          type: "",
          name: "Abc",
        }),
      ],
      ...props,
    },
    {
      categoryId: "other",
      name: {
        en: "aeroway",
        sk: "letisková dráha",
        it: "pista atterraggio",
      },
      layers: [
        asLine(["aeroways"], {
          type: "",
          name: "Abc",
        }),
      ],
      ...props,
    },
    {
      categoryId: "other",
      name: {
        en: "power line with power tower",
        sk: "vedenie vysokého napätia so stožiarom",
        it: "linea elettrica con torre di alimentazione",
      },
      layers: [
        asLine(["feature_lines"], {
          type: "line",
        }),
        asPoint(["features"], {
          type: "tower",
        }),
      ],
      ...props,
    },
    {
      categoryId: "other",
      name: {
        en: "minor power line with power pole",
        sk: "elektrické vedenie so stĺpom",
        it: "linea elettrica minore con palo di alimentazione",
      },
      layers: [
        asLine(["feature_lines"], {
          type: "minor_line",
        }),
        asPoint(["features"], {
          type: "pole",
        }),
      ],
      ...props,
    },
    {
      categoryId: "other",
      name: {
        en: "fence, wall",
        sk: "plot, múr",
        it: "recinzione, muro",
      },
      layers: [
        asLine(["barrierways"], {
          type: "fence",
        }),
      ],
      ...props,
    },
    {
      categoryId: "other",
      name: {
        en: "locality name",
        sk: "názov lokality",
        it: "nome di località",
      },
      layers: [
        forest,
        asPoint(["locality_names"], {
          type: "locality",
          name: "Abc",
        }),
      ],
      ...props,
    },
    {
      ...road("water_slide", "water slide", "tobogán", "scivolo d'acqua", true),
      categoryId: "other",
    },
    {
      categoryId: "other",
      name: {
        en: "pipeline",
        sk: "potrubie",
        it: "tubatura",
      },
      layers: [
        asLine(["pipelines"], {
          location: "overground",
        }),
      ],
      ...props,
    },
    {
      categoryId: "other",
      name: {
        en: "underground pipeline",
        sk: "podzemné potrubie",
        it: "tubatura sotterranea",
      },
      layers: [
        asLine(["pipelines"], {
          location: "underground",
        }),
      ],
      ...props,
    },
    {
      categoryId: "other",
      name: {
        en: "unfinished mapping, map feature for fixing",
        sk: "nedomapovaný prvok, prvok na opravenie",
        it: "mappatura incompiuta, indicatore per la correzione",
      },
      layers: [asPoint(["fixmes"], {})],
      ...props,
    },
    poi("other", "picnic_shelter", "private POI", "súkromný bod záujmu", "POI privato", undefined, { access: "no" }),
  ],
};

module.exports = { legend };
//     .layer('placenames', { type: 'csv', inline: `
// id|name|type|wkt
// 1|Test 123|town|Point(21.219835 48.655111)
// ` }, { srs: '+init=epsg:4326', bufferSize: 1024 })
