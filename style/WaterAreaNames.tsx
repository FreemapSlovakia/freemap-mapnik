import { Style, TextSymbolizer } from "jsxnik/mapnikConfig";
import { TextSymbolizerEx } from "./TextSymbolizerEx";
import { Placements } from "./Placements";
import { RuleEx } from "./RuleEx";
import { SqlLayer } from "./SqlLayer";

export function WaterAreaNames() {
  /* TODO to feature_names to consider z_order */
  return (
    <>
      <Style name="water_area_names">
        <RuleEx filter={`[area] > 800000 / pow(2, (2 * (@zoom - 10)))`} minZoom={10} maxZoom={16}>
          <TextSymbolizerEx water wrap placement="interior" placementType="list">
            [name]
            <Placements />
          </TextSymbolizerEx>
        </RuleEx>

        <RuleEx minZoom={17}>
          <TextSymbolizerEx water wrap placement="interior" placementType="list">
            [name]
            <Placements />
          </TextSymbolizerEx>
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
            osm_waterareas.geometry && !bbox!
            AND osm_feature_polys.osm_id IS NULL
            AND osm_waterareas.type <> 'riverbank'
            AND osm_waterareas.water NOT IN ('river', 'stream', 'canal', 'ditch')
        "
      />
    </>
  );
}
