import { LinePatternSymbolizer, LineSymbolizer, PolygonPatternSymbolizer, Style } from "jsxnik/mapnikConfig";
import { colors, hsl } from "./colors";
import { RuleEx } from "./RuleEx";
import { SqlLayer } from "./SqlLayer";
import { seq, types } from "./utils";

export const nationalParkFilter = "[type] = 'national_park' or ([type] = 'protected_area' and [protect_class] = '2')";

export function ProtectedAreas() {
  return (
    <>
      <Style name="protected_areas_A">
        {seq(10, 11).map((z) => (
          <RuleEx minZoom={z === 10 ? 8 : z} maxZoom={z} filter={nationalParkFilter}>
            <PolygonPatternSymbolizer
              file="images/national_park_area.svg"
              alignment="global"
              opacity={0.5 - (z - 10) / 10}
            />
          </RuleEx>
        ))}

        <RuleEx minZoom={12} filter="type = 'nature_reserve' or ([type] = 'protected_area' and [protect_class] <> '2')">
          <LinePatternSymbolizer file="images/protected_area.svg" />
        </RuleEx>
      </Style>

      <Style name="protected_areas_B" opacity={0.66}>
        <RuleEx minZoom={8} filter={nationalParkFilter}>
          <LineSymbolizer
            stroke={colors.protected}
            strokeWidth="((@zoom > 10) * 0.5 * (@zoom - 10) + 2) / 2"
            strokeMiterlimit={1}
            strokeLinejoin="miter"
          />

          <LineSymbolizer
            offset="-((@zoom > 10) * 0.5 * (@zoom - 10) + 2) / 2"
            strokeOpacity={0.5}
            stroke={colors.protected}
            strokeWidth="((@zoom > 10) * 0.5 * (@zoom - 10) + 2)"
            strokeMiterlimit={1}
            strokeLinejoin="miter"
          />
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
