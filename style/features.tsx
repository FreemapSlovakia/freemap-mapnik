import { Format, MarkersSymbolizer, Placement, Style, TextSymbolizer } from "jsxnik/mapnikConfig";
import { colors, hsl } from "./colors";
import { defaultFontSize, TextSymbolizerEx } from "./TextSymbolizerEx";
import { RuleEx } from "./RuleEx";
import { SqlLayer } from "./SqlLayer";
import { seq } from "./utils";

function poiIconProjection(ele = "null", access = "null", isolation = "null") {
  return `osm_id, geometry, ${ele} AS ele, ${access} AS access, ${isolation} AS isolation`;
}

function poiNameProjection(ele = "null", access = "null", isolation = "null") {
  return `osm_id, geometry, name AS n, ${ele} AS ele, ${access} AS access, ${isolation} AS isolation`;
}

function getFeaturesSql(zoom: number, mkProjection: (ele?: string, access?: string, isolation?: string) => string) {
  const sqls = [
    `SELECT * FROM (
    SELECT
      ${mkProjection("tags->'ele'", "null", "isolation")},
      CASE WHEN isolation > 4500 THEN 'peak1'
        WHEN isolation BETWEEN 3000 AND 4500 THEN 'peak2'
        WHEN isolation BETWEEN 1500 AND 3000 THEN 'peak3'
        ELSE 'peak' END AS type
    FROM
      osm_features
    NATURAL LEFT JOIN
      isolations
    WHERE
      type = 'peak' AND name <> '' AND geometry && !bbox!`,
  ];

  if (zoom >= 12) {
    sqls.push(`
      UNION ALL
        SELECT
          ${mkProjection("ele")},
          CASE type
            WHEN 'guidepost' THEN (CASE WHEN name = '' THEN 'guidepost_noname' ELSE 'guidepost' END)
            ELSE type
            END AS type
        FROM
          osm_infopoints
    `);
  }

  if (zoom >= 12 && zoom < 14) {
    sqls.push(`
      UNION ALL
        SELECT
          ${mkProjection("tags->'ele'")},
          type
        FROM
          osm_features
        WHERE
          type = 'aerodrome' AND tags ? 'icao'

      UNION ALL
        SELECT
          ${mkProjection("tags->'ele'")},
          type
        FROM
          osm_feature_polys
        WHERE
          type = 'aerodrome' AND tags ? 'icao'
    `);
  }

  if (zoom >= 14) {
    // TODO distinguish various "spring types" (fountain, geyser, ...)

    sqls.push(`
      UNION ALL
        SELECT
          ${mkProjection("null", "tags->'access'")},
          type
        FROM
          osm_sports
        WHERE
          type IN ('free_flying', 'soccer', 'tennis', 'basketball')

      UNION ALL
        SELECT
          ${mkProjection("tags->'ele'", "tags->'access'")},
          CASE
            WHEN type = 'cave_entrance' AND tags ? 'fee' AND tags->'fee' <> 'no' THEN 'cave'
            WHEN type = 'tree' AND tags->'protected' <> 'no' THEN 'tree_protected'
            WHEN type = 'communications_tower' THEN 'tower_communication'
            WHEN type = 'shelter' THEN (CASE WHEN tags->'shelter_type' IN ('shopping_cart', 'lean_to', 'public_transport', 'picnic_shelter', 'basic_hut', 'weather_shelter') THEN tags->'shelter_type' ELSE 'shelter' END)
            WHEN type IN ('mine', 'adit', 'mineshaft') AND tags->'disused' <> 'no' THEN 'disused_mine'
            ELSE type
            END AS type
        FROM
          osm_features
        WHERE
          type <> 'peak'
            AND (type <> 'tree' OR tags->'protected' NOT IN ('', 'no') OR tags->'denotation' = 'natural_monument')
            AND (type <> 'saddle' OR name <> '')

      UNION ALL
        SELECT
          ${mkProjection("tags->'ele'", "tags->'access'")},
          CASE type WHEN 'communications_tower' THEN 'tower_communication'
            WHEN 'shelter' THEN (CASE WHEN tags->'shelter_type' IN ('shopping_cart', 'lean_to', 'public_transport', 'picnic_shelter', 'basic_hut', 'weather_shelter') THEN tags->'shelter_type' ELSE 'shelter' END)
            ELSE (CASE WHEN type IN ('mine', 'adit', 'mineshaft') AND tags->'disused' NOT IN ('', 'no') THEN 'disused_mine' ELSE type END)
            END AS type
        FROM
          osm_feature_polys

      UNION ALL
        SELECT
          ${mkProjection("ele")},
            CASE WHEN type = 'hot_spring' THEN 'hot_spring' ELSE
              CASE WHEN type = 'spring_box' OR refitted = 'yes' THEN 'refitted_' ELSE '' END ||
              CASE WHEN drinking_water = 'yes' OR drinking_water = 'treated' THEN 'drinking_' WHEN drinking_water = 'no' THEN 'not_drinking_' ELSE '' END || 'spring'
          END AS type
        FROM
          osm_springs

      UNION ALL
        SELECT
          ${mkProjection()},
          'ruins' AS type
        FROM
          osm_ruins

      UNION ALL
        SELECT
          ${mkProjection()},
          building AS type
        FROM
          osm_place_of_worships
        WHERE
          building IN ('chapel', 'church', 'basilica', 'temple')

      UNION ALL
        SELECT
          ${mkProjection("ele")},
          CONCAT("class", '_', CASE type
            WHEN 'communication' THEN 'communication'
            WHEN 'observation' THEN 'observation'
            WHEN 'bell_tower' THEN 'bell_tower'
            ELSE 'other' END) AS type
          FROM
            osm_towers
    `);
  }

  if (zoom >= 15) {
    sqls.push(`
      UNION ALL
        SELECT
          ${mkProjection()},
          type
        FROM
          osm_shops
        WHERE
          type IN ('convenience', 'fuel', 'confectionery', 'pastry', 'bicycle', 'supermarket')

      UNION ALL
        SELECT
          ${mkProjection("null", "tags->'access'")},
          'building' AS type
        FROM
          osm_building_points
        WHERE
          type <> 'no'

      UNION ALL
        SELECT
          ${mkProjection()},
          type
        FROM
          osm_feature_lines
        WHERE
          type IN ('dam', 'weir')
    `);
  }

  if (zoom >= 17 && mkProjection !== poiNameProjection) {
    sqls.push(`
      UNION ALL
        SELECT
          ${mkProjection()},
          type
        FROM
          osm_barrierpoints
        WHERE
          type IN ('lift_gate', 'swing_gate', 'gate')

      UNION ALL
        SELECT
          ${mkProjection()},
          'ford' AS type
        FROM
          osm_fords
    `);
  }

  sqls.push(`
    ) AS abc LEFT JOIN z_order_poi USING (type)
    WHERE
      geometry && !bbox!
    ORDER BY
      z_order, isolation DESC nulls last, ele DESC nulls last, osm_id
  `);

  return sqls.join("");
}

