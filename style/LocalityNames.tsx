import { Style, TextSymbolizer } from "jsxnik/mapnikConfig";
import { hsl } from "./colors";
import { font } from "./fontFactory";
import { Placements } from "./Placements";
import { RuleEx } from "./RuleEx";
import { SqlLayer } from "./SqlLayer";

export function LocalityNames() {
  return (
    <>
      <Style name="locality_names">
        <RuleEx minZoom={15} type="locality">
          <TextSymbolizer
            {...font()
              .wrap()
              .end({
                fill: hsl(0, 0, 40),
                size: 11,
                haloRadius: 1.5,
                haloOpacity: 0.2,
                placementType: "list",
              })}
          >
            [name]
            <Placements />
          </TextSymbolizer>
        </RuleEx>
      </Style>

      <SqlLayer
        styleName="locality_names"
        minZoom={15}
        bufferSize={1024}
        sql="
          SELECT name, type, geometry
          FROM osm_places
          WHERE type = 'locality' AND geometry && !bbox!
          ORDER BY osm_id
        "
      />
    </>
  );
}
