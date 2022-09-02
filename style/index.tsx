/* eslint-disable indent */

import { serialize } from "jsxnik/serialize";
import config from "config";
import { font } from "./fontFactory";
import { colors, hsl } from "./colors";
import { Routes } from "./Routes";
import {
  Font,
  FontSet,
  Format,
  LinePatternSymbolizer,
  LineSymbolizer,
  Map,
  MarkersSymbolizer,
  Placement,
  PolygonPatternSymbolizer,
  PolygonSymbolizer,
  RasterSymbolizer,
  Rule,
  Style,
  TextSymbolizer,
} from "jsxnik/mapnikConfig";
import { Highways } from "./Highways";
import { RuleEx } from "./RuleEx";
import { BorderedPolygonSymbolizer } from "./BorderedPolygonSymbolizer";
import { seq } from "./utils";
import { Layers } from "./layers";
import { DatasourceEx } from "./DatasourceEx";

const dbParams = config.get("db") as Record<string, string>;
const contoursCfg = config.get("mapFeatures.contours") as boolean;
const shadingCfg = config.get("mapFeatures.shading") as boolean;
const hikingTrailsCfg = config.get("mapFeatures.hikingTrails") as boolean;
const bicycleTrailsCfg = config.get("mapFeatures.bicycleTrails") as boolean;
const horseTrailsCfg = config.get("mapFeatures.horseTrails") as boolean;
const skiTrailsCfg = config.get("mapFeatures.skiTrails") as boolean;
const dumpXml = config.get("dumpXml") as boolean;

const N = false;
const Y = true;
const NN = null;

// minIconZoom, minTextZoom, withEle, natural, types/icon, textOverrides
const pois: [number, number | null, boolean, boolean, string | string[], {}?][] = [
  [12, 12, N, N, "aerodrome"],
  [12, 12, Y, N, "guidepost", { icon: "guidepost_x", font: { fontsetName: "bold", dy: -8 }, maxZoom: 12 }],
  [13, 13, Y, N, "guidepost", { icon: "guidepost_xx", font: { fontsetName: "bold" }, maxZoom: 13 }],
  [14, 14, Y, N, "guidepost", { icon: "guidepost_xx", font: { fontsetName: "bold" } }],
  [10, 10, Y, Y, "peak1", { icon: "peak", font: { size: 13, dy: -8 } }],
  [11, 11, Y, Y, "peak2", { icon: "peak", font: { size: 13, dy: -8 } }],
  [12, 12, Y, Y, "peak3", { icon: "peak", font: { size: 13, dy: -8 } }],
  [13, 13, Y, Y, "peak", { font: { size: 13, dy: -8 } }],

  [14, 14, N, N, "castle"],
  [14, 15, Y, Y, "arch"],
  [14, 15, Y, Y, "cave_entrance"],
  [14, 15, Y, Y, "spring", { font: { fill: colors.waterLabel } }],
  [14, 15, Y, Y, "refitted_spring", { font: { fill: colors.waterLabel } }],
  [14, 15, Y, Y, "drinking_spring", { font: { fill: colors.waterLabel } }],
  [14, 15, Y, Y, "not_drinking_spring", { font: { fill: colors.waterLabel } }],
  [14, 15, Y, Y, "refitted_drinking_spring", { font: { fill: colors.waterLabel } }],
  [14, 15, Y, Y, "refitted_not_drinking_spring", { font: { fill: colors.waterLabel } }],
  [14, 15, Y, Y, "hot_spring", { font: { fill: colors.waterLabel } }],
  [14, 15, Y, Y, "waterfall", { font: { fill: colors.waterLabel } }],
  [14, 15, N, N, ["drinking_water", "water_point"], { font: { fill: colors.waterLabel } }],
  [14, 15, N, N, "water_well", { font: { fill: colors.waterLabel } }],
  [14, 15, Y, N, "monument"],
  [14, 15, Y, Y, "viewpoint"],
  [14, 15, Y, N, ["mine", "adit", "mineshaft"]],
  [14, 15, Y, N, "disused_mine"],
  [14, 15, Y, N, "hotel"],
  [14, 15, Y, N, "chalet"],
  [14, 15, Y, N, "hostel"],
  [14, 15, Y, N, "motel"],
  [14, 15, Y, N, "guest_house"],
  [14, 15, Y, N, "apartment"],
  [14, 15, Y, N, "wilderness_hut"],
  [14, 15, Y, N, "alpine_hut"],
  [14, 15, Y, N, "camp_site"],
  [14, 15, N, N, "attraction"],
  [14, 15, N, N, "hospital"],
  [14, 15, N, N, "townhall"],
  [14, 15, N, N, ["church", "chapel", "cathedral", "temple", "basilica"]],
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
  [14, 14, N, N, ["kindergarten", "recycling"], { font: { fill: colors.areaLabel }, icon: null }], // has no icon yet - render as area name

  [15, NN, Y, N, "guidepost_noname", { icon: "guidepost_x" }],
  [15, 15, Y, Y, "saddle", { font: { size: 13, dy: -8 } }],

  [15, 16, N, N, "ruins"],
  [15, 16, N, N, "chimney"],
  [15, 16, N, N, "fire_station"],
  [15, 16, N, N, "community_centre"],
  [15, 16, N, N, "police"],
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
  [15, 16, N, N, "pharmacy"],
  [15, 16, N, N, "cinema"],
  [15, 16, N, N, "theatre"],
  [15, 16, N, N, "memorial"],
  [15, 16, N, N, "pub"],
  [15, 16, N, N, "cafe"],
  [15, 16, N, N, "bar"],
  [15, 16, N, N, "restaurant"],
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
  [15, 15, N, Y, "tree"],
  [15, 16, N, N, "bird_hide"],
  [15, 16, N, N, "dam", { font: { fill: colors.waterLabel } }],
  [15, 16, N, N, "weir", { font: { fill: colors.waterLabel } }],
  [15, 15, N, N, ["school", "university", "college"], { font: { fill: colors.areaLabel }, icon: null }], // has no icon yet - render as area name

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
  [16, 17, N, N, "playground"],
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
  [17, 18, N, N, "beehive", "apiary"],
  [17, NN, N, N, ["lift_gate", "swing_gate"]],
  [17, NN, N, N, "ford"],

  [18, 19, N, N, "post_box"],
  [18, 19, N, N, "telephone"],
  [18, NN, N, N, "gate"],
  [18, NN, N, N, "waste_disposal"],
];

