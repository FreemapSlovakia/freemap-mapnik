/* eslint-disable indent */

import config from "config";
import { Map, MarkersSymbolizer, Style, TextSymbolizer } from "jsxnik/mapnikConfig";
import { serialize } from "jsxnik/serialize";
import { AerialwayNames } from "./AerialwayNames";
import { Aerialways } from "./Aerialways";
import { Aeroways } from "./Aeroways";
import { Barrierways } from "./Barrierways";
import { Borders } from "./Borders";
import { BuildingNames } from "./BuildingNames";
import { Buildings } from "./Buildings";
import { colors } from "./colors";
import { Crop } from "./Crop";
import { Custom } from "./Custom";
import { Cutlines } from "./Cutlines";
import { DatasourceEx } from "./DatasourceEx";
import { Embankments } from "./Embankments";
import { FeatureLines } from "./FeatureLines";
import { FeatureLinesMaskable } from "./FeatureLinesMaskable";
import { Fixmes } from "./Fixmes";
import { font } from "./fontFactory";
import { FontSets } from "./FontSets";
import { Geonames } from "./Geonames";
import { HighwayNames } from "./HighwayNames";
import { Highways } from "./Highways";
import { Housenumbers } from "./Housenumbers";
import { Landcover } from "./Landcover";
import { LandcoverNames } from "./LandcoverNames";
import { Legend, Props as LegendProps } from "./Legend";
import { LocalityNames } from "./LocalityNames";
import { MilitaryAreas } from "./MilitaryAreas";
import { Pipelines } from "./Pipelines";
import { Placements } from "./Placements";
import { Placenames as Placenames2, Placenames2 as Placenames1 } from "./Placenames";
import { PoiNames, Pois } from "./pois";
import { ProtectedAreaNames } from "./ProtectedAreaNames";
import { ProtectedAreas } from "./ProtectedAreas";
import { RouteNames, RoutesLayer } from "./routes";
import { RuleEx } from "./RuleEx";
import { Sea } from "./Sea";
import { ShadingAndCountours } from "./ShadingAndContours";
import { SolarPowerPlants } from "./SolarPowerPlants";
import { SqlLayer } from "./SqlLayer";
import { setLayersEnabled } from "./StyledLayer";
import { Trees } from "./Trees";
import { seq } from "./utils";
import { ValleysRidges } from "./ValleysRidges";
import { WaterArea } from "./WaterArea";
import { WaterAreaNames } from "./WaterAreaNames";
import { WaterLine } from "./WaterLine";
import { WaterLineNames } from "./WaterLineNames";

const dbParams = config.get("db") as Record<string, string>;
const contoursCfg = config.get("mapFeatures.contours") as boolean;
const shadingCfg = config.get("mapFeatures.shading") as boolean;
const hikingTrailsCfg = config.get("mapFeatures.hikingTrails") as boolean;
const bicycleTrailsCfg = config.get("mapFeatures.bicycleTrails") as boolean;
const horseTrailsCfg = config.get("mapFeatures.horseTrails") as boolean;
const skiTrailsCfg = config.get("mapFeatures.skiTrails") as boolean;
const dumpXml = config.get("dumpXml") as boolean;

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

type Params = {
  features?: {
    shading: boolean;
    contours: boolean;
    hikingTrails: boolean;
    bicycleTrails: boolean;
    skiTrails: boolean;
    horseTrails: boolean;
  };
  custom?: {
    styles: string[];
    layers: { styles: string[]; geojson: string }[];
  };
  legendLayers?: LegendProps["legendLayers"];
  format?: string;
};

export function generateFreemapStyle(params?: Parameters<typeof generateFreemapStyleInt>[0]) {
  if (params?.legendLayers) {
    try {
      setLayersEnabled(false);

      return generateFreemapStyleInt(params);
    } finally {
      setLayersEnabled(true);
    }
  }

  return generateFreemapStyleInt(params);
}

function generateFreemapStyleInt({
  features: { shading, contours, ...routeProps } = {
    shading: shadingCfg,
    contours: contoursCfg,
    hikingTrails: hikingTrailsCfg,
    bicycleTrails: bicycleTrailsCfg,
    skiTrails: skiTrailsCfg,
    horseTrails: horseTrailsCfg,
  },
  custom,
  legendLayers,
  format,
}: Params = {}) {
  if (legendLayers) {
    try {
      setLayersEnabled(false);

      // ...
    } finally {
      setLayersEnabled(true);
    }
  }

  return serialize(
    <Map
      backgroundColor={legendLayers ? undefined : colors.water}
      srs="+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs +over"
    >
      <FontSets />

      {!legendLayers && <DatasourceEx name="db" params={dbParams} />}

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

        <Pois />

        {/* // rest texts
          <RuleEx minZoom={16}>
            <TextSymbolizer ({ ...fontDfltWrap }, nameWithEle)
          </RuleEx>
        */}
      </Style>

      <Style name="feature_names">
        <PoiNames />
      </Style>

      <Style name="feature_poly_names">
        {seq(12, 16).map((z) => (
          <RuleEx filter={`[area] > ${2400000 / (1 << (2 * (z - 10)))}`} minZoom={z} maxZoom={z}>
            <TextSymbolizer
              {...font().wrap().end({ placement: "interior", placementType: "list", fill: colors.areaLabel })}
            >
              [name]
            </TextSymbolizer>
          </RuleEx>
        ))}

        <RuleEx minZoom={17}>
          <TextSymbolizer
            {...font().wrap().end({ placement: "interior", placementType: "list", fill: colors.areaLabel })}
          >
            [name]
            <Placements />
          </TextSymbolizer>
        </RuleEx>
      </Style>

      <Sea />

      <Landcover />

      <Cutlines />

      <WaterArea />

      <WaterLine />

      <Trees />

      <Pipelines />

      <FeatureLines />

      <FeatureLinesMaskable shading={shading} />

      <Embankments />

      <Highways />

      <Aerialways />

      {/* <SqlLayer
        styleName="highways"
        sql="SELECT geometry, type, tracktype, class, service, bridge, tunnel, oneway FROM osm_roads_gen0 ORDER BY z_order"
        maxZoom={13}
      /> */}

      <Aeroways />

      <SolarPowerPlants />

      <Buildings />

      <Barrierways />

      {(shading || contours) && <ShadingAndCountours shading={shading} contours={contours} />}

      <ProtectedAreas />

      <Borders />

      <MilitaryAreas />

      {/* .sqlLayer(['routeGlows', 'routes'], */}

      <RoutesLayer {...routeProps} />

      <Geonames />

      <Placenames1 />

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

      <WaterAreaNames />

      {/* TODO
      <SqlLayer
        styleName="feature_line_names"
        sql="SELECT geometry, name, type FROM osm_feature_lines WHERE type <> 'valley'"
        minZoom={14}
      /> */}

      <BuildingNames />

      <ProtectedAreaNames />

      <LandcoverNames />

      <LocalityNames />

      <Housenumbers />

      <HighwayNames />

      <RouteNames {...routeProps} />

      <AerialwayNames />

      <WaterLineNames />

      <Fixmes />

      <ValleysRidges />

      <Placenames2 />

      {!legendLayers && format !== "svg" && format !== "pdf" && <Crop />}

      {custom && <Custom {...custom} />}

      {legendLayers && <Legend legendLayers={legendLayers} />}
    </Map>
  );
}

export const mapnikConfig = generateFreemapStyle();

if (dumpXml) {
  console.log("Mapnik config:", mapnikConfig);
}
