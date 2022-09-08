import { Style, TextSymbolizer } from "jsxnik/mapnikConfig";
import { font } from "./fontFactory";
import { Placements } from "./Placements";
import { RuleEx } from "./RuleEx";
import { SqlLayer } from "./SqlLayer";
import { seq } from "./utils";

export function WaterAreaNames() {
  /* TODO to feature_names to consider z_order */
  return (
    <>
      <Style name="water_area_names">
        {seq(10, 16).map((z) => (
          <RuleEx filter={`[area] > ${800000 / (1 << (2 * (z - 10)))}`} minZoom={z} maxZoom={z}>
            <TextSymbolizer {...font().water().wrap().end({ placement: "interior", placementType: "list" })}>
              [name]
              <Placements />
            </TextSymbolizer>
          </RuleEx>
        ))}

        <RuleEx minZoom={17}>
          <TextSymbolizer {...font().water().wrap().end({ placement: "interior", placementType: "list" })}>
            [name]
            <Placements />
          </TextSymbolizer>
        </RuleEx>
      </Style>

      <SqlLayer
        styleName="water_area_names"
        minZoom={10}
        bufferSize={1024}
        sql="
          SELECT
            osm_waterareas.name,
            osm_waterareas.geometry,
            osm_waterareas.type,
            osm_waterareas.area
          FROM
            osm_waterareas LEFT JOIN osm_feature_polys USING (osm_id)
          WHERE
            osm_feature_polys.osm_id IS NULL
            AND osm_waterareas.type <> 'riverbank'
            AND osm_waterareas.water NOT IN ('river', 'stream', 'canal', 'ditch')
        "
      />
    </>
  );
}
