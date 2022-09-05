import { LineSymbolizer, MarkersSymbolizer, Style } from "jsxnik/mapnikConfig";
import { colors } from "./colors";
import { RuleEx } from "./RuleEx";
import { SqlLayer } from "./SqlLayer";

export function WaterLine() {
  return (
    <>
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
    </>
  );
}
