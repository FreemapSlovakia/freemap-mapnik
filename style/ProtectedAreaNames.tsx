import { Style, TextSymbolizer } from "jsxnik/mapnikConfig";
import { hsl } from "./colors";
import { TextSymbolizerEx } from "./TextSymbolizerEx";
import { Placements } from "./Placements";
import { RuleEx } from "./RuleEx";
import { SqlLayer } from "./SqlLayer";
import { nationalParkFilter } from "./ProtectedAreas";

export function ProtectedAreaNames() {
  return (
    <>
      <Style name="protected_area_names">
        <RuleEx minZoom={8} maxZoom={10} filter={nationalParkFilter}>
          <TextSymbolizerEx
            nature
            wrap
            size="9 + pow(2, @zoom - 7)"
            fill={hsl(120, 100, 25)}
            haloFill="white"
            haloRadius={1.5}
            placement="interior"
            placementType="list"
          >
            [name]
            <Placements />
          </TextSymbolizerEx>
        </RuleEx>

        <RuleEx minZoom={12} filter="type = 'nature_reserve' or ([type] = 'protected_area' and [protect_class] <> '2')">
          <TextSymbolizerEx
            nature
            wrap
            fill={hsl(120, 100, 25)}
            haloFill="white"
            haloRadius={1.5}
            placement="interior"
            placementType="list"
          >
            [name]
            <Placements />
          </TextSymbolizerEx>
        </RuleEx>
      </Style>

      <SqlLayer
        styleName="protected_area_names"
        bufferSize={1024}
        minZoom={8}
        sql="SELECT type, name, protect_class, geometry FROM osm_protected_areas WHERE geometry && !bbox! ORDER BY area DESC"
      />
    </>
  );
}
