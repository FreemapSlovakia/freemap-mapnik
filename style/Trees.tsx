import { MarkersSymbolizer, Style } from "jsxnik/mapnikConfig";
import { colors } from "./colors";
import { RuleEx } from "./RuleEx";
import { SqlLayer } from "./SqlLayer";

export function Trees() {
  return (
    <>
      <Style name="trees">
        <RuleEx minZoom={16}>
          <MarkersSymbolizer
            file="images/tree2.svg"
            width="2 + pow(2, @zoom - 15)"
            height="2 + pow(2, @zoom - 15)"
            fill={colors.forest}
            allowOverlap
            ignorePlacement
            transform='scale(1 - ([type] = "shrub") * 0.5, 1 - ([type] = "shrub") * 0.5)'
          />
        </RuleEx>
      </Style>

      <SqlLayer
        styleName="trees"
        minZoom={16}
        bufferSize={128}
        sql="
          SELECT type, geometry
          FROM osm_features
          WHERE
            type = 'tree' AND (NOT (tags ? 'protected') OR tags->'protected' = 'no') AND (NOT (tags ? 'denotation') OR tags->'denotation' <> 'natural_monument')
            OR type = 'shrub'"
      />
    </>
  );
}
