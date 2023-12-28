import { Rule, Style, TextSymbolizer } from "jsxnik/mapnikConfig";
import { hsl } from "./colors";
import { TextSymbolizerEx } from "./TextSymbolizerEx";
import { Placements } from "./Placements";
import { SqlLayer } from "./SqlLayer";

export function LocalityNames() {
  return (
    <>
      <Style name="locality_names">
        <Rule>
          <TextSymbolizerEx wrap fill={hsl(0, 0, 40)} size={11} haloRadius={1.5} haloOpacity={0.2} placementType="list">
            [name]
            <Placements />
          </TextSymbolizerEx>
        </Rule>
      </Style>

      <SqlLayer
        styleName="locality_names"
        minZoom={15}
        bufferSize={1024}
        sql="
          SELECT name, type, geometry
          FROM osm_places
          WHERE type IN ('locality', 'city_block', 'plot') AND geometry && !bbox!
          ORDER BY z_order DESC, population DESC, osm_id
        "
      />
    </>
  );
}
