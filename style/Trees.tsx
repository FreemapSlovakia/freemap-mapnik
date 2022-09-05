import { MarkersSymbolizer, Style } from "jsxnik/mapnikConfig";
import { colors } from "./colors";
import { RuleEx } from "./RuleEx";
import { SqlLayer } from "./SqlLayer";
import { seq } from "./utils";

export function Trees() {
  return (
    <>
      <Style name="trees">
        {seq(16, 19).map((z) => {
          const size = 2 + Math.pow(2, z - 15);

          return (
            <RuleEx minZoom={z} maxZoom={z}>
              <MarkersSymbolizer
                file="images/tree2.svg"
                width={size}
                height={size}
                fill={colors.forest}
                allowOverlap
                ignorePlacement
                transform='scale(1 - ([type] = "shrub") * 0.5, 1 - ([type] = "shrub") * 0.5)'
              />
            </RuleEx>
          );
        })}
      </Style>

      <SqlLayer
        styleName="trees"
        minZoom={16}
        bufferSize={128}
        sql="SELECT type, geometry FROM osm_features WHERE type = 'tree' OR type = 'shrub'"
      />
    </>
  );
}
