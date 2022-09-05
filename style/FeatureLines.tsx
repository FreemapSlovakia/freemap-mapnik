import { LinePatternSymbolizer, LineSymbolizer, Style } from "jsxnik/mapnikConfig";
import { hsl } from "./colors";
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

      <SqlLayer
        styleName="feature_lines"
        minZoom={13}
        cacheFeatures
        sql="
          SELECT geometry, type
          FROM osm_feature_lines
          WHERE type NOT IN ('cutline', 'valley', 'ridge') AND geometry && !bbox!"
      />
    </>
  );
}
