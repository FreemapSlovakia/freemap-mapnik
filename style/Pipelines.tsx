import { LineSymbolizer, Style } from "jsxnik/mapnikConfig";
import { colors } from "./colors";
import { RuleEx } from "./RuleEx";
import { SqlLayer } from "./SqlLayer";

export function Pipelines() {
  /* TODO split to several layers: underground/underwater, overground, overhead */

  return (
    <>
      <Style name="pipelines">
        <RuleEx minZoom={11} filter='[location] = "overground" or [location] = "overhead" or [location] = ""'>
          <LineSymbolizer stroke={colors.pipeline} strokeWidth={2} strokeLinejoin="round" />

          <LineSymbolizer
            stroke={colors.pipeline}
            strokeWidth={4}
            strokeLinejoin="round"
            strokeDasharray="0,15,1.5,1.5,1.5,1"
          />
        </RuleEx>

        <RuleEx minZoom={15} filter='[location] = "underground" or [location] = "underwater"'>
          <LineSymbolizer stroke={colors.pipeline} strokeWidth={2} strokeLinejoin="round" strokeOpacity={0.33} />

          <LineSymbolizer
            stroke={colors.pipeline}
            strokeWidth={4}
            strokeLinejoin="round"
            strokeDasharray="0,15,1.5,1.5,1.5,1"
            strokeOpacity={0.33}
          />
        </RuleEx>
      </Style>

      <SqlLayer
        styleName="pipelines"
        minZoom={13}
        sql="SELECT geometry, location FROM osm_pipelines WHERE geometry && !bbox!"
      />
    </>
  );
}