function Placements() {
  return (
    <>
      {[3, -3, 6, -6, 9, -9].map((off) => (
        <Placement dy={off} />
      ))}
    </>
  );
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
    styles: unknown; // TODO
    layers: unknown; // TODO
  };
  legendLayers?: {
    styles: string;
    geojson: unknown; // TODO GeoJSON
  }[];
  format?: string;
};

export function generateFreemapStyle({
  features: { shading, contours, hikingTrails, bicycleTrails, skiTrails, horseTrails } = {
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
  return serialize(
    <Map
      backgroundColor={legendLayers ? undefined : colors.water}
      srs="'+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs +over'"
    >
      <FontSet name="regular">
        <Font faceName="PT Sans Regular" />
        <Font faceName="Fira Sans Condensed Regular" />
        <Font faceName="Noto Sans Regular" />
      </FontSet>

      <FontSet name="italic">
        <Font faceName="PT Sans Italic" />
        <Font faceName="Fira Sans Condensed Italic" />
        <Font faceName="Noto Sans Italic" />
      </FontSet>

      <FontSet name="bold">
        <Font faceName="PT Sans Bold" />
        <Font faceName="Fira Sans Condensed Bold" />
        <Font faceName="Noto Sans Bold" />
      </FontSet>

      <FontSet name="narrow bold">
        <Font faceName="PT Sans Narrow Bold" />
        <Font faceName="Fira Sans Extra Condensed Bold" />
        <Font faceName="Noto Sans Bold" />
      </FontSet>

      <DatasourceEx name="db" params={dbParams} />

      <Style name="sea">
        <Rule>
          <BorderedPolygonSymbolizer color="white" />
        </Rule>
      </Style>

      <Style name="landcover">
        <RuleEx type={["dam", "weir"]}>
          {/* <PolygonPatternSymbolizer file='images/fell.svg' alignment='global' opacity: 0.5 }) /> */}
          <BorderedPolygonSymbolizer color={hsl(0, 0, 70)} />
        </RuleEx>

        <RuleEx type={["forest", "wood"]}>
          <BorderedPolygonSymbolizer color={colors.forest} />
        </RuleEx>

        <RuleEx type="farmland">
          <BorderedPolygonSymbolizer color={colors.farmland} />
        </RuleEx>

        <RuleEx type={["meadow", "park", "cemetery", "village_green"]}>
          <BorderedPolygonSymbolizer color={colors.grassy} />
        </RuleEx>

        <RuleEx type={["fell", "grassland", "grass"]}>
          <BorderedPolygonSymbolizer color={colors.grassy} />
        </RuleEx>

        <RuleEx type="heath">
          <BorderedPolygonSymbolizer color={colors.heath} />
        </RuleEx>

        <RuleEx type="landfill">
          <BorderedPolygonSymbolizer color={colors.landfill} />
        </RuleEx>

        <RuleEx type="brownfield">
          <BorderedPolygonSymbolizer color={colors.brownfield} />
        </RuleEx>

        <RuleEx type={["residential", "living_street"]}>
          <BorderedPolygonSymbolizer color={hsl(0, 0, 88)} />
        </RuleEx>

        <RuleEx type="farmyard">
          <BorderedPolygonSymbolizer color={colors.farmyard} />
        </RuleEx>

        <RuleEx type="allotments">
          <BorderedPolygonSymbolizer color={colors.allotments} />
        </RuleEx>

        <RuleEx type={["industrial", "wastewater_plant"]}>
          <BorderedPolygonSymbolizer color={hsl(0, 0, 80)} />
        </RuleEx>

        <RuleEx type={["commercial", "retail"]}>
          <BorderedPolygonSymbolizer color={hsl(320, 40, 85)} />
        </RuleEx>

        <RuleEx type="cemetery">
          <PolygonPatternSymbolizer file="images/grave.svg" alignment="local" opacity={0.5} />
        </RuleEx>

        <RuleEx type="bare_rock">
          <PolygonPatternSymbolizer file="images/bare_rock.svg" alignment="global" opacity={0.2} />
        </RuleEx>

        <RuleEx type="vineyard">
          <BorderedPolygonSymbolizer color={colors.orchard} />
          <PolygonPatternSymbolizer file="images/grapes.svg" alignment="global" opacity={0.2} />
        </RuleEx>

        <RuleEx type="garden">
          <PolygonSymbolizer fill={colors.orchard} />
          <LineSymbolizer stroke={hsl(0, 0, 0)} strokeWidth={1} strokeOpacity={0.2} />
        </RuleEx>

        <RuleEx type="orchard">
          <BorderedPolygonSymbolizer color={colors.orchard} />
          <PolygonPatternSymbolizer file="images/orchard.svg" alignment="global" opacity={0.2} />
        </RuleEx>

        <RuleEx type="beach">
          <BorderedPolygonSymbolizer color={hsl(60, 90, 85)} />
          <PolygonPatternSymbolizer file="images/sand.svg" alignment="global" opacity={0.25} />
        </RuleEx>

        <RuleEx type="scrub">
          <BorderedPolygonSymbolizer color={colors.scrub} />
          <PolygonPatternSymbolizer file="images/scrub.svg" alignment="global" opacity={0.2} />
        </RuleEx>

        <RuleEx type="plant_nursery">
          <BorderedPolygonSymbolizer color={colors.scrub} />
          <PolygonPatternSymbolizer file="images/plant_nursery.svg" alignment="global" opacity={0.2} />
        </RuleEx>

        <RuleEx type="quarry">
          <BorderedPolygonSymbolizer color={hsl(0, 0, 70)} />
          <PolygonPatternSymbolizer file="images/quarry.svg" />
        </RuleEx>

        <RuleEx type="scree">
          <BorderedPolygonSymbolizer color={hsl(0, 0, 90)} />
          <PolygonPatternSymbolizer file="images/scree.svg" opacity={0.33} />
        </RuleEx>

        <RuleEx type="clearcut">
          <BorderedPolygonSymbolizer color={hsl(74, 29, 68)} />
          <PolygonPatternSymbolizer file="images/stump.svg" opacity={0.33} />
        </RuleEx>

        <RuleEx type="bog">
          <BorderedPolygonSymbolizer color={colors.heath} />
          <PolygonPatternSymbolizer file="images/wetland.svg" alignment="global" />
          <PolygonPatternSymbolizer file="images/bog.svg" alignment="global" />
        </RuleEx>

        <RuleEx type="mangrove">
          <BorderedPolygonSymbolizer color={colors.scrub} />
          <PolygonPatternSymbolizer file="images/wetland.svg" alignment="global" />
          <PolygonPatternSymbolizer file="images/mangrove.svg" alignment="global" />
        </RuleEx>

        <RuleEx type="reedbed">
          <BorderedPolygonSymbolizer color={colors.grassy} />
          <PolygonPatternSymbolizer file="images/wetland.svg" alignment="global" />
          <PolygonPatternSymbolizer file="images/reedbed.svg" alignment="global" />
        </RuleEx>

        <RuleEx type={["marsh", "fen", "wet_meadow"]}>
          <BorderedPolygonSymbolizer color={colors.grassy} />
          <PolygonPatternSymbolizer file="images/wetland.svg" alignment="global" />
          <PolygonPatternSymbolizer file="images/marsh.svg" alignment="global" />
        </RuleEx>

        <RuleEx type="swamp">
          <BorderedPolygonSymbolizer color={colors.grassy} />
          <PolygonPatternSymbolizer file="images/wetland.svg" alignment="global" />
          <PolygonPatternSymbolizer file="images/swamp.svg" alignment="global" />
        </RuleEx>

        <RuleEx type="wetland">
          <PolygonPatternSymbolizer file="images/wetland.svg" alignment="global" />
        </RuleEx>

        <RuleEx type={["pitch", "playground", "golf_course", "track"]}>
          <PolygonSymbolizer fill={hsl(140, 50, 70)} />
          <LineSymbolizer stroke={hsl(140, 50, 40)} strokeWidth={1} />
        </RuleEx>

        <RuleEx type="parking">
          <PolygonSymbolizer fill={hsl(0, 33, 80)} />
          <LineSymbolizer stroke={hsl(0, 33, 65)} strokeWidth={1} />
        </RuleEx>

        <RuleEx type="bunker_silo">
          <PolygonSymbolizer fill={hsl(50, 34, 35)} />
          <LineSymbolizer stroke={hsl(50, 34, 20)} strokeWidth={1} />
        </RuleEx>
      </Style>

      <Style name="water_area">
        <RuleEx minZoom={8} maxZoom={13} filter="[tmp] = 1">
          <PolygonPatternSymbolizer file="images/temp_water.svg" alignment="local" transform="scale(0.5)" />
        </RuleEx>

        <RuleEx minZoom={14} filter="[tmp] = 1">
          <PolygonPatternSymbolizer file="images/temp_water.svg" alignment="local" />
        </RuleEx>

        <RuleEx minZoom={8} filter="[tmp] != 1">
          <BorderedPolygonSymbolizer color={colors.water} />
        </RuleEx>

        <RuleEx maxZoom={9} filter="[tmp] != 1">
          <PolygonSymbolizer fill={colors.water} />
        </RuleEx>
      </Style>

      <Style name="solar_power_plants">
        <RuleEx minZoom={12} maxZoom={14}>
          <PolygonPatternSymbolizer file="images/solar_small.svg" alignment="global" />
          <LineSymbolizer stroke={hsl(176, 153, 200)} strokeWidth={1} />
        </RuleEx>

        <RuleEx minZoom={12} maxZoom={14}>
          <PolygonPatternSymbolizer file="images/solar.svg" alignment="global" />
          <LineSymbolizer stroke={hsl(176, 153, 200)} strokeWidth={1} />
        </RuleEx>
      </Style>

      <Style name="water_line">
        <RuleEx minZoom={0} maxZoom={8} type="river">
          <LineSymbolizer stroke={colors.water} strokeWidth="pow(1.5, @zoom - 8)" />
        </RuleEx>

        <RuleEx minZoom={9} maxZoom={9} type="river">
          <LineSymbolizer stroke={colors.water} strokeWidth={1.5} />
        </RuleEx>

        <RuleEx minZoom={10} maxZoom={11} type="river">
          <LineSymbolizer
            stroke={colors.water}
            strokeWidth={2.2}
            strokeOpacity="1 - [tunnel] / 0.6"
            strokeDasharray="[dasharray]"
          />
        </RuleEx>

        <RuleEx minZoom={12} type="river">
          <LineSymbolizer
            stroke={colors.water}
            strokeWidth={2.2}
            strokeOpacity="1 - [tunnel] / 0.6"
            strokeDasharray="[dasharray]"
            smooth={0.5}
          />
        </RuleEx>

        <RuleEx minZoom={12} filter="[type] <> 'river'">
          <LineSymbolizer
            stroke={colors.water}
            strokeWidth={1.2}
            strokeOpacity="1 - [tunnel] / 0.6"
            strokeDasharray="[dasharray]"
            smooth={0.5}
          />
        </RuleEx>

        <RuleEx minZoom={14}>
          <MarkersSymbolizer file="images/waterway-arrow.svg" spacing={300} placement="line" />
        </RuleEx>
      </Style>

      <Style name="barrierways">
        <RuleEx minZoom={16}>
          <LineSymbolizer stroke={hsl(0, 100, 50)} strokeWidth={1} strokeDasharray="2,1" />
        </RuleEx>
      </Style>

      <Style name="aeroways">
        {(() => {
          const aeroBgLine = { stroke: hsl(240, 30, 40) };
          const aeroFgLine = { stroke: "white", strokeWidth: 1 };

          return (
            <>
              <RuleEx minZoom={11} maxZoom={11}>
                <LineSymbolizer {...aeroBgLine} strokeWidth={3} />
                <LineSymbolizer {...aeroFgLine} strokeWidth={0.5} strokeDasharray="3,3" />
              </RuleEx>

              <RuleEx minZoom={12} maxZoom={13}>
                <LineSymbolizer {...aeroBgLine} strokeWidth={5} />
                <LineSymbolizer {...aeroFgLine} strokeDasharray="4,4" />
              </RuleEx>

              <RuleEx minZoom={14}>
                <LineSymbolizer {...aeroBgLine} strokeWidth={8} />
                <LineSymbolizer {...aeroFgLine} strokeDasharray="6,6" />
              </RuleEx>
            </>
          );
        })()}
      </Style>

      <Style name="aerialways">
        <Rule>
          <LineSymbolizer strokeWidth={1} stroke="black" />
          <LineSymbolizer strokeWidth={5} stroke="black" strokeDasharray="1,25" />
        </Rule>
      </Style>

      <Style name="buildings">
        <RuleEx minZoom={13}>
          <PolygonSymbolizer fill={colors.building} />
        </RuleEx>
      </Style>

      <Style name="ruin_polys">
        <RuleEx minZoom={13}>
          <PolygonSymbolizer fill={colors.ruin} />
        </RuleEx>
      </Style>

      <Style name="protected_areas">
        <RuleEx minZoom={8} maxZoom={11} type="national_park">
          <LineSymbolizer stroke={hsl(120, 100, 31)} strokeWidth={3} strokeDasharray="25,7" strokeOpacity={0.8} />

          <PolygonPatternSymbolizer file="images/national_park_area.svg" alignment="global" opacity={0.4} />
        </RuleEx>

        <RuleEx minZoom={12} maxZoom={12} type="national_park">
          <PolygonPatternSymbolizer file="images/national_park_area.svg" alignment="global" opacity={0.2} />

          <LineSymbolizer stroke={hsl(120, 100, 31)} strokeWidth={4} strokeDasharray="25,7" strokeOpacity={0.4} />
        </RuleEx>

        <RuleEx minZoom={13} type="national_park">
          <LineSymbolizer stroke={hsl(120, 100, 31)} strokeWidth={4} strokeDasharray="25,7" strokeOpacity={0.4} />
        </RuleEx>

        <RuleEx minZoom={12} type={["protected_area", "nature_reserve"]}>
          <LinePatternSymbolizer file="images/protected_area.svg" />
        </RuleEx>
      </Style>

      <Style name="borders">
        <RuleEx maxZoom={10}>
          <LineSymbolizer
            stroke={hsl(278, 100, 50)}
            strokeWidth="0.5 + 6 * pow(1.4, @zoom - 11)"
            strokeLinejoin="round"
          />
        </RuleEx>

        <RuleEx minZoom={11}>
          <LineSymbolizer stroke={hsl(278, 100, 50)} strokeWidth={6} strokeLinejoin="round" />
        </RuleEx>
      </Style>

      <Style name="cutlines">
        {seq(12, 16).map((z) => (
          <RuleEx minZoom={z} maxZoom={z === 16 ? undefined : z} type="cutline">
            <LineSymbolizer stroke={colors.scrub} strokeWidth={2 + 0.33 * Math.pow(2, z - 12)} />
          </RuleEx>
        ))}
      </Style>

      <Style name="pipelines">
        <RuleEx minZoom={11} filter='[location] = "overground" or [location] = "overhead" or [location] = ""'>
          <LineSymbolizer stroke={hsl(0, 0, 50)} strokeWidth={2} strokeLinejoin="round" />

          <LineSymbolizer
            stroke={hsl(0, 0, 50)}
            strokeWidth={4}
            strokeLinejoin="round"
            strokeDasharray="0,15,1.5,1.5,1.5,1"
          />
        </RuleEx>

        <RuleEx minZoom={15} filter='[location] = "underground" or [location] = "underwater"'>
          <LineSymbolizer stroke={hsl(0, 0, 50)} strokeWidth={2} strokeLinejoin="round" strokeOpacity={0.33} />

          <LineSymbolizer
            stroke={hsl(0, 0, 50)}
            strokeWidth={4}
            strokeLinejoin="round"
            strokeDasharray="0,15,1.5,1.5,1.5,1"
            strokeOpacity={0.33}
          />
        </RuleEx>
      </Style>

      <Style name="feature_lines_maskable">
        <RuleEx minZoom={13} type="cliff">
          <LinePatternSymbolizer file="images/cliff.svg" />

          <LineSymbolizer stroke={colors.areaLabel} strokeWidth={1} />
        </RuleEx>

        <RuleEx minZoom={14} type="earth_bank">
          <LinePatternSymbolizer file="images/earth_bank.svg" />
        </RuleEx>

        <RuleEx minZoom={16} type="dyke">
          <LinePatternSymbolizer file="images/dyke.svg" />
        </RuleEx>

        <RuleEx minZoom={16} type="embankment">
          <LinePatternSymbolizer file="images/embankment-half.svg" />
        </RuleEx>

        <RuleEx minZoom={16} type="gully">
          <LinePatternSymbolizer file="images/gully.svg" />
        </RuleEx>
      </Style>

      <Style name="feature_lines">
        <RuleEx minZoom={16} type="weir">
          <LineSymbolizer stroke={hsl(0, 0, 40)} strokeWidth={3} strokeDasharray="9, 3" />
        </RuleEx>

        <RuleEx minZoom={16} type="dam">
          <LineSymbolizer stroke={hsl(0, 0, 40)} strokeWidth={3} />
        </RuleEx>

        <RuleEx minZoom={13} type="line">
          <LineSymbolizer stroke="black" strokeWidth={1} strokeOpacity={0.5} />
        </RuleEx>

        <RuleEx minZoom={14} type="minor_line">
          <LineSymbolizer stroke={hsl(0, 0, 50)} strokeWidth={1} strokeOpacity={0.5} />
        </RuleEx>

        {seq(13, 19).map((z) => (
          <RuleEx minZoom={z} maxZoom={z === 16 ? undefined : z} type="tree_row">
            <LinePatternSymbolizer file="images/tree2.svg" transform={`scale(${(2 + Math.pow(2, z - 15)) / 4})`} />
          </RuleEx>
        ))}
      </Style>

      {/* TODO don't render on hi-res hillshading */}
      <Style name="embankments">
        <Rule>
          <LinePatternSymbolizer file="images/embankment.svg" />{" "}
        </Rule>
      </Style>

      {/* hillshading helper for mask */}
      <Style name="mask">
        <Rule>
          <RasterSymbolizer scaling="bilinear" opacity={1.0} />
        </Rule>
      </Style>

      <Style name="hillshade">
        <RuleEx /*minZoom={8}*/ maxZoom={8}>
          <RasterSymbolizer scaling="lanczos" opacity={1.0} />
        </RuleEx>

        <RuleEx minZoom={9} maxZoom={9}>
          <RasterSymbolizer scaling="lanczos" opacity={0.9} />
        </RuleEx>

        <RuleEx minZoom={10} maxZoom={11}>
          <RasterSymbolizer scaling="lanczos" opacity={0.75} />
        </RuleEx>

        <RuleEx minZoom={12} maxZoom={12}>
          <RasterSymbolizer scaling="lanczos" opacity={0.65} />
        </RuleEx>

        <RuleEx minZoom={13} maxZoom={13}>
          <RasterSymbolizer scaling="bilinear" opacity={0.55} />
        </RuleEx>

        <RuleEx minZoom={14} maxZoom={14}>
          <RasterSymbolizer scaling="bilinear" opacity={0.65} />
        </RuleEx>

        <RuleEx minZoom={15}>
          <RasterSymbolizer scaling="bilinear" opacity={0.8} />
        </RuleEx>
      </Style>

      <Style name="military_areas">
        <RuleEx minZoom={10}>
          <LineSymbolizer stroke={hsl(0, 96, 39)} strokeWidth={3} strokeDasharray="25,7" strokeOpacity={0.8} />
        </RuleEx>

        <RuleEx minZoom={10} maxZoom={13}>
          <PolygonPatternSymbolizer file="images/military_area.svg" alignment="global" opacity={0.5} />
        </RuleEx>

        <RuleEx minZoom={14}>
          <PolygonPatternSymbolizer file="images/military_area.svg" alignment="global" opacity={0.2} />
        </RuleEx>
      </Style>

      <Style name="trees">
        {seq(16, 19).map((z) => {
          const size = 2 + Math.pow(2, z - 15);

          return (
            <RuleEx minZoom={z} maxZoom={z}>
              <MarkersSymbolizer
                file="images/tree2.svg"
                width={size}
                height={size}
                fill={colors.forest}
                allowOverlap
                ignorePlacement
                transform='scale(1 - ([type] = "shrub") * 0.5, 1 - ([type] = "shrub") * 0.5)'
              />
            </RuleEx>
          );
        })}
      </Style>

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
          // if (typeof minIcoZoom !== "number") {
          //   return null;
          // }

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
                  extra.icon && (
                    <MarkersSymbolizer
                      // TODO find out a way to make it red if private
                      multiPolicy="whole"
                      file={`images/${extra.icon || (Array.isArray(type) ? type[0] : type)}.svg`}
                      opacity='1 - ([access] = "private" || [access] = "no") * 0.66'
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

      <Style name="locality_names">
        <RuleEx minZoom={15} type="locality">
          <TextSymbolizer
            {...font()
              .wrap()
              .end({
                fill: hsl(0, 0, 40),
                size: 11,
                haloRadius: 1.5,
                haloOpacity: 0.2,
                placementType: "list",
              })}
          >
            [name]
            <Placements />
          </TextSymbolizer>
        </RuleEx>
      </Style>

      <Style name="feature_names">
        {pois.map(([, minTextZoom, withEle, natural, type, extra = {} as any]) => {
          const fnt = font()
            .wrap()
            .if(natural, (f: any) => f.nature())
            .end({ placementType: "list", dy: -10, ...(extra.font || {}) });

          return (
            <RuleEx type={type} minZoom={minTextZoom ?? undefined} maxZoom={extra.maxZoom}>
              <TextSymbolizer {...fnt}>
                [name]
                {withEle && (
                  <>
                    <Format size={fnt.size * 0.92}>[elehack]</Format>
                    <Format size={fnt.size * 0.8}>[ele]</Format>
                  </>
                )}
                <Placement dy={extra?.font?.dy ? -extra.font.dy : 10} />
              </TextSymbolizer>
            </RuleEx>
          );
        })}
      </Style>

      <Style name="protected_area_names">
        {[8, 9, 10].map((z) => (
          <RuleEx minZoom={z} maxZoom={z} type="national_park">
            <TextSymbolizer
              {...font()
                .nature()
                .wrap()
                .end({
                  size: 9 + Math.pow(2, z - 7),
                  fill: hsl(120, 100, 25),
                  haloFill: "white",
                  haloRadius: 1.5,
                  placement: "interior",
                  placementType: "list",
                })}
            >
              [name]
              <Placements />
            </TextSymbolizer>
          </RuleEx>
        ))}

        <RuleEx minZoom={12} type={["protected_area", "nature_reserve"]}>
          <TextSymbolizer
            {...font()
              .nature()
              .wrap()
              .end({
                fill: hsl(120, 100, 25),
                haloFill: "white",
                haloRadius: 1.5,
                placement: "interior",
                placementType: "list",
              })}
          >
            [name]
            <Placements />
          </TextSymbolizer>
        </RuleEx>
      </Style>

      <Style name="water_area_names">
        {seq(10, 16).map((z) => (
          <RuleEx filter={`[area] > ${800000 / (1 << (2 * (z - 10)))}`} minZoom={z} maxZoom={z}>
            <TextSymbolizer {...font().water().wrap().end({ placement: "interior", placementType: "list" })}>
              [name]
              <Placements />
            </TextSymbolizer>
          </RuleEx>
        ))}

        <RuleEx minZoom={17}>
          <TextSymbolizer {...font().water().wrap().end({ placement: "interior", placementType: "list" })}>
            [name]
            <Placements />
          </TextSymbolizer>
        </RuleEx>
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

      <Style name="landcover_names">
        {[false, true].map((natural) => {
          const s = natural ? { fill: hsl(120, 100, 25), fontsetName: "italic" } : { fill: colors.areaLabel };

          return seq(12, 17).map((z) => (
            <RuleEx
              filter={
                `(${natural ? "[natural]" : "not ([natural])"})` +
                (z === 17 ? "" : ` and [area] > ${2400000 / (1 << (2 * (z - 10)))}`)
              }
              minZoom={z}
              maxZoom={z === 17 ? undefined : z}
            >
              <TextSymbolizer
                {...font()
                  .wrap()
                  .end({ placement: "interior", placementType: "list", ...s })}
              >
                [name]
                <Placements />
              </TextSymbolizer>
            </RuleEx>
          ));
        })}
      </Style>

      <Style name="building_names">
        <RuleEx minZoom={17}>
          <TextSymbolizer {...font().wrap().end({ placement: "interior", placementType: "list" })}>
            [name]
            <Placements />
          </TextSymbolizer>
        </RuleEx>
      </Style>

      <Style name="housenumbers">
        <Rule>
          <TextSymbolizer {...font().end({ placement: "interior", size: 8, haloOpacity: 0.5, fill: colors.areaLabel })}>
            [housenumber]
          </TextSymbolizer>
        </Rule>
      </Style>

      <Style name="highway_names">
        <RuleEx minZoom={15}>
          <TextSymbolizer {...font().line().end({ fill: colors.track })}>[name]</TextSymbolizer>
        </RuleEx>
      </Style>

      <Style name="aerialway_names">
        <Rule>
          <TextSymbolizer {...font().line().end({ fill: "black", dy: 6 })}>[name]</TextSymbolizer>
        </Rule>
      </Style>

      <Style name="valleys_ridges">
        {seq(13, 17).map((z) => {
          const opacity = 0.5 - (z - 13) / 10;
          const cs = 3 + Math.pow(2.5, z - 12);
          const size = 10 + Math.pow(2.5, z - 12);
          return (
            <RuleEx minZoom={z} maxZoom={z}>
              <TextSymbolizer
                {...font()
                  .nature()
                  .line(200)
                  .end({
                    size,
                    characterSpacing: cs * 3,
                    haloRadius: 1.5,
                    haloOpacity: opacity * 0.9,
                    opacity,
                    lineSpacing: `[offset_factor] * ${6 + 3 * Math.pow(2.5, z - 12)}`, // this is to simulate dy adjusted to text orientation
                    placementType: "list",
                    smooth: 0.2,
                    "max-char-angle-delta": 180,
                    // horizontalAlignment: 'adjust',
                  })}
              >
                {'[name] + "\n "'}
                <Placement characterSpacing={cs * 2} />
                <Placement characterSpacing={cs * 1.5} />
                <Placement characterSpacing={cs} />
                <Placement characterSpacing={(cs / 3) * 2} />
                <Placement characterSpacing={cs / 3} />
                <Placement characterSpacing={0} />

                {z > 13 && <Placement characterSpacing={0} size={size * 0.75} />}
                {z > 14 && <Placement characterSpacing={0} size={size * 0.5} />}
              </TextSymbolizer>
            </RuleEx>
          );
        })}
      </Style>

      <Style name="water_line_names">
        <RuleEx minZoom={12} type="river">
          <TextSymbolizer
            {...font().water().line(400).end({
              characterSpacing: 2,
              simplifyAlgorithm: "douglas-peucker",
              simplify: 10,
              "max-char-angle-delta": 30,
            })}
          >
            [name]
          </TextSymbolizer>
        </RuleEx>

        <RuleEx minZoom={14} filter="[type] <> 'river'">
          <TextSymbolizer
            {...font().water().line(300).end({
              characterSpacing: 2,
              simplifyAlgorithm: "douglas-peucker",
              simplify: 10,
              "max-char-angle-delta": 30,
            })}
          >
            [name]
          </TextSymbolizer>
        </RuleEx>
      </Style>

      <Style name="fixmes">
        <Rule>
          <MarkersSymbolizer file="images/fixme.svg" />
        </Rule>
      </Style>

      <Style name="placenames">
        {seq(6, 19).map((z) => {
          const opacity = z <= 14 ? 1 : 0.5;
          const sc = 2.5 * Math.pow(1.2, z);
          // TODO wrap it respecting its size
          const placenamesFontStyle = font()
            .wrap()
            .end({
              margin: 3,
              haloFill: "white",
              opacity,
              haloOpacity: opacity * 0.9,
              fontsetName: "narrow bold",
              characterSpacing: 1,
              placementType: "list",
            });

          return (
            <>
              <RuleEx minZoom={z} maxZoom={z} type="city">
                <TextSymbolizer {...placenamesFontStyle} haloRadius={2} textTransform="uppercase" size={1.2 * sc}>
                  [name]
                  <Placements />
                </TextSymbolizer>
              </RuleEx>

              {z > 8 && (
                <RuleEx minZoom={z} maxZoom={z} type="town">
                  <TextSymbolizer {...placenamesFontStyle} haloRadius={2} textTransform="uppercase" size={0.8 * sc}>
                    [name]
                    <Placements />
                  </TextSymbolizer>
                </RuleEx>
              )}

              {z > 10 && (
                <RuleEx minZoom={z} maxZoom={z} type="village">
                  <TextSymbolizer {...placenamesFontStyle} haloRadius={1.5} textTransform="uppercase" size={0.55 * sc}>
                    [name]
                    <Placements />
                  </TextSymbolizer>
                </RuleEx>
              )}

              {z > 11 && (
                <RuleEx minZoom={z} maxZoom={z} type={["suburb", "hamlet"]}>
                  <TextSymbolizer {...placenamesFontStyle} haloRadius={1.5} size={0.5 * sc}>
                    [name]
                    <Placements />
                  </TextSymbolizer>
                </RuleEx>
              )}
            </>
          );
        })}
      </Style>

      <Style name="geonames">
        <Rule>
          <TextSymbolizer
            {...font().line().nature().end({
              haloFill: "white",
              characterSpacing: 1,
              haloRadius: 2,
              allowOverlap: true,
              opacity: "0.8 - pow(1.5, @zoom - 9) / 5",
              haloOpacity: "0.8 - pow(1.5, @zoom - 9) / 5",
              size: "8 + pow(1.9, @zoom - 6)",
              horizontalAlignment: "adjust",
              smooth: 0.2,
              "max-char-angle-delta": 180,
            })}
          >
            [name]
          </TextSymbolizer>
        </Rule>
      </Style>

      {(() => {
        const x: string[] = [];

        if (hikingTrails) {
          x.push("hiking");
        }

        if (bicycleTrails) {
          x.push("bicycle");
        }

        if (skiTrails) {
          x.push("ski");
        }

        if (horseTrails) {
          x.push("horse");
        }

        return x.length > 0 ? (
          <>
            <Style name="routeGlows">
              <Routes glows types={x} />
            </Style>

            <Style name="routes">
              <Routes glows={false} types={x} />
            </Style>
          </>
        ) : undefined;
      })()}

      <Style name="route_names">
        <Rule>
          <TextSymbolizer
            {...font()
              .line(500)
              .end({ fill: "black", size: 11, haloRadius: 1.5, haloOpacity: 0.2, dy: "4 + [off1] * 2.5" })}
          >
            [refs1]
          </TextSymbolizer>

          <TextSymbolizer
            {...font()
              .line(500)
              .end({ fill: "black", size: 11, haloRadius: 1.5, haloOpacity: 0.2, dy: "-4 - [off2] * 4" })}
          >
            [refs2]
          </TextSymbolizer>
        </Rule>
      </Style>

      <Style name="contours" opacity={0.33}>
        <RuleEx minZoom={13} maxZoom={14} filter="([height] % 100 = 0) and ([height] != 0)">
          <LineSymbolizer stroke={colors.contour} strokeWidth={0.4} smooth={1} />

          <TextSymbolizer {...font().line().end({ fill: colors.contour, smooth: 1, upright: "left" })}>
            [height]
          </TextSymbolizer>
        </RuleEx>

        <RuleEx minZoom={12} maxZoom={12} filter="([height] % 50 = 0) and ([height] != 0)">
          <LineSymbolizer stroke={colors.contour} strokeWidth={0.2} smooth={1} />
        </RuleEx>

        <RuleEx minZoom={13} maxZoom={14} filter="([height] % 20 = 0) and ([height] != 0)">
          <LineSymbolizer stroke={colors.contour} strokeWidth={0.2} smooth={1} />
        </RuleEx>

        <RuleEx minZoom={15} filter="([height] % 100 = 0) and ([height] != 0)">
          <LineSymbolizer stroke={colors.contour} strokeWidth={0.6} smooth={1} />

          <TextSymbolizer {...font().line().end({ fill: colors.contour, smooth: 1, upright: "left" })}>
            [height]
          </TextSymbolizer>
        </RuleEx>

        <RuleEx minZoom={15} filter="([height] % 10 = 0) and ([height] != 0)">
          <LineSymbolizer stroke={colors.contour} strokeWidth={0.3} smooth={1} />
        </RuleEx>

        <RuleEx minZoom={15} filter="([height] % 50 = 0) and ([height] % 100 != 0)">
          <TextSymbolizer {...font().line().end({ fill: colors.contour, smooth: 1, upright: "left" })}>
            [height]
          </TextSymbolizer>
        </RuleEx>
      </Style>

      {format !== "svg" && format !== "pdf" && (
        <Style name="crop" imageFilters="agg-stack-blur(20,20)" imageFiltersInflate>
          <Rule>
            <PolygonSymbolizer fill="red" />
          </Rule>
        </Style>
      )}

      <Highways />

      <Layers
        shading={shading}
        contours={contours}
        hikingTrails={hikingTrails}
        bicycleTrails={bicycleTrails}
        skiTrails={skiTrails}
        horseTrails={horseTrails}
        format={format}
        custom={custom}
        legendLayers={legendLayers}
      />
    </Map>
  );
}

export const mapnikConfig = generateFreemapStyle();

if (dumpXml) {
  console.log("Mapnik config:", mapnikConfig);
}
