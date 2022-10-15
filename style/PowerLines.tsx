import { LineSymbolizer, MarkersSymbolizer, Style } from "jsxnik/mapnikConfig";
import { hsl } from "./colors";
import { RuleEx } from "./RuleEx";
import { SqlLayer } from "./SqlLayer";

export function PowerLines() {
  return (
    <>
      <Style name="power_lines">
        <RuleEx minZoom={13} type="line">
          <LineSymbolizer stroke="black" strokeWidth={1} strokeOpacity={0.5} />
        </RuleEx>

        <RuleEx minZoom={14} type="minor_line">
          <LineSymbolizer stroke={hsl(0, 0, 50)} strokeWidth={1} strokeOpacity={0.5} />
        </RuleEx>
      </Style>

      <Style name="power_features">
        <RuleEx minZoom={14} type="tower">
          <MarkersSymbolizer file="images/power_tower.svg" allow-overlap ignore-placement />
        </RuleEx>

        <RuleEx minZoom={15} type="pylon">
          <MarkersSymbolizer file="images/power_tower.svg" allow-overlap ignore-placement />
        </RuleEx>

        <RuleEx minZoom={15} type="pole">
          <MarkersSymbolizer file="images/power_pole.svg" allow-overlap ignore-placement />
        </RuleEx>
      </Style>

      <SqlLayer
        styleName="power_lines"
        minZoom={13}
        sql="
          SELECT geometry, type
          FROM osm_feature_lines
          WHERE type IN ('line', 'minor_line') AND geometry && !bbox!"
      />

      <SqlLayer
        styleName="power_features"
        minZoom={14}
        sql="
          SELECT geometry, type
          FROM osm_features
          WHERE type IN ('pylon', 'tower', 'pole') AND geometry && !bbox!"
      />
    </>
  );
}
