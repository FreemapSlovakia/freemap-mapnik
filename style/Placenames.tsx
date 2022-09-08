import { Style, TextSymbolizer } from "jsxnik/mapnikConfig";
import { font } from "./fontFactory";
import { Placements } from "./Placements";
import { RuleEx } from "./RuleEx";
import { SqlLayer } from "./SqlLayer";

const scaleFormula = "2.5 * pow(1.2, @zoom)";

export function PlaceNames2() {
  const placenamesFontStyle = font().wrap().end({
    margin: 3,
    haloFill: "white",
    opacity: "0.5 + ((@zoom <= 14) * 0.5)",
    haloOpacity: "(0.5 + ((@zoom <= 14) * 0.5)) * 0.9",
    fontsetName: "narrow bold",
    characterSpacing: 1,
    placementType: "list",
  });

  return (
    <>
      <Style name="placenames">
        <RuleEx minZoom={6} type="city">
          <TextSymbolizer
            {...placenamesFontStyle}
            haloRadius={2}
            textTransform="uppercase"
            size={`1.2 * ${scaleFormula}`}
          >
            [name]
            <Placements />
          </TextSymbolizer>
        </RuleEx>

        <RuleEx minZoom={9} type="town">
          <TextSymbolizer
            {...placenamesFontStyle}
            haloRadius={2}
            textTransform="uppercase"
            size={`0.8 * ${scaleFormula}`}
          >
            [name]
            <Placements />
          </TextSymbolizer>
        </RuleEx>

        <RuleEx minZoom={11} type="village">
          <TextSymbolizer
            {...placenamesFontStyle}
            haloRadius={1.5}
            textTransform="uppercase"
            size={`0.55 * ${scaleFormula}`}
          >
            [name]
            <Placements />
          </TextSymbolizer>
        </RuleEx>

        <RuleEx minZoom={12} type={["suburb", "hamlet"]}>
          <TextSymbolizer {...placenamesFontStyle} haloRadius={1.5} size={`0.5 * ${scaleFormula}`}>
            [name]
            <Placements />
          </TextSymbolizer>
        </RuleEx>
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
