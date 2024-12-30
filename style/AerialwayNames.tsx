import { Rule, Style } from "jsxnik/mapnikConfig";
import { TextSymbolizerEx } from "./TextSymbolizerEx.js";
import { SqlLayer } from "./SqlLayer.js";

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
        sql="SELECT geometry, name, type FROM osm_aerialways WHERE geometry && !bbox!"
      />
    </>
  );
}
