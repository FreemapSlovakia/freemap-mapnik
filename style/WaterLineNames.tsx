import { Style, TextSymbolizer } from "jsxnik/mapnikConfig";
import { font } from "./fontFactory";
import { RuleEx } from "./RuleEx";
import { SqlLayer } from "./SqlLayer";

export function WaterLineNames() {
  return (
    <>
      <Style name="water_line_names">
        <RuleEx minZoom={12} type="river">
          <TextSymbolizer
            smooth={0.5}
            {...font().water().line(400).end({
              characterSpacing: 2,
              simplifyAlgorithm: "douglas-peucker",
              simplify: 10,
              "max-char-angle-delta": 30,
            })}
          >
            [name]
          </TextSymbolizer>
        </RuleEx>

        <RuleEx minZoom={14} filter="[type] <> 'river'">
          <TextSymbolizer
            smooth={0.5}
            {...font().water().line(300).end({
              characterSpacing: 2,
              simplifyAlgorithm: "douglas-peucker",
              simplify: 10,
              "max-char-angle-delta": 30,
            })}
          >
            [name]
          </TextSymbolizer>
        </RuleEx>
      </Style>

      <SqlLayer
        styleName="water_line_names"
        minZoom={12}
        maxZoom={13}
        bufferSize={2048}
        // `SELECT ${process.env.FM_CUSTOM_SQL || ''} geometry, name, type FROM osm_waterways WHERE type = 'river' AND name <> ''`,
        sql={`
          SELECT ${process.env.FM_CUSTOM_SQL || ""} ST_LineMerge(ST_Collect(geometry)) AS geometry, name, type
          FROM osm_waterways
          WHERE geometry && !bbox! AND type = 'river' AND name <> ''
          GROUP BY name, type
        `}
      />

      <SqlLayer
        styleName="water_line_names"
        minZoom={14}
        bufferSize={2048}
        // `SELECT ${process.env.FM_CUSTOM_SQL || ''} geometry, name, type FROM osm_waterways WHERE name <> ''`,
        sql={`
          SELECT ${process.env.FM_CUSTOM_SQL || ""} ST_LineMerge(ST_Collect(geometry)) AS geometry, name, type
          FROM osm_waterways WHERE geometry && !bbox! AND name <> ''
          GROUP BY name, type
        `}
      />
    </>
  );
}
