import { LineSymbolizer, PolygonPatternSymbolizer, Style } from "jsxnik/mapnikConfig";
import { hsl } from "./colors";
import { RuleEx } from "./RuleEx";
import { SqlLayer } from "./SqlLayer";

export function MilitaryAreas() {
  return (
    <>
      <Style name="military_areas">
        <RuleEx minZoom={10}>
          <LineSymbolizer stroke={hsl(0, 96, 39)} strokeWidth={3} strokeDasharray="25,7" strokeOpacity={0.8} />
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
        sql="SELECT geometry FROM osm_landusages WHERE type = 'military' AND geometry && !bbox!"
      />
    </>
  );
}
