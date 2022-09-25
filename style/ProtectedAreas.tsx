import { LinePatternSymbolizer, LineSymbolizer, PolygonPatternSymbolizer, Style } from "jsxnik/mapnikConfig";
import { hsl } from "./colors";
import { RuleEx } from "./RuleEx";
import { SqlLayer } from "./SqlLayer";
import { types } from "./utils";

export const nationalParkFilter = "[type] = 'national_park' or ([type] = 'protected_area' and [protect_class] = '2')";

export function ProtectedAreas() {
  return (
    <>
      <Style name="protected_areas_A">
        <RuleEx minZoom={8} maxZoom={11} filter={nationalParkFilter}>
          <PolygonPatternSymbolizer file="images/national_park_area.svg" alignment="global" opacity={0.4} />
        </RuleEx>

        <RuleEx minZoom={12} maxZoom={12} filter={nationalParkFilter}>
          <PolygonPatternSymbolizer file="images/national_park_area.svg" alignment="global" opacity={0.2} />
        </RuleEx>

        <RuleEx minZoom={12} filter="type = 'nature_reserve' or ([type] = 'protected_area' and [protect_class] <> '2')">
          <LinePatternSymbolizer file="images/protected_area.svg" />
        </RuleEx>
      </Style>

      <Style name="protected_areas_B" opacity={0.66}>
        <RuleEx minZoom={8} maxZoom={11} filter={nationalParkFilter}>
          <LineSymbolizer stroke="#107010" strokeWidth={2} strokeDasharray="10,4" strokeLinejoin="round" />
        </RuleEx>

        <RuleEx minZoom={12} maxZoom={12} filter={nationalParkFilter}>
          <LineSymbolizer stroke="#107010" strokeWidth={2} strokeDasharray="10,4" strokeLinejoin="round" />
        </RuleEx>

        <RuleEx minZoom={13} filter={nationalParkFilter}>
          <LinePatternSymbolizer file="images/national_park.svg" />
        </RuleEx>
      </Style>

      <SqlLayer
        styleName={["protected_areas_A", "protected_areas_B"]}
        cacheFeatures
        sql="SELECT type, protect_class, geometry FROM osm_protected_areas WHERE geometry && !bbox!"
      />
    </>
  );
}
