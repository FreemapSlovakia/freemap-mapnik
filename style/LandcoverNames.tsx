import { Style, TextSymbolizer } from "jsxnik/mapnikConfig";
import { colors, hsl } from "./colors";
import { TextSymbolizerEx } from "./TextSymbolizerEx";
import { Placements } from "./Placements";
import { RuleEx } from "./RuleEx";
import { SqlLayer } from "./SqlLayer";
import { seq } from "./utils";

export function LandcoverNames() {
  return (
    <>
      <Style name="landcover_names">
        {[false, true].map((natural) => {
          const s = natural ? { fill: colors.protected, fontsetName: "italic" } : { fill: colors.areaLabel };

          return seq(12, 17).map((z) => (
            <RuleEx
              filter={
                `(${natural ? "[natural]" : "not ([natural])"})` +
                (z === 17 ? "" : ` and [area] > ${2400000 / (1 << (2 * (z - 10)))}`)
              }
              minZoom={z}
              maxZoom={z === 17 ? undefined : z}
            >
              <TextSymbolizerEx wrap placement="interior" placementType="list" {...s}>
                {
                  "[name].replace('[Čč]istička odpadových vôd', 'ČOV').replace('[Pp]oľnohospodárske družstvo', 'PD').replace('[Nn]ámestie', 'nám.')"
                }
                <Placements />
              </TextSymbolizerEx>
            </RuleEx>
          ));
        })}
      </Style>

      <SqlLayer
        styleName="landcover_names"
        minZoom={12}
        bufferSize={1024}
        sql="
          SELECT
            osm_landusages.geometry, osm_landusages.name, osm_landusages.area,
            osm_landusages.type IN ('forest', 'wood', 'scrub', 'heath', 'grassland', 'scree', 'meadow', 'fell', 'wetland') AS natural
          FROM
            osm_landusages
          LEFT JOIN
            z_order_landuse USING (type)
          LEFT JOIN
            osm_feature_polys USING (osm_id)
          LEFT JOIN
            -- NOTE filtering some POIs (hacky because it affects also lower zooms)
            osm_sports on osm_landusages.osm_id = osm_sports.osm_id AND osm_sports.type IN ('soccer', 'tennis', 'basketball')
          WHERE
            osm_feature_polys.osm_id IS NULL AND osm_sports.osm_id IS NULL AND osm_landusages.geometry && !bbox!
          ORDER BY
            z_order, osm_feature_polys.osm_id
        "
      />
    </>
  );
}
