import { PolygonSymbolizer, Style, LineSymbolizer } from "jsxnik/mapnikConfig";
import { colors } from "./colors";
import { RuleEx } from "./RuleEx";
import { SqlLayer } from "./SqlLayer";

export function Buildings() {
  return (
    <>
      <Style name="buildings">
        <RuleEx minZoom={13} filter="[type] <> 'ruins'">
          <PolygonSymbolizer fill={colors.building} />
        </RuleEx>

        <RuleEx minZoom={14} filter="[type] = 'ruins'">
          <PolygonSymbolizer fill={colors.building} fillOpacity={0.5} />
          <LineSymbolizer stroke={colors.building} strokeDasharray="4 4" strokeWidth={2} offset={-1} />
        </RuleEx>
      </Style>

      <SqlLayer
        styleName="buildings"
        sql="SELECT geometry, type FROM osm_buildings WHERE type <> 'no' AND geometry && !bbox!"
        minZoom={13}
      />
    </>
  );
}