const N = false;
const Y = true;
const NN = null;

type Extra = {
  maxZoom?: number;
  minZoom?: number;
  icon?: string | null;
  font?: Partial<Parameters<typeof TextSymbolizerEx>[0]>;
  exp?: string;
};

const bs = "\\\\b *";

const springExpr = {
  exp: `[name].replace('^([Mm]inerálny )?[Pp]rameň${bs}', '').replace('\\\\b[Pp]rameň$', 'prm.').replace('\\\\b[Ss]tud(ničk|ň)a\\\\b', 'stud.').replace('\\\\b[Vv]yvieračka\\\\b', 'vyv.')`,
};

// minIconZoom, minTextZoom, withEle, natural, types/icon, textOverrides
const pois: [number, number | null, boolean, boolean, string | string[], Extra?][] = [
  [12, 12, N, N, "aerodrome", { exp: `[name].replace('^[Ll]etisko${bs}', '')` }],
  [12, 12, Y, N, "guidepost", { icon: "guidepost_x", font: { fontsetName: "bold", dy: -8 }, maxZoom: 12 }],
  [13, 13, Y, N, "guidepost", { icon: "guidepost_xx", font: { fontsetName: "bold" }, maxZoom: 13 }],
  [14, 14, Y, N, "guidepost", { icon: "guidepost_xx", font: { fontsetName: "bold" } }],
  [10, 10, Y, Y, "peak1", { icon: "peak", font: { size: 13, dy: -8 } }],
  [11, 11, Y, Y, "peak2", { icon: "peak", font: { size: 13, dy: -8 } }],
  [12, 12, Y, Y, "peak3", { icon: "peak", font: { size: 13, dy: -8 } }],
  [13, 13, Y, Y, "peak", { font: { size: 13, dy: -8 } }],

  [14, 14, N, N, "castle", { exp: `[name].replace('^[Hh]rad${bs}', '')` }],
  [14, 15, Y, Y, "arch"],
  [
    14,
    15,
    Y,
    Y,
    "cave_entrance",
    {
      exp: `[name].replace('^[Jj]jaskyňa${bs}', '').replace('\\\\b[Jj]askyňa$', 'j.').replace('\\\\b[Pp]riepasť\\\\b$', 'p.')`,
    },
  ],
  [14, 15, Y, Y, "spring", { font: { fill: colors.waterLabel }, ...springExpr }],
  [14, 15, Y, Y, "refitted_spring", { font: { fill: colors.waterLabel }, ...springExpr }],
  [14, 15, Y, Y, "drinking_spring", { font: { fill: colors.waterLabel }, ...springExpr }],
  [14, 15, Y, Y, "not_drinking_spring", { font: { fill: colors.waterLabel }, ...springExpr }],
  [14, 15, Y, Y, "refitted_drinking_spring", { font: { fill: colors.waterLabel }, ...springExpr }],
  [14, 15, Y, Y, "refitted_not_drinking_spring", { font: { fill: colors.waterLabel }, ...springExpr }],
  [14, 15, Y, Y, "hot_spring", { font: { fill: colors.waterLabel }, ...springExpr }],
  [
    14,
    15,
    Y,
    Y,
    "waterfall",
    {
      font: { fill: colors.waterLabel },
      exp: `[name].replace('^[Vv]odopád${bs}', '').replace('\\\\b[Vv]odopád$', 'vdp.')`,
    },
  ],
  [14, 15, N, N, ["drinking_water", "water_point"], { font: { fill: colors.waterLabel } }],
  [14, 15, N, N, "water_well", { font: { fill: colors.waterLabel } }],
  [14, 15, Y, N, "monument"],
  [
    14,
    15,
    Y,
    Y,
    "viewpoint",
    { exp: `[name].replace('^[Vv]yhliadka${bs}', '').replace('\\\\b[Vv]yhliadka$', 'vyhl.')` },
  ],
  [14, 15, Y, N, ["mine", "adit", "mineshaft"]],
  [14, 15, Y, N, "disused_mine"],
  [14, 15, Y, N, "hotel", { exp: `[name].replace('^[Hh]otel${bs}', '')` }],
  [14, 15, Y, N, "chalet", { exp: `[name].replace('^[Cc]hata${bs}', '').replace('\\\\b[Cc]hata$', 'ch.')` }],
  [14, 15, Y, N, "hostel"],
  [14, 15, Y, N, "motel", { exp: "[name].replace('^[Mm]otel\\\\b *', '')" }],
  [14, 15, Y, N, "guest_house"],
  [14, 15, Y, N, "apartment"],
  [14, 15, Y, N, "wilderness_hut"],
  [14, 15, Y, N, "alpine_hut"],
  [14, 15, Y, N, "camp_site"],
  [14, 15, N, N, "attraction"],
  [14, 15, N, N, "hospital", { exp: `[name].replace('^[Nn]emocnica\\\\b', 'Nem.')` }],
  [14, 15, N, N, "townhall", { exp: `[name].replace('^[Oo]becný úrad${bs}', '')` }],
  [
    14,
    15,
    N,
    N,
    ["church", "chapel", "cathedral", "temple", "basilica"],
    { exp: `[name].replace('^[Kk]ostol${bs}', '').replace('\\\\b([Ss]vät\\\\w+|Sv.)', 'sv.')` },
  ],
  [14, 15, Y, N, "tower_observation"],
  [14, 15, Y, N, "archaeological_site"],
  [14, 15, N, N, ["station", "halt"]],
  [14, 15, N, N, "bus_station"],
  [14, 15, N, N, "water_park"],
  [14, 15, N, N, "museum"],
  [14, 15, N, N, "free_flying"],
  [14, 15, N, N, "forester's_lodge"],
  [14, 15, N, N, "horse_riding"],
  [14, 15, N, N, "golf_course"],
  [
    14,
    14,
    N,
    N,
    "kindergarten",
    {
      font: { fill: colors.areaLabel },
      icon: null,
      exp:
        "[name].replace('[Zz]ákladná [Šš]kola', 'ZŠ')" +
        ".replace('[Zz]ákladná [Uu]melecká [Šš]kola', 'ZUŠ')" +
        ".replace('[Mm]atersk(á|ou) [Šš]k[oô]lk?(a|ou)', 'MŠ')",
    },
  ], // has no icon yet - render as area name
  [14, 14, N, N, "recycling", { font: { fill: colors.areaLabel }, icon: null }], // has no icon yet - render as area name

  [15, NN, Y, N, "guidepost_noname", { icon: "guidepost_x" }],
  [15, 15, Y, Y, "saddle", { font: { size: 13, dy: -8 } }],

  [15, 16, N, N, "ruins"],
  [15, 16, N, N, "chimney"],
  [15, 16, N, N, "fire_station", { exp: `[name].replace('^([Hh]asičská zbrojnica|[Pp]ožiarná stanica)${bs}', '')` }],
  [15, 16, N, N, "community_centre", { exp: "[name].replace('\\\\b[Cc]entrum voľného času\\\\b', 'CVČ')" }],
  [15, 16, N, N, "police", { exp: `[name].replace('^[Pp]olícia${bs}', '')` }],
  [15, 16, N, N, "office"], // information=office
  [15, 16, N, N, "hunting_stand"],
  [15, 16, Y, N, "shelter"],
  // [15, 16, Y, N, 'shopping_cart'],
  [15, 16, Y, N, "lean_to"],
  [15, 16, Y, N, "public_transport"],
  [15, 16, Y, N, "picnic_shelter"],
  [15, 16, Y, N, "basic_hut"],
  [15, 16, Y, N, "weather_shelter"],
  [15, 16, N, Y, "rock"],
  [15, 16, N, Y, "stone"],
  [15, 16, N, Y, "sinkhole"],
  [15, 16, N, N, "pharmacy", { exp: `[name].replace('^[Ll]ekáreň${bs}', '')` }],
  [15, 16, N, N, "cinema", { exp: `[name].replace('^[Kk]ino${bs}', '')` }],
  [15, 16, N, N, "theatre", { exp: `[name].replace('^[Dd]ivadlo${bs}', '')` }],
  [15, 16, N, N, "memorial", { exp: `[name].replace('^[Pp]amätník${bs}', '')` }],
  [15, 16, N, N, "pub"],
  [15, 16, N, N, "cafe", { exp: `[name].replace('^[Kk]aviareň${bs}', '')` }],
  [15, 16, N, N, "bar"],
  [15, 16, N, N, "restaurant", { exp: `[name].replace('^[Rr]eštaurácia${bs}', '')` }],
  [15, 16, N, N, "convenience"],
  [15, 16, N, N, "supermarket"],
  [15, 16, N, N, "fast_food"],
  [15, 16, N, N, ["confectionery", "pastry"]],
  [15, 16, N, N, "fuel"],
  [15, 16, N, N, "post_office"],
  [15, 16, N, N, "bunker"],
  [15, 16, N, N, "boundary_stone"],
  [15, NN, N, N, "mast_other"],
  [15, NN, N, N, "tower_other"],
  [15, NN, N, N, ["tower_communication", "mast_communication"]],
  [15, 16, N, N, "tower_bell_tower"],
  [15, 16, N, N, "water_tower"],
  [15, 16, N, N, "bus_stop"],
  [15, 16, N, N, "sauna"],
  [15, 16, N, N, "taxi"],
  [15, 16, N, N, "bicycle"],
  [15, 16, N, N, "building"],
  [15, 15, N, Y, "tree_protected", { font: { fill: hsl(120, 100, 31) } }],
  [15, 15, N, Y, "tree"],
  [15, 16, N, N, "bird_hide"],
  [15, 16, N, N, "dam", { font: { fill: colors.waterLabel } }],
  [15, 16, N, N, "weir", { font: { fill: colors.waterLabel } }],
  [
    15,
    15,
    N,
    N,
    ["school", "university", "college"],
    {
      font: { fill: colors.areaLabel },
      icon: null,
      exp:
        "[name].replace('[Zz]ákladná [Šš]kola', 'ZŠ')" +
        ".replace('[Zz]ákladná [Uu]melecká [Šš]kola', 'ZUŠ')" +
        ".replace('[Mm]atersk(á|ou) [Šš]k[oô]lk?(a|ou)', 'MŠ')" +
        ".replace('[Ss]tredná [Oo]dborná [Šš]kola', 'SOŠ')" +
        ".replace('[Gg]ymnázium ', 'gym. ')" +
        ".replace(' [Gg]ymnázium', ' gym.')" +
        ".replace('[V]ysoká [Šš]kola', 'VŠ')",
    },
  ], // has no icon yet - render as area name

  [16, 17, N, N, "miniature_golf"],
  [16, 17, N, N, "soccer"],
  [16, 17, N, N, "tennis"],
  [16, 17, N, N, "basketball"],
  [16, NN, Y, N, ["guidepost_noname", "route_marker"], { icon: "guidepost_x" }],
  [16, NN, N, N, "picnic_table"],
  [16, NN, N, N, "outdoor_seating"],
  [16, 17, N, N, "picnic_site"],
  [16, 16, N, N, "board"],
  [16, 17, N, N, "map"],
  [16, 17, N, N, "artwork"],
  [16, 17, N, N, "fountain", { font: { fill: colors.waterLabel } }],
  [16, NN, N, N, "watering_place", { font: { fill: colors.waterLabel } }],
  [16, NN, N, N, "feeding_place", { icon: "manger" }],
  [16, NN, N, N, "game_feeding", { icon: "manger" }],
  [16, 17, N, N, "playground", { exp: `[name].replace('^[Dd]etské ihrisko\\\\b', '')` }],
  [
    16,
    17,
    N,
    N,
    ["water_works", "reservoir_covered", "pumping_station", "wastewater_plant"],
    { font: { fill: colors.waterLabel } },
  ],
  [16, 17, N, N, "cross"],

  [17, 18, N, N, "wayside_shrine"],
  [17, 18, N, N, ["cross", "wayside_cross", "tree_shrine"]], // NOTE cross is also on lower zoom
  [17, NN, N, N, "firepit"],
  [17, NN, N, N, "toilets"],
  [17, NN, N, N, "bench"],
  [17, 18, N, N, ["beehive", "apiary"]],
  [17, NN, N, N, ["lift_gate", "swing_gate"]],
  [17, NN, N, N, "ford"],

  [18, 19, N, N, "post_box"],
  [18, 19, N, N, "telephone"],
  [18, NN, N, N, "gate"],
  [18, NN, N, N, "waste_disposal"],

  [19, NN, N, N, "waste_basket"],
];

