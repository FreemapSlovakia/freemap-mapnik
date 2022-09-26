import { Rule, Style } from "jsxnik/mapnikConfig";
import { colors } from "./colors";
import { TextSymbolizerEx } from "./TextSymbolizerEx";
import { Placements } from "./Placements";
import { SqlLayer } from "./SqlLayer";

export function NationalParkNames() {
  return (
    <>
      <Style name="national_park_names">
        <Rule>
          <TextSymbolizerEx
            nature
            wrap
            size="9 + pow(2, @zoom - 7)"
            fill={colors.protected}
            haloFill="white"
            haloRadius={1.5}
            placement="interior"
            placementType="list"
          >
            [name]
            <Placements />
          </TextSymbolizerEx>
        </Rule>
      </Style>

      <SqlLayer
        styleName="national_park_names"
        bufferSize={1024}
        minZoom={8}
        maxZoom={10}
        sql="
          SELECT type, name, protect_class, geometry
          FROM osm_protected_areas
          WHERE geometry && !bbox! AND (type = 'national_park' OR (type = 'protected_area' AND protect_class = '2'))
          ORDER BY name LIKE ('Ochranné pásmo %'), area DESC
        "
      />
    </>
  );
}
