import { LineSymbolizer, Style } from "jsxnik/mapnikConfig";
import { colors } from "./colors.js";
import { RuleEx } from "./RuleEx.js";
import { SqlLayer } from "./SqlLayer.js";

type Props = {
  forLowzoom?: boolean;
};

export function Borders({ forLowzoom }: Props) {
  return (
    <>
      {!forLowzoom && (
        <Style name="borders">
          <RuleEx maxZoom={10}>
            <LineSymbolizer
              stroke={colors.adminBorder}
              strokeWidth="0.5 + 6 * pow(1.4, @zoom - 11)"
              strokeLinejoin="round"
            />
          </RuleEx>

          <RuleEx minZoom={11}>
            <LineSymbolizer stroke={colors.adminBorder} strokeWidth={6} strokeLinejoin="round" />
          </RuleEx>
        </Style>
      )}

      <SqlLayer
        maxZoom={forLowzoom ? 7 : undefined}
        minZoom={forLowzoom ? undefined : 8}
        styleName="borders"
        opacity={0.5}
        geometryColumn="geometry"
        sql="
          WITH segs AS (
            SELECT DISTINCT ON (m.member)
              m.member,
              m.geometry
            FROM osm_admin_members m
            JOIN osm_admin_relations r
              ON r.osm_id = m.osm_id
              AND r.admin_level = 2
            WHERE
              m.type = 1
              AND m.geometry && !bbox!
          )
          SELECT ST_LineMerge(ST_Collect(geometry)) AS geometry
          FROM segs
        "
      />
    </>
  );
}
