import { MarkersSymbolizer, Rule, Style } from "jsxnik/mapnikConfig";
import { SqlLayer } from "./SqlLayer";

export function Fixmes() {
  return (
    <>
      <Style name="fixmes">
        <Rule>
          <MarkersSymbolizer file="images/fixme.svg" />
        </Rule>
      </Style>

      <SqlLayer styleName="fixmes" sql="SELECT geometry FROM osm_fixmes" minZoom={14} />
    </>
  );
}
