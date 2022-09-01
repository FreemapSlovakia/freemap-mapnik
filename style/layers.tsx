import { DatasourceEx } from "./DatasourceEx";
import { GdalLayer } from "./GdalLayer";
import { Datasource, Layer, Parameter, Style } from "jsxnik/mapnikConfig";
import { ShadingAndContours } from "./ShadingAndContours";
import { ShpLayer } from "./ShpLayer";
import { SqlLayer } from "./SqlLayer";
import { StyledLayer } from "./StyledLayer";
import { seq } from "./utils";

function poiIconProjection(ele = "null", access = "null", isolation = "null") {
  return `osm_id, geometry, ${ele} AS ele, ${access} AS access, ${isolation} AS isolation`;
}

function poiNameProjection(ele = "null", access = "null", isolation = "null") {
  return `osm_id, geometry, name AS n, ${ele} AS ele, ${access} AS access, ${isolation} AS isolation`;
}

function getLandcoverSelect(tblSuffix: "_gen0" | "_gen1" | "" = "") {
  return `
    SELECT
      CASE WHEN type = 'wetland' AND tags->'wetland' IN ('bog', 'reedbed', 'marsh', 'swamp', 'wet_meadow', 'mangrove', 'fen') THEN tags->'wetland' ELSE type END AS type,
      geometry,
      position(type || ',' IN 'pedestrian,footway,pitch,library,baracks,parking,cemetery,place_of_worship,dam,weir,clearcut,scrub,orchard,vineyard,landfill,scree,quarry,railway,park,garden,allotments,kindergarten,school,college,university,village_green,wetland,grass,recreation_ground,zoo,farmyard,retail,commercial,residential,industrial,fell,bare_rock,heath,meadow,wood,forest,golf_course,grassland,farm,farmland,') AS z_order
    FROM
      osm_landusages${tblSuffix}
    WHERE
      geometry && !bbox!
    ORDER BY
      z_order DESC, osm_id
  `;
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
          ${mkProjection("tags->'ele'", "CASE WHEN type IN ('cave_entrance') THEN null ELSE tags->'access' END")},
          CASE type
            WHEN 'communications_tower' THEN 'tower_communication'
            WHEN 'shelter' THEN (CASE WHEN tags->'shelter_type' IN ('shopping_cart', 'lean_to', 'public_transport', 'picnic_shelter', 'basic_hut', 'weather_shelter') THEN tags->'shelter_type' ELSE 'shelter' END)
            ELSE (CASE WHEN type IN ('mine', 'adit', 'mineshaft') AND tags->'disused' NOT IN ('', 'no') THEN 'disused_mine' ELSE type END)
            END AS type
        FROM
          osm_features
        WHERE
          type <> 'peak'
            AND (type <> 'tree' OR tags->'protected' NOT IN ('', 'no'))
            AND (type <> 'saddle' OR name <> '')

      UNION ALL
        SELECT
          ${mkProjection("tags->'ele'", "CASE WHEN type IN ('cave_entrance') THEN null ELSE tags->'access' END")},
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

type Props = {
  shading: boolean;
  contours: boolean;
  hikingTrails: boolean;
  bicycleTrails: boolean;
  skiTrails: boolean;
  horseTrails: boolean;
  format: string;
  custom?: {
    styles: unknown; // TODO
    layers: unknown; // TODO
  };
  legendLayers: {
    styles: string;
    geojson: unknown; // TODO GeoJSON
  }[];
};

export function Layers({
  shading,
  contours,
  hikingTrails,
  bicycleTrails,
  skiTrails,
  horseTrails,
  format,
  custom,
  legendLayers,
}: Props) {
  const lefts: string[] = [];

  const rights: string[] = [];

  if (hikingTrails) {
    lefts.push("hiking", "foot");
  }

  if (horseTrails) {
    lefts.push("horse");
  }

  if (bicycleTrails) {
    rights.push("bicycle", "mtb");
  }

  if (skiTrails) {
    rights.push("ski", "piste");
  }

  const [leftsIn, rightsIn] = [lefts, rights].map((side) => side.map((item) => `'${item}'`).join(",") || "'_x_'");

  if (legendLayers) {
    return legendLayers.map((layer) => (
      <Layer name={layer.styles} srs="+init=epsg:4326">
        <Datasource>
          <Parameter name="type">geojson</Parameter>
          <Parameter name="inline">{JSON.stringify(layer.geojson)}</Parameter>
        </Datasource>
      </Layer>
    ));
  }

  const colorSql = `
    case
      WHEN "osmc:symbol" like 'red:%' THEN 0
      WHEN "osmc:symbol" like 'blue:%' THEN 1
      WHEN "osmc:symbol" like 'green:%' THEN 2
      WHEN "osmc:symbol" like 'yellow:%' THEN 3
      WHEN "osmc:symbol" like 'black:%' THEN 4
      WHEN "osmc:symbol" like 'white:%' THEN 5
      WHEN "osmc:symbol" like 'orange:%' THEN 6
      WHEN "osmc:symbol" like 'violet:%' THEN 7
      WHEN "osmc:symbol" like 'purple:%' THEN 7
      WHEN colour = 'red' THEN 0
      WHEN colour = 'blue' THEN 1
      WHEN colour = 'green' THEN 2
      WHEN colour = 'yellow' THEN 3
      WHEN colour = 'black' THEN 4
      WHEN colour = 'white' THEN 5
      WHEN colour = 'orange' THEN 6
      WHEN colour = 'violet' THEN 7
      WHEN colour = 'purple' THEN 7
      ELSE 8
    END
  `;

  const getRoutesQuery = (includeNetworks?: string[]) => `
    SELECT
      ST_LineMerge(ST_Collect(geometry)) AS geometry,
      idx(arr1, 0) AS h_red,
      idx(arr1, 1) AS h_blue,
      idx(arr1, 2) AS h_green,
      idx(arr1, 3) AS h_yellow,
      idx(arr1, 4) AS h_black,
      idx(arr1, 5) AS h_white,
      idx(arr1, 6) AS h_orange,
      idx(arr1, 7) AS h_purple,
      idx(arr1, 8) AS h_none,
      idx(arr1, 10) AS h_red_loc,
      idx(arr1, 11) AS h_blue_loc,
      idx(arr1, 12) AS h_green_loc,
      idx(arr1, 13) AS h_yellow_loc,
      idx(arr1, 14) AS h_black_loc,
      idx(arr1, 15) AS h_white_loc,
      idx(arr1, 16) AS h_orange_loc,
      idx(arr1, 17) AS h_purple_loc,
      idx(arr1, 18) AS h_none_loc,
      idx(arr2, 20) AS b_red,
      idx(arr2, 21) AS b_blue,
      idx(arr2, 22) AS b_green,
      idx(arr2, 23) AS b_yellow,
      idx(arr2, 24) AS b_black,
      idx(arr2, 25) AS b_white,
      idx(arr2, 26) AS b_orange,
      idx(arr2, 27) AS b_purple,
      idx(arr2, 28) AS b_none,
      idx(arr2, 30) AS s_red,
      idx(arr2, 31) AS s_blue,
      idx(arr2, 32) AS s_green,
      idx(arr2, 33) AS s_yellow,
      idx(arr2, 34) AS s_black,
      idx(arr2, 35) AS s_white,
      idx(arr2, 36) AS s_orange,
      idx(arr2, 37) AS s_purple,
      idx(arr2, 38) AS s_none,
      idx(arr1, 40) AS r_red,
      idx(arr1, 41) AS r_blue,
      idx(arr1, 42) AS r_green,
      idx(arr1, 43) AS r_yellow,
      idx(arr1, 44) AS r_black,
      idx(arr1, 45) AS r_white,
      idx(arr1, 46) AS r_orange,
      idx(arr1, 47) AS r_purple,
      idx(arr1, 48) AS r_none,
      refs1,
      refs2,
      icount(arr1 - array[1000, 1010, 1020, 1030, 1040]) AS off1,
      icount(arr2 - array[1000, 1010, 1020, 1030, 1040]) AS off2
    FROM (
      SELECT
        array_to_string(
          array(
            SELECT distinct itm FROM unnest(
              array_agg(
                CASE
                  WHEN
                    osm_routes.type IN (${leftsIn})
                  THEN
                    case
                      WHEN name <> '' AND ref <> ''
                      THEN name || ' (' || ref || ')'
                      ELSE COALESCE(NULLIF(name, ''), NULLIF(ref, '')) END
                  ELSE
                    null
                  END
              )
            ) AS itm ORDER BY itm
          ),
          ', '
        ) AS refs1,
        array_to_string(
          array(
            SELECT distinct itm FROM unnest(
              array_agg(
                CASE
                  WHEN
                    osm_routes.type IN (${rightsIn})
                  THEN
                    case
                      WHEN name <> '' AND ref <> ''
                      THEN name || ' (' || ref || ')'
                      ELSE COALESCE(NULLIF(name, ''), NULLIF(ref, '')) END
                  ELSE
                    null
                  END
              )
            ) AS itm ORDER BY itm
          ),
          ', '
        ) AS refs2,
        first(geometry) AS geometry,
        uniq(sort(array_agg(
          case
            WHEN osm_routes.type IN (${leftsIn}) THEN
              case
                WHEN ${!!horseTrails} AND osm_routes.type = 'horse' THEN 40
                WHEN ${!!hikingTrails} AND osm_routes.type IN ('hiking', 'foot') THEN (CASE WHEN network IN ('iwn', 'nwn', 'rwn') THEN 0 ELSE 10 END)
                ELSE 1000
              END +
              ${colorSql}
            ELSE 1000
          END
        ))) AS arr1,
        uniq(sort(array_agg(
          case
            WHEN osm_routes.type IN (${rightsIn}) THEN
              case
                WHEN ${!!bicycleTrails} AND osm_routes.type IN ('bicycle', 'mtb') THEN 20
                WHEN ${!!skiTrails} AND osm_routes.type IN ('ski', 'piste') THEN 30
                ELSE 1000
              END +
              ${colorSql}
            ELSE
              1000
            END
        ))) AS arr2
      FROM osm_route_members JOIN osm_routes ON (osm_route_members.osm_id = osm_routes.osm_id AND state <> 'proposed')
      WHERE ${
        !includeNetworks ? "" : `network IN (${includeNetworks.map((n) => `'${n}'`).join(",")}) AND `
      }geometry && !bbox!
      GROUP BY member
    ) AS aaa
    GROUP BY
      h_red, h_blue, h_green, h_yellow, h_black, h_white, h_orange, h_purple, h_none,
      h_red_loc, h_blue_loc, h_green_loc, h_yellow_loc, h_black_loc, h_white_loc, h_orange_loc, h_purple_loc, h_none_loc,
      b_red, b_blue, b_green, b_yellow, b_black, b_white, b_orange, b_purple, b_none,
      s_red, s_blue, s_green, s_yellow, s_black, s_white, s_orange, s_purple, s_none,
      r_red, r_blue, r_green, r_yellow, r_black, r_white, r_orange, r_purple, r_none,
      off1, off2, refs1, refs2
  `;

  return (
    <>
      <ShpLayer
        styleName="sea"
        srs="+init=epsg:3857"
        maxZoom={9}
        file="simplified-land-polygons-complete-3857/simplified_land_polygons.shp"
      />

      <ShpLayer styleName="sea" srs="+init=epsg:3857" minZoom={10} file="land-polygons-split-3857/land_polygons.shp" />

      <SqlLayer styleName="landcover" maxZoom={9} sql={getLandcoverSelect("_gen0")} />

      <SqlLayer styleName="landcover" minZoom={10} maxZoom={11} sql={getLandcoverSelect("_gen1")} />

      <SqlLayer styleName="landcover" minZoom={12} cacheFeatures sql={getLandcoverSelect("")} />

      <SqlLayer
        styleName="cutlines"
        minZoom={13}
        sql="SELECT geometry, type FROM osm_feature_lines WHERE type = 'cutline'"
      />

      <SqlLayer
        styleName="water_area"
        maxZoom={11}
        sql="SELECT geometry, type, intermittent OR seasonal AS tmp FROM osm_waterareas_gen1"
      />

      <SqlLayer
        styleName="water_area"
        minZoom={12}
        sql="SELECT geometry, type, intermittent OR seasonal AS tmp FROM osm_waterareas"
      />

      <SqlLayer
        styleName="water_line"
        maxZoom={9}
        sql="SELECT geometry, type, tunnel, CASE WHEN intermittent OR seasonal THEN '6,3' ELSE '1000,0' END AS dasharray FROM osm_waterways_gen0"
      />

      <SqlLayer
        styleName="water_line"
        minZoom={10}
        maxZoom={11}
        sql="SELECT geometry, type, tunnel, CASE WHEN intermittent OR seasonal THEN '6,3' ELSE '1000,0' END AS dasharray FROM osm_waterways_gen1"
      />

      <SqlLayer
        styleName="water_line"
        minZoom={12}
        sql="SELECT geometry, type, tunnel, CASE WHEN intermittent OR seasonal THEN '6,3' ELSE '1000,0' END AS dasharray FROM osm_waterways"
      />

      <SqlLayer
        styleName="trees"
        minZoom={16}
        bufferSize={128}
        sql="SELECT type, geometry FROM osm_features WHERE type = 'tree' OR type = 'shrub'"
      />

      {/* TODO split to several layers: underground/underwater, overground, overhead */}
      <SqlLayer styleName="pipelines" minZoom={13} sql="SELECT geometry, location FROM osm_pipelines" />

      <SqlLayer
        styleName="feature_lines"
        minZoom={13}
        cacheFeatures
        sql="SELECT geometry, type FROM osm_feature_lines WHERE type NOT IN ('cutline', 'valley', 'ridge')"
      />

      {shading ? (
        <SqlLayer
          styleName="feature_lines_maskable"
          minZoom={13}
          compOp="src-over"
          // TODO for effectivity filter out cliffs/earth_banks
          sql="SELECT geometry, type FROM osm_feature_lines WHERE type NOT IN ('cutline', 'valley', 'ridge')"
        >
          {["pl", "sk" /*, "at", "ch" (AT / CH is not so detailed) */].map((cc) => (
            <GdalLayer styleName="mask" compOp="dst-out" file={`shading/${cc}/mask.tif`} />
          ))}
        </SqlLayer>
      ) : (
        <SqlLayer
          styleName="feature_lines_maskable"
          minZoom={13}
          cacheFeatures
          sql="SELECT geometry, type FROM osm_feature_lines WHERE type NOT IN ('cutline', 'valley', 'ridge')"
        />
      )}

      <SqlLayer
        styleName="embankments"
        minZoom={16}
        sql="SELECT geometry FROM osm_roads WHERE embankment = 1 AND geometry && !bbox!"
      />

      <SqlLayer
        styleName="highways"
        maxZoom={9}
        groupBy="tunnel"
        sql="
          SELECT geometry, type, tracktype, class, service, bridge, tunnel, oneway, power(0.666, greatest(0, trail_visibility - 1)) AS trail_visibility
          FROM osm_roads_gen0
          WHERE geometry && !bbox!
          ORDER BY z_order, osm_id
        "
      />

      <SqlLayer
        styleName="highways"
        minZoom={10}
        maxZoom={11}
        groupBy="tunnel"
        sql="
          SELECT geometry, type, tracktype, class, service, bridge, tunnel, oneway, power(0.666, greatest(0, trail_visibility - 1)) AS trail_visibility
          FROM osm_roads_gen1
          WHERE geometry && !bbox!
          ORDER BY z_order, osm_id
        "
      />

      <SqlLayer
        styleName="highways"
        sql="
          SELECT geometry, type, tracktype, class, service, bridge, tunnel, oneway, power(0.666, greatest(0, trail_visibility - 1)) AS trail_visibility
          FROM osm_roads_gen1
          WHERE geometry && !bbox!
          ORDER BY z_order, osm_id
        "
        maxZoom={11}
        groupBy="tunnel"
      />

      <SqlLayer
        styleName={["higwayGlows", "highways"]}
        minZoom={12}
        cacheFeatures
        groupBy="tunnel"
        // ORDER BY CASE WHEN type = 'rail' AND (service = 'main' OR service = '') THEN 1000 ELSE z_order END
        sql="
          SELECT geometry, type, tracktype, class, service, bridge, tunnel, oneway, power(0.666, greatest(0, trail_visibility - 1)) AS trail_visibility
          FROM osm_roads
          WHERE geometry && !bbox! ORDER BY z_order, osm_id
        "
      />

      <SqlLayer
        styleName="accessRestrictions"
        sql="
          SELECT
            CASE
              WHEN bicycle NOT IN ('', 'yes', 'designated', 'official', 'permissive')
              OR bicycle = '' AND vehicle NOT IN ('', 'yes', 'designated', 'official', 'permissive')
              OR bicycle = '' AND vehicle = '' AND access NOT IN ('', 'yes', 'designated', 'official', 'permissive')
              THEN 1 ELSE 0 END AS no_bicycle,
            CASE
              WHEN foot NOT IN ('', 'yes', 'designated', 'official', 'permissive')
              OR foot = '' AND access NOT IN ('', 'yes', 'designated', 'official', 'permissive')
              THEN 1 ELSE 0 END AS no_foot,
            geometry
          FROM osm_roads
          WHERE type NOT IN ('trunk', 'motorway', 'trunk_link', 'motorway_link') AND geometry && !bbox!
        "
        minZoom={14}
      />

      <SqlLayer styleName="aerialways" sql="SELECT geometry, type FROM osm_aerialways" minZoom={12} />

      {/* <SqlLayer
        styleName="highways"
        sql="SELECT geometry, type, tracktype, class, service, bridge, tunnel, oneway FROM osm_roads_gen0 ORDER BY z_order"
        maxZoom={13}
      /> */}

      <SqlLayer styleName="aeroways" sql="SELECT geometry, type FROM osm_aeroways" minZoom={11} />

      <SqlLayer
        styleName="solar_power_plants"
        sql="SELECT geometry FROM osm_power_generators WHERE source = 'solar'"
        minZoom={12}
      />

      <SqlLayer styleName="buildings" sql="SELECT geometry, type FROM osm_buildings  WHERE type <> 'no'" minZoom={13} />

      <SqlLayer styleName="barrierways" sql="SELECT geometry, type FROM osm_barrierways" minZoom={16} />

      {(shading || contours) && (
        <>
          <ShadingAndContours contours={contours} shading={shading} cc="at" cutCcs={["sk", "ch", "si"]} />

          <ShadingAndContours contours={contours} shading={shading} cc="it" cutCcs={["at", "ch", "si"]} />

          <ShadingAndContours contours={contours} shading={shading} cc="ch" cutCcs={[]} />

          <ShadingAndContours contours={contours} shading={shading} cc="si" cutCcs={[]} />

          <ShadingAndContours contours={contours} shading={shading} cc="pl" cutCcs={["sk"]} />

          <ShadingAndContours contours={contours} shading={shading} cc="sk" cutCcs={[]} />

          {/* to cut out detailed */}
          <SqlLayer
            styleName="sea" // any
            compOp="src-over"
            sql="SELECT geom FROM contour_split LIMIT 0" // some empty data
          >
            {["it", "at", "ch", "si", "pl", "sk"].map((cc) => (
              <GdalLayer styleName="mask" file={`shading/${cc}/mask.tif`} />
            ))}

            <SqlLayer
              styleName="sea" // any
              compOp="src-out"
              sql="SELECT geom FROM contour_split LIMIT 0" // some empty data
            >
              {contours && <SqlLayer styleName="contours" minZoom={12} sql="SELECT geom, height FROM contour_split" />}

              {shading && <GdalLayer styleName="mask" file="shading/final.tiff" />}
            </SqlLayer>
          </SqlLayer>
        </>
      )}

      <SqlLayer styleName="protected_areas" sql="SELECT type, geometry FROM osm_protected_areas" />

      <SqlLayer
        styleName="borders"
        opacity={0.5}
        sql="SELECT ST_LineMerge(ST_Collect(geometry)) AS geometry FROM osm_admin WHERE admin_level = 2 AND geometry && !bbox!"
      />

      <SqlLayer styleName="military_areas" sql="SELECT geometry FROM osm_landusages WHERE type = 'military'" />

      {/* .sqlLayer(['routeGlows', 'routes'], */}

      <SqlLayer styleName="routes" minZoom={9} maxZoom={9} bufferSize={512} sql={getRoutesQuery(["iwn", "icn"])} />

      <SqlLayer
        styleName="routes"
        minZoom={10}
        maxZoom={10}
        bufferSize={512}
        sql={getRoutesQuery(["iwn", "nwn", "icn", "ncn"])}
      />

      <SqlLayer
        styleName="routes"
        sql={getRoutesQuery(["iwn", "nwn", "rwn", "icn", "ncn", "rcn"])}
        minZoom={11}
        maxZoom={11}
        bufferSize={512}
      />

      <SqlLayer styleName="routes" sql={getRoutesQuery()} minZoom={12} maxZoom={13} bufferSize={512} />

      <SqlLayer
        styleName="routes"
        minZoom={14}
        // NOTE clearing cache because of contour elevation labels
        clearLabelCache
        bufferSize={2048}
        sql={getRoutesQuery()}
      />

      <ShpLayer
        styleName="geonames"
        srs="+init=epsg:4326"
        bufferSize={1024}
        minZoom={9}
        maxZoom={11}
        file="geo-names/geo-names.shp"
      />

      <SqlLayer
        styleName="placenames"
        bufferSize={1024}
        maxZoom={8}
        clearLabelCache
        sql="SELECT name, type, geometry FROM osm_places WHERE type = 'city' AND geometry && !bbox! ORDER BY z_order DESC, osm_id"
      />

      <SqlLayer
        styleName="placenames"
        bufferSize={1024}
        minZoom={9}
        maxZoom={10}
        clearLabelCache
        sql="SELECT name, type, geometry FROM osm_places WHERE (type = 'city' OR type = 'town') AND geometry && !bbox! ORDER BY z_order DESC, osm_id"
      />

      <SqlLayer
        styleName="placenames"
        bufferSize={1024}
        minZoom={11}
        maxZoom={11}
        clearLabelCache
        sql="SELECT name, type, geometry FROM osm_places WHERE (type = 'city' OR type = 'town' OR type = 'town' OR type = 'village') AND geometry && !bbox! ORDER BY z_order DESC, osm_id"
      />

      <SqlLayer
        styleName="placenames"
        bufferSize={1024}
        minZoom={12}
        maxZoom={14}
        clearLabelCache
        sql="SELECT name, type, geometry FROM osm_places WHERE type <> 'locality' AND geometry && !bbox! ORDER BY z_order DESC, osm_id"
      />

      {seq(10, 17).map((zoom) => (
        <SqlLayer
          styleName="features"
          minZoom={zoom}
          maxZoom={zoom === 17 ? undefined : zoom}
          bufferSize={256}
          cacheFeatures
          sql={getFeaturesSql(zoom, poiIconProjection)}
        />
      ))}

      {seq(10, 17).map((zoom) => (
        <SqlLayer
          styleName="feature_names"
          minZoom={zoom}
          maxZoom={zoom === 17 ? undefined : zoom}
          bufferSize={256}
          cacheFeatures
          sql={`
            SELECT DISTINCT ON (osm_id)
              *,
              ${zoom < 15 ? "REGEXP_REPLACE(n, '(?<=.{30,})(.{0,30}).*', '\\2…')" : "n"} AS name,
              CASE WHEN ele <> '' THEN chr(10) || chr(8203) ELSE '' END AS elehack
            FROM (${getFeaturesSql(zoom, poiNameProjection)}) subq
          `}
        />
      ))}

      {/* TODO to feature_names to consider z_order */}
      <SqlLayer
        styleName="water_area_names"
        minZoom={10}
        bufferSize={1024}
        sql="
          SELECT
            osm_waterareas.name,
            osm_waterareas.geometry,
            osm_waterareas.type,
            osm_waterareas.area
          FROM
            osm_waterareas LEFT JOIN osm_feature_polys USING (osm_id)
          WHERE
            osm_feature_polys.osm_id IS NULL
            AND osm_waterareas.type <> 'riverbank'
            AND osm_waterareas.water NOT IN ('river', 'stream', 'canal', 'ditch')
        "
      />

      {/* TODO
      <SqlLayer
        styleName="feature_line_names"
        sql="SELECT geometry, name, type FROM osm_feature_lines WHERE type <> 'valley'"
        minZoom={14}
      /> */}

      <SqlLayer
        styleName="building_names"
        bufferSize={512}
        minZoom={17}
        sql="
          SELECT osm_buildings.name, osm_buildings.geometry
          FROM osm_buildings
          LEFT JOIN osm_landusages USING (osm_id)
          LEFT JOIN osm_feature_polys USING (osm_id)
          LEFT JOIN osm_features USING (osm_id)
          LEFT JOIN osm_place_of_worships USING (osm_id)
          LEFT JOIN osm_sports USING (osm_id)
          LEFT JOIN osm_ruins USING (osm_id)
          LEFT JOIN osm_towers USING (osm_id)
          LEFT JOIN osm_shops USING (osm_id)
          WHERE
            osm_buildings.type <> 'no'
              AND osm_landusages.osm_id IS NULL
              AND osm_feature_polys.osm_id IS NULL
              AND osm_features.osm_id IS NULL
              AND osm_place_of_worships.osm_id IS NULL
              AND osm_sports.osm_id IS NULL
              AND osm_ruins.osm_id IS NULL
              AND osm_towers.osm_id IS NULL
              AND osm_shops.osm_id IS NULL
          ORDER BY osm_buildings.osm_id
        "
      />

      <SqlLayer
        styleName="protected_area_names"
        bufferSize={1024}
        minZoom={8}
        sql="SELECT type, name, geometry FROM osm_protected_areas"
      />

      <SqlLayer
        styleName="landcover_names"
        minZoom={12}
        bufferSize={1024}
        sql="
          SELECT
            osm_landusages.geometry, osm_landusages.name, osm_landusages.area,
            osm_landusages.type IN ('forest', 'wood', 'scrub', 'heath', 'grassland', 'scree', 'meadow', 'fell', 'wetland') AS natural
          FROM
            osm_landusages
          LEFT JOIN
            z_order_landuse USING (type)
          LEFT JOIN
            osm_feature_polys USING (osm_id)
          LEFT JOIN
            osm_sports on osm_landusages.osm_id = osm_sports.osm_id AND osm_sports.type IN ('soccer', 'tennis', 'basketball') -- NOTE filtering some POIs (hacky because it affects also lower zooms)
          WHERE
            osm_feature_polys.osm_id IS NULL AND osm_sports.osm_id IS NULL AND osm_landusages.geometry && !bbox!
          ORDER BY
            z_order, osm_feature_polys.osm_id
          "
      />

      <SqlLayer
        styleName="locality_names"
        minZoom={15}
        bufferSize={1024}
        sql="SELECT name, type, geometry FROM osm_places WHERE type = 'locality' ORDER BY osm_id"
      />

      <SqlLayer
        styleName="housenumbers"
        minZoom={18}
        bufferSize={256}
        sql={`
          SELECT COALESCE(NULLIF("addr:streetnumber", ''), NULLIF("addr:housenumber", ''), NULLIF("addr:conscriptionnumber", '')) AS housenumber, geometry
          FROM osm_housenumbers
          WHERE geometry && !bbox!
        `}
      />
      <SqlLayer
        styleName="highway_names"
        minZoom={15}
        bufferSize={1024}
        sql="
          SELECT name, ST_LineMerge(ST_Collect(geometry)) AS geometry, type
          FROM osm_roads
          WHERE geometry && !bbox! AND name <> ''
          GROUP BY z_order, name, type
          ORDER BY z_order DESC"
      />

      <SqlLayer
        styleName="route_names"
        minZoom={14}
        bufferSize={2048} // NOTE probably must be same bufferSize AS routes
        sql={getRoutesQuery()}
      />

      <SqlLayer
        styleName="aerialway_names"
        minZoom={16}
        bufferSize={1024}
        sql="SELECT geometry, name, type FROM osm_aerialways"
      />

      <SqlLayer
        styleName="water_line_names"
        minZoom={12}
        maxZoom={13}
        bufferSize={1024}
        // `SELECT ${process.env.FM_CUSTOM_SQL || ''} geometry, name, type FROM osm_waterways WHERE type = 'river' AND name <> ''`,
        sql={`
          SELECT ${process.env.FM_CUSTOM_SQL || ""} ST_LineMerge(ST_Collect(geometry)) AS geometry, name, type
          FROM osm_waterways
          WHERE geometry && !bbox! AND type = 'river' AND name <> ''
          GROUP BY name, type
        `}
      />

      <SqlLayer
        styleName="water_line_names"
        sql={`
          SELECT ${process.env.FM_CUSTOM_SQL || ""} ST_LineMerge(ST_Collect(geometry)) AS geometry, name, type
          FROM osm_waterways WHERE geometry && !bbox! AND name <> ''
          GROUP BY name, type
        `}
        // `SELECT ${process.env.FM_CUSTOM_SQL || ''} geometry, name, type FROM osm_waterways WHERE name <> ''`,
        minZoom={14}
        bufferSize={1024}
      />

      <SqlLayer styleName="fixmes" sql="SELECT geometry FROM osm_fixmes" minZoom={14} />

      <SqlLayer
        styleName="valleys_ridges"
        minZoom={13}
        clearLabelCache
        bufferSize={1024}
        sql="SELECT geometry, name, 0.8 AS offset_factor FROM osm_feature_lines WHERE type = 'valley' AND name <> ''"
      />

      <SqlLayer
        styleName="valleys_ridges"
        minZoom={13}
        clearLabelCache
        bufferSize={1024}
        sql="SELECT geometry, name, 0 AS offset_factor FROM osm_feature_lines WHERE type = 'ridge' AND name <> ''"
      />

      <SqlLayer
        styleName="placenames"
        clearLabelCache
        bufferSize={1024}
        minZoom={15}
        sql="SELECT name, type, geometry FROM osm_places WHERE type <> 'locality' AND geometry && !bbox! ORDER BY z_order DESC, osm_id"
      />

      {format !== "svg" && format !== "pdf" && (
        <StyledLayer styleName="crop" srs="+init=epsg:4326" compOp="dst-in">
          <DatasourceEx params={{ type: "geojson", file: "limit.geojson" }} />
        </StyledLayer>
      )}

      {/*TODO
        if (custom) {
          for (const style of custom.styles) {
            map.mapEle.ele(style);
          }

          for (const layer of custom.layers) {
            map.layer(
              layer.styles,
              {
                type: "geojson",
                inline: JSON.stringify(layer.geojson),
              },
              { srs: "+init=epsg:4326" }
            );
          }
        }
      */}
    </>
  );
}
