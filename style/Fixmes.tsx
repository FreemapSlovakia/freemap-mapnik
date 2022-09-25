import { MarkersSymbolizer, Rule, Style } from "jsxnik/mapnikConfig";
import { SqlLayer } from "./SqlLayer";

export function Fixmes() {
  return (
    <>
      <Style name="fixmes">
        <Rule>
          <MarkersSymbolizer file="images/fixme.svg" opacity={0.75} />
        </Rule>
      </Style>

      <Style name="fixmes_lines">
        <Rule>
          <MarkersSymbolizer
            file="images/fixme.svg"
            spacing={150}
            placement="line"
            opacity={0.75}
            ignorePlacement
            direction="auto"
          />
        </Rule>
      </Style>

      <SqlLayer styleName="fixmes" sql="SELECT geometry FROM osm_fixmes WHERE geometry && !bbox!" minZoom={14} />

      <SqlLayer
        styleName="fixmes_lines"
        sql="
          SELECT geometry FROM osm_feature_lines WHERE fixme <> '' AND geometry && !bbox!
          UNION SELECT geometry FROM osm_roads WHERE fixme <> '' AND geometry && !bbox!
        "
        minZoom={14}
      />
    </>
  );
}
