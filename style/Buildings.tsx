import { PolygonSymbolizer, Style } from "jsxnik/mapnikConfig";
import { colors } from "./colors";
import { RuleEx } from "./RuleEx";
import { SqlLayer } from "./SqlLayer";

export function Buildings() {
  return (
    <>
      <Style name="buildings">
        <RuleEx minZoom={13}>
          <PolygonSymbolizer fill={colors.building} />
        </RuleEx>
      </Style>

      <SqlLayer styleName="buildings" sql="SELECT geometry, type FROM osm_buildings  WHERE type <> 'no'" minZoom={13} />
    </>
  );
}
