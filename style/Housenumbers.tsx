import { Rule, Style, TextSymbolizer } from "jsxnik/mapnikConfig";
import { colors } from "./colors";
import { font } from "./fontFactory";
import { SqlLayer } from "./SqlLayer";

export function Housenumbers() {
  return (
    <>
      <Style name="housenumbers">
        <Rule>
          <TextSymbolizer {...font().end({ placement: "interior", size: 8, haloOpacity: 0.5, fill: colors.areaLabel })}>
            [housenumber]
          </TextSymbolizer>
        </Rule>
      </Style>

      <SqlLayer
        styleName="housenumbers"
        minZoom={18}
        bufferSize={256}
        sql={`
          SELECT COALESCE(NULLIF("addr:streetnumber", ''), NULLIF("addr:housenumber", ''), NULLIF("addr:conscriptionnumber", '')) AS housenumber, geometry
          FROM osm_housenumbers
          WHERE geometry && !bbox!
        `}
      />
    </>
  );
}
