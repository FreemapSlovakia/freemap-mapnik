import { LineSymbolizer, Style } from "jsxnik/mapnikConfig";
import { hsl } from "./colors";
import { RuleEx } from "./RuleEx";
import { SqlLayer } from "./SqlLayer";

export function Borders() {
  return (
    <>
      <Style name="borders">
        <RuleEx maxZoom={10}>
          <LineSymbolizer
            stroke={hsl(278, 100, 50)}
            strokeWidth="0.5 + 6 * pow(1.4, @zoom - 11)"
            strokeLinejoin="round"
          />
        </RuleEx>

        <RuleEx minZoom={11}>
          <LineSymbolizer stroke={hsl(278, 100, 50)} strokeWidth={6} strokeLinejoin="round" />
        </RuleEx>
      </Style>

      <SqlLayer
        styleName="borders"
        opacity={0.5}
        sql="
          SELECT ST_LineMerge(ST_Collect(geometry)) AS geometry
          FROM osm_admin
          WHERE admin_level = 2 AND geometry && !bbox!
        "
      />
    </>
  );
}
