import { Style, TextSymbolizer } from "jsxnik/mapnikConfig";
import { colors } from "./colors";
import { TextSymbolizerEx } from "./TextSymbolizerEx";
import { RuleEx } from "./RuleEx";
import { SqlLayer } from "./SqlLayer";

export function HighwayNames() {
  return (
    <>
      <Style name="highway_names">
        <RuleEx minZoom={15}>
          <TextSymbolizerEx line fill={colors.track}>
            [name]
          </TextSymbolizerEx>
        </RuleEx>
      </Style>

      <SqlLayer
        styleName="highway_names"
        minZoom={15}
        bufferSize={1024}
        sql="
          SELECT name, ST_LineMerge(ST_Collect(geometry)) AS geometry, type
          FROM osm_roads
          WHERE geometry && !bbox! AND name <> ''
          GROUP BY z_order, name, type
          ORDER BY z_order DESC
        "
      />
    </>
  );
}
