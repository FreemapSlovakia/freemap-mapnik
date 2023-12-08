import { LinePatternSymbolizer, LineSymbolizer, Style } from "jsxnik/mapnikConfig";
import { colors, hsl } from "./colors";
import { RuleEx } from "./RuleEx";
import { SqlLayer } from "./SqlLayer";
import { seq } from "./utils";

export function FeatureLines() {
  return (
    <>
      <Style name="feature_lines">
        <RuleEx minZoom={16} type="weir">
          <LineSymbolizer stroke={hsl(0, 0, 40)} strokeWidth={3} strokeDasharray="9, 3" />
        </RuleEx>

        <RuleEx minZoom={16} type="dam">
          <LineSymbolizer stroke={hsl(0, 0, 40)} strokeWidth={3} />
        </RuleEx>

        {seq(13, 19).map((z) => (
          <RuleEx minZoom={z} maxZoom={z} type="tree_row">
            <LinePatternSymbolizer file="images/tree2.svg" transform={`scale(${(2 + Math.pow(2, z - 15)) / 4})`} />
          </RuleEx>
        ))}
      </Style>

      <SqlLayer
        styleName="feature_lines"
        minZoom={13}
        sql="
          SELECT geometry, type
          FROM osm_feature_lines
          WHERE type IN ('weir', 'dam', 'tree_row') AND geometry && !bbox!"
      />
    </>
  );
}
