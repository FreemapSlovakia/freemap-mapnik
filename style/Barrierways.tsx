import { LineSymbolizer, Style } from "jsxnik/mapnikConfig";
import { colors, hsl } from "./colors";
import { RuleEx } from "./RuleEx";
import { SqlLayer } from "./SqlLayer";

export function Barrierways() {
  return (
    <>
      <Style name="barrierways">
        <RuleEx minZoom={16} type="city_wall">
          <LineSymbolizer stroke={colors.building} strokeWidth={2} />
        </RuleEx>

        <RuleEx minZoom={16} type="hedge">
          <LineSymbolizer
            stroke={colors.pitch}
            strokeWidth="@zoom - 14"
            strokeDasharray="'0.01,' + (@zoom - 14)"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </RuleEx>

        <RuleEx minZoom={16} fallback>
          <LineSymbolizer stroke={hsl(0, 100, 50)} strokeWidth={1} strokeDasharray="2,1" />
        </RuleEx>
      </Style>

      <SqlLayer
        styleName="barrierways"
        sql="SELECT geometry, type FROM osm_barrierways WHERE geometry && !bbox!"
        minZoom={16}
      />
    </>
  );
}
