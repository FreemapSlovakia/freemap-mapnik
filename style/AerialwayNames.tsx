import { Rule, Style, TextSymbolizer } from "jsxnik/mapnikConfig";
import { TextSymbolizerEx } from "./TextSymbolizerEx";
import { SqlLayer } from "./SqlLayer";

export function AerialwayNames() {
  return (
    <>
      <Style name="aerialway_names">
        <Rule>
          <TextSymbolizerEx line fill="black" dy={6}>
            [name]
          </TextSymbolizerEx>
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