export function Features() {
  return (
    <>
      <Style name="features">
        <RuleEx minZoom={16} type="pylon">
          <MarkersSymbolizer file="images/power_tower.svg" allow-overlap ignore-placement />
        </RuleEx>

        <RuleEx minZoom={13} type="tower">
          <MarkersSymbolizer file="images/power_tower.svg" allow-overlap ignore-placement />
        </RuleEx>

        <RuleEx minZoom={14} type="pole">
          <MarkersSymbolizer file="images/power_pole.svg" allow-overlap ignore-placement />
        </RuleEx>

        {pois.map(([minIcoZoom, , , , type, extra = {} as any]) => {
          if (typeof minIcoZoom !== "number") {
            return undefined;
          }

          const zoom = [minIcoZoom];

          if (extra.maxZoom) {
            zoom.push(extra.maxZoom);
          }

          return (
            <RuleEx type={type} minZoom={minIcoZoom} maxZoom={extra.maxZoom}>
              {[
                undefined,
                "translate(6 - (abs([osm_id]) % 2) * 12, 0)",
                "translate(-6 + (abs([osm_id]) % 2) * 12, 0)",
              ].map(
                (transform) =>
                  extra.icon !== null && (
                    <MarkersSymbolizer
                      // TODO find out a way to make it red if private
                      multiPolicy="whole"
                      file={`images/${extra.icon || (Array.isArray(type) ? type[0] : type)}.svg`}
                      opacity='1 - ([type] != "cave_entrance" and ([access] = "private" or [access] = "no")) * 0.66'
                      transform={transform}
                    />
                  )
              )}
            </RuleEx>
          );
        })}

        {/* // rest texts
          <RuleEx minZoom={16}>
            <TextSymbolizer ({ ...fontDfltWrap }, nameWithEle)
          </RuleEx>
        */}
      </Style>

      {seq(10, 17).map((zoom) => (
        <SqlLayer
          styleName="features"
          minZoom={zoom}
          maxZoom={zoom === 17 ? undefined : zoom}
          bufferSize={256}
          sql={getFeaturesSql(zoom, poiIconProjection)}
        />
      ))}
    </>
  );
}

