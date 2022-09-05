import { Rule, Style, TextSymbolizer } from "jsxnik/mapnikConfig";
import { font } from "./fontFactory";
import { ShpLayer } from "./ShpLayer";

export function Geonames() {
  return (
    <>
      <Style name="geonames">
        <Rule>
          <TextSymbolizer
            {...font().line().nature().end({
              haloFill: "white",
              characterSpacing: 1,
              haloRadius: 2,
              allowOverlap: true,
              opacity: "0.8 - pow(1.5, @zoom - 9) / 5",
              haloOpacity: "0.8 - pow(1.5, @zoom - 9) / 5",
              size: "8 + pow(1.9, @zoom - 6)",
              horizontalAlignment: "adjust",
              smooth: 0.2,
              "max-char-angle-delta": 180,
            })}
          >
            [name]
          </TextSymbolizer>
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
