import { LinePatternSymbolizer, LineSymbolizer, PolygonPatternSymbolizer, Style } from "jsxnik/mapnikConfig";
import { hsl } from "./colors";
import { RuleEx } from "./RuleEx";
import { SqlLayer } from "./SqlLayer";
import { types } from "./utils";

export const nationalParkFilter = "[type] = 'national_park' or ([type] = 'protcted_area' and [protect_class] = 2)";

export function ProtectedAreas() {
  return (
    <>
      <Style name="protected_areas">
        <RuleEx minZoom={8} maxZoom={11} filter={nationalParkFilter}>
          <LineSymbolizer stroke={hsl(120, 100, 31)} strokeWidth={3} strokeDasharray="25,7" strokeOpacity={0.8} />

          <PolygonPatternSymbolizer file="images/national_park_area.svg" alignment="global" opacity={0.4} />
        </RuleEx>

        <RuleEx minZoom={12} maxZoom={12} filter={nationalParkFilter}>
          <PolygonPatternSymbolizer file="images/national_park_area.svg" alignment="global" opacity={0.2} />

          <LineSymbolizer stroke={hsl(120, 100, 31)} strokeWidth={4} strokeDasharray="25,7" strokeOpacity={0.4} />
        </RuleEx>

        <RuleEx minZoom={13} filter={nationalParkFilter}>
          <LineSymbolizer stroke={hsl(120, 100, 31)} strokeWidth={4} strokeDasharray="25,7" strokeOpacity={0.4} />
        </RuleEx>

        <RuleEx minZoom={12} filter="type = 'nature_reserve' or ([type] = 'protected_area' and [protect_class] <> 2)">
          <LinePatternSymbolizer file="images/protected_area.svg" />
        </RuleEx>
      </Style>

      <SqlLayer
        styleName="protected_areas"
        sql="SELECT type, protect_class, geometry FROM osm_protected_areas WHERE geometry && !bbox!"
      />
    </>
  );
}