export function FeatureNames() {
  return (
    <>
      <Style name="feature_names">
        {pois.map(
          ([, minTextZoom, withEle, natural, type, extra = {}]) =>
            minTextZoom != undefined &&
            seq(0, 1).map((shorten) => {
              // seq woodo is because of https://github.com/mapnik/mapnik/issues/4356
              let minZoom = minTextZoom;

              let maxZoom = extra.maxZoom;

              if (shorten) {
                if (minZoom > 14) {
                  return;
                }

                if (!maxZoom || maxZoom > 14) {
                  maxZoom = 14;
                }
              } else {
                if (maxZoom && maxZoom < 15) {
                  return;
                }

                if (minZoom < 15) {
                  minZoom = 15;
                }
              }

              console.log({ minZoom, maxZoom, shorten });

              return (
                <RuleEx type={type} minZoom={minZoom} maxZoom={maxZoom}>
                  <TextSymbolizerEx wrap nature={natural} placementType="list" dy={-10} {...(extra.font || {})}>
                    {(extra.exp ?? "[name]") + (shorten ? ".replace('^(.{5})...+', '$1…')" : "")}
                    {withEle && (
                      <>
                        <Format size={Number(extra.font?.size ?? defaultFontSize) * 0.92}>[elehack]</Format>
                        <Format size={Number(extra.font?.size ?? defaultFontSize) * 0.8}>[ele]</Format>
                      </>
                    )}
                    <Placement dy={extra?.font?.dy ? -extra.font.dy : 10} />
                  </TextSymbolizerEx>
                </RuleEx>
              );
            })
        )}
      </Style>

      {seq(10, 17).map((zoom) => (
        <SqlLayer
          styleName="feature_names"
          minZoom={zoom}
          maxZoom={zoom === 17 ? undefined : zoom}
          bufferSize={256}
          sql={`
            SELECT DISTINCT ON (osm_id)
              *,
              n AS name,
              CASE WHEN ele <> '' THEN chr(10) || chr(8203) ELSE '' END AS elehack
            FROM (${getFeaturesSql(zoom, poiNameProjection)}) subq
          `}
        />
      ))}
    </>
  );
}
