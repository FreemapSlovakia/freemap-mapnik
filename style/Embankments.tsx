import { LinePatternSymbolizer, Rule, Style } from "jsxnik/mapnikConfig";
import { SqlLayer } from "./SqlLayer";

export function Embankments() {
  /* TODO don't render on hi-res hillshading */

  return (
    <>
      <Style name="embankments">
        <Rule>
          <LinePatternSymbolizer file="images/embankment.svg" />
        </Rule>
      </Style>

      <SqlLayer
        styleName="embankments"
        minZoom={16}
        sql="
          SELECT geometry
          FROM osm_roads
          WHERE embankment = 1 AND geometry && !bbox!
        "
      />
    </>
  );
}
