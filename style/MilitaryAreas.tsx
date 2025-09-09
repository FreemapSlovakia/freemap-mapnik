import { LineSymbolizer, PolygonPatternSymbolizer, Style } from "jsxnik/mapnikConfig";
import { colors } from "./colors.js";
import { RuleEx } from "./RuleEx.js";
import { SqlLayer } from "./SqlLayer.js";

export function MilitaryAreas() {
  return (
    <>
      <Style name="military_areas">
        <RuleEx minZoom={10}>
          <LineSymbolizer stroke={colors.military} strokeWidth={3} strokeDasharray="25,7" strokeOpacity={0.8} />
        </RuleEx>

        <RuleEx minZoom={10} maxZoom={13}>
          <PolygonPatternSymbolizer file="images/military_area.svg" alignment="global" opacity={0.5} />
        </RuleEx>

        <RuleEx minZoom={14}>
          <PolygonPatternSymbolizer file="images/military_area.svg" alignment="global" opacity={0.2} />
        </RuleEx>
      </Style>

      <SqlLayer
        styleName="military_areas"
        geometryColumn="geometry"
        sql="SELECT geometry FROM osm_landusages WHERE type = 'military' AND geometry && !bbox! AND area / POWER(4, 19 - !@zoom!) > 10"
      />
    </>
  );
}
