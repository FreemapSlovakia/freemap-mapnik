import { Format, Rule, Style } from "jsxnik/mapnikConfig";
import { Borders } from "./Borders.js";
import { DatasourceEx } from "./DatasourceEx.js";
import { SqlLayer } from "./SqlLayer.js";
import { StyledLayer } from "./StyledLayer.js";
import { TextSymbolizerEx } from "./TextSymbolizerEx.js";
import { seq } from "./utils.js";

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
        sql="SELECT geometry FROM osm_features LIMIT 0" // some empty data
      />

      <Borders forLowzoom />

      <StyledLayer
        styleName="countryLabels"
        srs="EPSG:4326"
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
