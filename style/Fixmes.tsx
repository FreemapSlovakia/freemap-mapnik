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
            spacing={100}
            placement="line"
            opacity={0.75}
            ignorePlacement
            direction="auto"
          />
        </Rule>
      </Style>

      <SqlLayer styleName="fixmes" sql="SELECT geometry FROM osm_fixmes" minZoom={14} />

      <SqlLayer styleName="fixmes_lines" sql="SELECT geometry FROM osm_fixmes_lines" minZoom={14} />
    </>
  );
}
