import { Rule, Style, TextSymbolizer } from "jsxnik/mapnikConfig";
import { font } from "./fontFactory";
import { SqlLayer } from "./SqlLayer";

export function AerialwayNames() {
  return (
    <>
      <Style name="aerialway_names">
        <Rule>
          <TextSymbolizer {...font().line().end({ fill: "black", dy: 6 })}>[name]</TextSymbolizer>
        </Rule>
      </Style>

      <SqlLayer
        styleName="aerialway_names"
        minZoom={16}
        bufferSize={1024}
        sql="SELECT geometry, name, type FROM osm_aerialways"
      />
    </>
  );
}
