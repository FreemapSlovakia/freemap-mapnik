import { Rule, Style } from "jsxnik/mapnikConfig";
import { colors } from "./colors";
import { TextSymbolizerEx } from "./TextSymbolizerEx";
import { Placements } from "./Placements";
import { SqlLayer } from "./SqlLayer";

export function ProtectedAreaNames() {
  return (
    <>
      <Style name="protected_area_names">
        <Rule>
          <TextSymbolizerEx
            nature
            wrap
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

      <Style name="national_park_border_names">
        <Rule>
          <TextSymbolizerEx
            nature
            line={600}
            fill={colors.protected}
            maxCharAngleDelta={45}
            dy={10}
            smooth={0.5}
            opacity={0.66}
            haloOpacity={0.75 * 0.66}
          >
            [name].replace('\\b[Oo]chranné [Pp]ásmo\\b', 'OP').replace('\\b[Nn]árodn(ého|ý) [Pp]arku?\\b', 'NP')
          </TextSymbolizerEx>
        </Rule>
      </Style>

      <SqlLayer
        styleName="national_park_border_names"
        bufferSize={1024}
        minZoom={12}
        sql="
          SELECT type, name, protect_class, (ST_Dump(ST_Boundary(geometry))).geom AS geometry
          FROM osm_protected_areas
          WHERE geometry && !bbox! AND (type = 'national_park' OR (type = 'protected_area' AND protect_class = '2'))
          ORDER BY area DESC
        "
      />

      <SqlLayer
        styleName="protected_area_names"
        bufferSize={1024}
        minZoom={12}
        sql="
          SELECT type, name, protect_class, geometry
          FROM osm_protected_areas
          WHERE geometry && !bbox! AND (type = 'nature_reserve' OR (type = 'protected_area' AND protect_class <> '2'))
          ORDER BY area DESC
        "
      />
    </>
  );
}
