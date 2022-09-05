import { LineSymbolizer, Rule, Style } from "jsxnik/mapnikConfig";
import { SqlLayer } from "./SqlLayer";

export function Aerialways() {
  return (
    <>
      <Style name="aerialways">
        <Rule>
          <LineSymbolizer strokeWidth={1} stroke="black" />
          <LineSymbolizer strokeWidth={5} stroke="black" strokeDasharray="1,25" />
        </Rule>
      </Style>

      <SqlLayer styleName="aerialways" minZoom={12} sql="SELECT geometry, type FROM osm_aerialways" />
    </>
  );
}
