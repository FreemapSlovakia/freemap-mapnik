import { PolygonPatternSymbolizer, PolygonSymbolizer, Style } from "jsxnik/mapnikConfig";
import { colors } from "./colors";
import { RuleEx } from "./RuleEx";
import { SqlLayer } from "./SqlLayer";

export function WaterArea() {
  return (
    <>
      <Style name="water_area">
        <RuleEx minZoom={8} maxZoom={13} filter="[tmp] = 1">
          <PolygonPatternSymbolizer file="images/temp_water.svg" alignment="local" transform="scale(0.5)" />
        </RuleEx>

        <RuleEx minZoom={14} filter="[tmp] = 1">
          <PolygonPatternSymbolizer file="images/temp_water.svg" alignment="local" />
        </RuleEx>

        <RuleEx minZoom={8} filter="[tmp] != 1">
          <PolygonSymbolizer fill={colors.water} />
        </RuleEx>

        <RuleEx maxZoom={9} filter="[tmp] != 1">
          <PolygonSymbolizer fill={colors.water} />
        </RuleEx>
      </Style>

      <SqlLayer
        styleName="water_area"
        maxZoom={11}
        sql="SELECT geometry, type, intermittent OR seasonal AS tmp FROM osm_waterareas_gen1 WHERE geometry && !bbox!"
      />

      <SqlLayer
        styleName="water_area"
        minZoom={12}
        sql="SELECT geometry, type, intermittent OR seasonal AS tmp FROM osm_waterareas WHERE geometry && !bbox!"
      />
    </>
  );
}
