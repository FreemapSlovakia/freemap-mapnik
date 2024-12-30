import { Style } from "jsxnik/mapnikConfig";
import { colors } from "./colors.js";
import { TextSymbolizerEx } from "./TextSymbolizerEx.js";
import { RuleEx } from "./RuleEx.js";
import { SqlLayer } from "./SqlLayer.js";

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
