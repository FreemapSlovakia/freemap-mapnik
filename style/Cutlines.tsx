import { LineSymbolizer, Style } from "jsxnik/mapnikConfig";
import { colors } from "./colors";
import { RuleEx } from "./RuleEx";
import { SqlLayer } from "./SqlLayer";
import { seq } from "./utils";

export function Cutlines() {
  return (
    <>
      <Style name="cutlines">
        <RuleEx type="cutline">
          <LineSymbolizer stroke={colors.scrub} strokeWidth="2 + 0.33 * pow(2, @zoom - 12)" />
        </RuleEx>
      </Style>

      <SqlLayer
        styleName="cutlines"
        minZoom={13}
        sql="SELECT geometry, type FROM osm_feature_lines WHERE type = 'cutline'"
      />
    </>
  );
}
