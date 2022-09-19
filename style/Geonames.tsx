import { Rule, Style, TextSymbolizer } from "jsxnik/mapnikConfig";
import { TextSymbolizerEx } from "./TextSymbolizerEx";
import { ShpLayer } from "./ShpLayer";

export function Geonames() {
  return (
    <>
      <Style name="geonames">
        <Rule>
          <TextSymbolizerEx
            line
            nature
            haloFill="white"
            characterSpacing={1}
            haloRadius={2}
            allowOverlap
            opacity="0.8 - pow(1.5, @zoom - 9) / 5"
            haloOpacity="0.8 - pow(1.5, @zoom - 9) / 5"
            size="8 + pow(1.9, @zoom - 6)"
            horizontalAlignment="adjust"
            smooth={0.2}
            maxCharAngleDelta={180}
          >
            [name]
          </TextSymbolizerEx>
        </Rule>
      </Style>

      <ShpLayer
        styleName="geonames"
        srs="+init=epsg:4326"
        bufferSize={1024}
        minZoom={9}
        maxZoom={11}
        file="geo-names/geo-names.shp"
      />
    </>
  );
}
