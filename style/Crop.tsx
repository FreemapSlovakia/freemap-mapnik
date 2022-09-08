import { PolygonSymbolizer, Rule, Style } from "jsxnik/mapnikConfig";
import { DatasourceEx } from "./DatasourceEx";
import { StyledLayer } from "./StyledLayer";

export function Crop() {
  return (
    <>
      <Style name="crop" imageFilters="agg-stack-blur(20,20)" imageFiltersInflate>
        <Rule>
          <PolygonSymbolizer fill="red" />
        </Rule>
      </Style>

      <StyledLayer styleName="crop" srs="+init=epsg:4326" compOp="dst-in">
        <DatasourceEx params={{ type: "geojson", file: "limit.geojson" }} />
      </StyledLayer>
    </>
  );
}
