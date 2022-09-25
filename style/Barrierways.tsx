import { LineSymbolizer, Style } from "jsxnik/mapnikConfig";
import { hsl } from "./colors";
import { RuleEx } from "./RuleEx";
import { SqlLayer } from "./SqlLayer";

export function Barrierways() {
  return (
    <>
      <Style name="barrierways">
        <RuleEx minZoom={16}>
          <LineSymbolizer stroke={hsl(0, 100, 50)} strokeWidth={1} strokeDasharray="2,1" />
        </RuleEx>
      </Style>

      <SqlLayer
        styleName="barrierways"
        sql="SELECT geometry, type FROM osm_barrierways WHERE geometry && !bbox!"
        minZoom={16}
      />
    </>
  );
}
