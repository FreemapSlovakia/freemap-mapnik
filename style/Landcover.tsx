import { LineSymbolizer, PolygonPatternSymbolizer, PolygonSymbolizer, Style } from "jsxnik/mapnikConfig";
import { BorderedPolygonSymbolizer } from "./BorderedPolygonSymbolizer";
import { colors, hsl } from "./colors";
import { RuleEx } from "./RuleEx";
import { SqlLayer } from "./SqlLayer";

function getLandcoverSelect(tblSuffix: "_gen0" | "_gen1" | "" = "") {
  return `
    SELECT
      CASE WHEN type = 'wetland' AND tags->'wetland' IN ('bog', 'reedbed', 'marsh', 'swamp', 'wet_meadow', 'mangrove', 'fen') THEN tags->'wetland' ELSE type END AS type,
      geometry,
      position(type || ',' IN 'pedestrian,footway,pitch,library,baracks,parking,cemetery,place_of_worship,dam,weir,clearcut,scrub,orchard,vineyard,landfill,scree,quarry,railway,park,garden,allotments,village_green,wetland,grass,recreation_ground,fell,bare_rock,heath,meadow,wood,forest,golf_course,grassland,farm,farmland,zoo,farmyard,hospital,kindergarten,school,college,university,retail,commercial,residential,industrial,') AS z_order
    FROM
      osm_landusages${tblSuffix}
    WHERE
      geometry && !bbox!
    ORDER BY
      z_order DESC, osm_id
  `;
}

export function Landcover() {
  return (
    <>
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

        <RuleEx type="hospital">
          <BorderedPolygonSymbolizer color={colors.hospital} />
        </RuleEx>

        <RuleEx type={["school", "college", "university"]}>
          <BorderedPolygonSymbolizer color={colors.college} />
        </RuleEx>

        <RuleEx type="brownfield">
          <BorderedPolygonSymbolizer color={colors.brownfield} />
        </RuleEx>

        <RuleEx type={["residential", "living_street"]}>
          <BorderedPolygonSymbolizer color={colors.residential} />
        </RuleEx>

        <RuleEx type="farmyard">
          <BorderedPolygonSymbolizer color={colors.farmyard} />
        </RuleEx>

        <RuleEx type="allotments">
          <BorderedPolygonSymbolizer color={colors.allotments} />
        </RuleEx>

        <RuleEx type={["industrial", "wastewater_plant"]}>
          <BorderedPolygonSymbolizer color={colors.industrial} />
        </RuleEx>

        <RuleEx type={["commercial", "retail"]}>
          <BorderedPolygonSymbolizer color={colors.commercial} />
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
          <BorderedPolygonSymbolizer color={colors.beach} />
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
          <BorderedPolygonSymbolizer color={colors.quarry} />
          <PolygonPatternSymbolizer file="images/quarry.svg" />
        </RuleEx>

        <RuleEx type="scree">
          <BorderedPolygonSymbolizer color={colors.scree} />
          <PolygonPatternSymbolizer file="images/scree.svg" opacity={0.33} />
        </RuleEx>

        <RuleEx type="clearcut">
          <PolygonPatternSymbolizer file="images/clearcut2.svg" opacity={0.25} />
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

        <RuleEx type={["pitch", "playground", "golf_course", "track"]} minZoom={12}>
          <PolygonSymbolizer fill={colors.pitch} />
          <LineSymbolizer stroke={colors.pitchStroke} strokeWidth={1} />
        </RuleEx>

        <RuleEx type="parking" minZoom={13}>
          <PolygonSymbolizer fill={colors.parking} />
          <LineSymbolizer stroke={colors.parkingStroke} strokeWidth={1} />
        </RuleEx>

        <RuleEx type={["bunker_silo", "storage_tank", "silo"]} minZoom={13}>
          <PolygonSymbolizer fill={colors.silo} />
          <LineSymbolizer stroke={colors.siloStroke} strokeWidth={1} />
        </RuleEx>
      </Style>

      <SqlLayer styleName="landcover" maxZoom={9} sql={getLandcoverSelect("_gen0")} />

      <SqlLayer styleName="landcover" minZoom={10} maxZoom={11} sql={getLandcoverSelect("_gen1")} />

      <SqlLayer styleName="landcover" minZoom={12} sql={getLandcoverSelect("")} />
    </>
  );
}
