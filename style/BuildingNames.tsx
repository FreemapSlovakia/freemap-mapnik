import { Style, TextSymbolizer } from "jsxnik/mapnikConfig";
import { TextSymbolizerEx } from "./TextSymbolizerEx";
import { Placements } from "./Placements";
import { RuleEx } from "./RuleEx";
import { SqlLayer } from "./SqlLayer";

export function BuildingNames() {
  return (
    <>
      <Style name="building_names">
        <RuleEx minZoom={17}>
          <TextSymbolizerEx wrap placement="interior" placementType="list">
            [name]
            <Placements />
          </TextSymbolizerEx>
        </RuleEx>
      </Style>

      <SqlLayer
        styleName="building_names"
        bufferSize={512}
        minZoom={17}
        sql="
          SELECT osm_buildings.name, osm_buildings.geometry
          FROM osm_buildings
          LEFT JOIN osm_landusages USING (osm_id)
          LEFT JOIN osm_feature_polys USING (osm_id)
          LEFT JOIN osm_features USING (osm_id)
          LEFT JOIN osm_place_of_worships USING (osm_id)
          LEFT JOIN osm_sports USING (osm_id)
          LEFT JOIN osm_ruins USING (osm_id)
          LEFT JOIN osm_towers USING (osm_id)
          LEFT JOIN osm_shops USING (osm_id)
          WHERE
            osm_buildings.geometry && !bbox!
              AND osm_buildings.type <> 'no'
              AND osm_landusages.osm_id IS NULL
              AND osm_feature_polys.osm_id IS NULL
              AND osm_features.osm_id IS NULL
              AND osm_place_of_worships.osm_id IS NULL
              AND osm_sports.osm_id IS NULL
              AND osm_ruins.osm_id IS NULL
              AND osm_towers.osm_id IS NULL
              AND osm_shops.osm_id IS NULL
          ORDER BY osm_buildings.osm_id
        "
      />
    </>
  );
}
