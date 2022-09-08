import { LineSymbolizer, Style } from "jsxnik/mapnikConfig";
import { colors } from "./colors";
import { RuleEx } from "./RuleEx";
import { SqlLayer } from "./SqlLayer";
import { seq } from "./utils";

export function Cutlines() {
  return (
    <>
      <Style name="cutlines">
        {seq(12, 16).map((z) => (
          <RuleEx minZoom={z} maxZoom={z === 16 ? undefined : z} type="cutline">
            <LineSymbolizer stroke={colors.scrub} strokeWidth={2 + 0.33 * Math.pow(2, z - 12)} />
          </RuleEx>
        ))}
      </Style>

      <SqlLayer
        styleName="cutlines"
        minZoom={13}
        sql="SELECT geometry, type FROM osm_feature_lines WHERE type = 'cutline'"
      />
    </>
  );
}
