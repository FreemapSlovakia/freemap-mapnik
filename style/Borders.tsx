import { LineSymbolizer, Style } from "jsxnik/mapnikConfig";
import { colors } from "./colors";
import { RuleEx } from "./RuleEx";
import { SqlLayer } from "./SqlLayer";

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
        sql="
          SELECT ST_LineMerge(ST_Collect(geometry)) AS geometry
          FROM osm_admin
          WHERE admin_level = 2 AND geometry && !bbox!
        "
      />
    </>
  );
}
