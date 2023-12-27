import { DebugSymbolizer, Format, Layer, Placement, Rule, Style } from "jsxnik/mapnikConfig";
import { Borders } from "./Borders";
import { DatasourceEx } from "./DatasourceEx";
import { SqlLayer } from "./SqlLayer";
import { StyledLayer } from "./StyledLayer";
import { TextSymbolizerEx } from "./TextSymbolizerEx";
import { seq } from "./utils";

export function CountryNames() {
  return (
    <>
      <Style name="countryLabels">
        <Rule>
          {seq(0, 3).map((f) => (
            <TextSymbolizerEx
              line
              haloFill="white"
              haloRadius={2}
              size={"pow(1.5, @zoom - 6) * " + 20 / (1 + f / 5)}
              horizontalAlignment="adjust"
              smooth={1}
              // allowOverlap
              // margin={10}
              maxCharAngleDelta={180}
              placementType="list"
              lineSpacing={2}
            >
              [name] + "\n"{" "}
              <Format fill="#666" size={"pow(1.5, @zoom - 6) * " + 15 / (1 + f / 5)}>
                [name:en]
              </Format>
            </TextSymbolizerEx>
          ))}
        </Rule>
      </Style>

      <SqlLayer
        styleName="sea" // any
        opacity={0.33}
        compOp="src-in"
        maxZoom={7}
        sql="SELECT ST_SetSRID(ST_MakePoint(0, 0), 3857) AS geom LIMIT 0" // some empty data
      />

      <Borders forLowzoom />

      <StyledLayer
        styleName="countryLabels"
        srs="+init=epsg:4326"
        bufferSize={1024}
        maxZoom={7}
        clearLabelCache
        opacity={0.66}
      >
        <DatasourceEx
          params={{
            type: "geojson",
            file: "country-names.geojson",
          }}
        />
      </StyledLayer>
    </>
  );
}
