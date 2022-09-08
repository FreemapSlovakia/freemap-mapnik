import { Style, TextSymbolizer } from "jsxnik/mapnikConfig";
import { font } from "./fontFactory";
import { Placements } from "./Placements";
import { RuleEx } from "./RuleEx";
import { SqlLayer } from "./SqlLayer";
import { seq } from "./utils";

export function PlaceNames2() {
  return (
    <>
      <Style name="placenames">
        {seq(6, 19).map((z) => {
          const opacity = z <= 14 ? 1 : 0.5;

          const sc = 2.5 * Math.pow(1.2, z);

          // TODO wrap it respecting its size
          const placenamesFontStyle = font()
            .wrap()
            .end({
              margin: 3,
              haloFill: "white",
              opacity,
              haloOpacity: opacity * 0.9,
              fontsetName: "narrow bold",
              characterSpacing: 1,
              placementType: "list",
            });

          return (
            <>
              <RuleEx minZoom={z} maxZoom={z} type="city">
                <TextSymbolizer {...placenamesFontStyle} haloRadius={2} textTransform="uppercase" size={1.2 * sc}>
                  [name]
                  <Placements />
                </TextSymbolizer>
              </RuleEx>

              {z > 8 && (
                <RuleEx minZoom={z} maxZoom={z} type="town">
                  <TextSymbolizer {...placenamesFontStyle} haloRadius={2} textTransform="uppercase" size={0.8 * sc}>
                    [name]
                    <Placements />
                  </TextSymbolizer>
                </RuleEx>
              )}

              {z > 10 && (
                <RuleEx minZoom={z} maxZoom={z} type="village">
                  <TextSymbolizer {...placenamesFontStyle} haloRadius={1.5} textTransform="uppercase" size={0.55 * sc}>
                    [name]
                    <Placements />
                  </TextSymbolizer>
                </RuleEx>
              )}

              {z > 11 && (
                <RuleEx minZoom={z} maxZoom={z} type={["suburb", "hamlet"]}>
                  <TextSymbolizer {...placenamesFontStyle} haloRadius={1.5} size={0.5 * sc}>
                    [name]
                    <Placements />
                  </TextSymbolizer>
                </RuleEx>
              )}
            </>
          );
        })}
      </Style>

      <SqlLayer
        styleName="placenames"
        clearLabelCache
        bufferSize={1024}
        minZoom={15}
        sql="
          SELECT name, type, geometry
          FROM osm_places
          WHERE type <> 'locality' AND geometry && !bbox!
          ORDER BY z_order DESC, osm_id
        "
      />
    </>
  );
}

export function PlaceNames1() {
  return (
    <>
      <SqlLayer
        styleName="placenames"
        bufferSize={1024}
        maxZoom={8}
        clearLabelCache
        sql="
          SELECT name, type, geometry
          FROM osm_places
          WHERE type = 'city' AND geometry && !bbox!
          ORDER BY z_order DESC, osm_id
        "
      />

      <SqlLayer
        styleName="placenames"
        bufferSize={1024}
        minZoom={9}
        maxZoom={10}
        clearLabelCache
        sql="
          SELECT name, type, geometry
          FROM osm_places
          WHERE (type = 'city' OR type = 'town') AND geometry && !bbox!
          ORDER BY z_order DESC, osm_id
        "
      />

      <SqlLayer
        styleName="placenames"
        bufferSize={1024}
        minZoom={11}
        maxZoom={11}
        clearLabelCache
        sql="
          SELECT name, type, geometry
          FROM osm_places
          WHERE (type = 'city' OR type = 'town' OR type = 'village') AND geometry && !bbox!
          ORDER BY z_order DESC, osm_id
        "
      />

      <SqlLayer
        styleName="placenames"
        bufferSize={1024}
        minZoom={12}
        maxZoom={14}
        clearLabelCache
        sql="
          SELECT name, type, geometry
          FROM osm_places
          WHERE type <> 'locality' AND geometry && !bbox!
          ORDER BY z_order DESC, osm_id
        "
      />
    </>
  );
}
