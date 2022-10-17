import { LineSymbolizer, MarkersSymbolizer, Style } from "jsxnik/mapnikConfig";
import { colors } from "./colors";
import { RuleEx } from "./RuleEx";
import { SqlLayer } from "./SqlLayer";
import { seq } from "./utils";

// see https://github.com/mapnik/mapnik/issues/4349
const sqls: Record<number, string> = {
  12: "ST_Segmentize(ST_Simplify(geometry, 24), 200) AS geometry",
  13: "ST_Segmentize(ST_Simplify(geometry, 12), 200) AS geometry",
  14: "ST_Segmentize(ST_Simplify(geometry, 6), 200) AS geometry",
  15: "geometry",
};

export function WaterLine() {
  return (
    <>
      <SqlLayer
        styleName="water_line"
        maxZoom={9}
        sql="
          SELECT geometry, type, tunnel, CASE WHEN intermittent OR seasonal THEN '6,3' ELSE '1000,0' END AS dasharray
          FROM osm_waterways_gen0
          WHERE geometry && !bbox!
        "
      />

      <SqlLayer
        styleName="water_line"
        minZoom={10}
        maxZoom={11}
        sql="
          SELECT geometry, type, tunnel, CASE WHEN intermittent OR seasonal THEN '6,3' ELSE '1000,0' END AS dasharray
          FROM osm_waterways_gen1
          WHERE geometry && !bbox!"
      />

      {["water_line_glow", "water_line"].map((name) =>
        seq(12, 15).map((z) => (
          <>
            <SqlLayer
              styleName={name}
              minZoom={z}
              maxZoom={z >= 15 ? undefined : z}
              sql={`
                SELECT
                  ${sqls[z]},
                  type,
                  tunnel,
                  CASE WHEN intermittent OR seasonal THEN '6,3' ELSE '1000,0' END AS dasharray
                FROM
                  osm_waterways
                WHERE
                  geometry && !bbox!
            `}
              cacheFeatures
            />
          </>
        ))
      )}

      <Style name="water_line_glow">
        <RuleEx type="river">
          <LineSymbolizer
            stroke="white"
            strokeWidth={3.4}
            strokeOpacity="0.5 - [tunnel] / 0.6"
            strokeDasharray="[dasharray]"
            smooth={0.5}
          />
        </RuleEx>

        <RuleEx filter="[type] <> 'river'" minZoom={12}>
          <LineSymbolizer
            stroke="white"
            strokeWidth="((@zoom = 12) * 2) +  ((@zoom > 12) * 2.4)"
            strokeOpacity="0.5 - [tunnel] / 0.6"
            strokeDasharray="[dasharray]"
            smooth={0.5}
          />
        </RuleEx>
      </Style>

      <Style name="water_line">
        <RuleEx minZoom={0} maxZoom={8} type="river">
          <LineSymbolizer stroke={colors.water} strokeWidth="pow(1.5, @zoom - 8)" />
        </RuleEx>

        <RuleEx minZoom={9} maxZoom={9} type="river">
          <LineSymbolizer stroke={colors.water} strokeWidth={1.5} />
        </RuleEx>

        <RuleEx minZoom={10} maxZoom={11} type="river">
          <LineSymbolizer
            stroke={colors.water}
            strokeWidth={2.2}
            strokeOpacity="1 - [tunnel] / 0.6"
            strokeDasharray="[dasharray]"
          />
        </RuleEx>

        <RuleEx minZoom={12} type="river">
          <LineSymbolizer
            stroke={colors.water}
            strokeWidth={2.2}
            strokeOpacity="1 - [tunnel] / 0.6"
            strokeDasharray="[dasharray]"
            smooth={0.5}
          />
        </RuleEx>

        <RuleEx minZoom={12} filter="[type] <> 'river'">
          <LineSymbolizer
            stroke={colors.water}
            strokeWidth="((@zoom = 12) * 1) +  ((@zoom > 12) * 1.2)"
            strokeOpacity="1 - [tunnel] / 0.6"
            strokeDasharray="[dasharray]"
            smooth={0.5}
          />
        </RuleEx>

        <RuleEx minZoom={14}>
          <MarkersSymbolizer smooth={0.5} file="images/waterway-arrow.svg" spacing={300} placement="line" />
        </RuleEx>
      </Style>
    </>
  );
}
