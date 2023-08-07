import { PolygonSymbolizer, Rule, Style } from "jsxnik/mapnikConfig";
import { ShpLayer } from "./ShpLayer";

export function Sea() {
  return (
    <>
      <Style name="sea">
        <Rule>
          <PolygonSymbolizer fill="white" />
        </Rule>
      </Style>

      <ShpLayer
        styleName="sea"
        srs="+init=epsg:3857"
        maxZoom={9}
        file="simplified-land-polygons-complete-3857/simplified_land_polygons.shp"
      />

      <ShpLayer styleName="sea" srs="+init=epsg:3857" minZoom={10} file="land-polygons-split-3857/land_polygons.shp" />
    </>
  );
}
