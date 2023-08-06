import { LineSymbolizer, Style } from "jsxnik/mapnikConfig";
import { colors } from "./colors";
import { RuleEx } from "./RuleEx";
import { SqlLayer } from "./SqlLayer";

export function Aeroways() {
  return (
    <>
      <SqlLayer
        styleName="aeroways"
        minZoom={11}
        sql="SELECT geometry, type FROM osm_aeroways WHERE geometry && !bbox!"
      />

      <Style name="aeroways">
        {(() => {
          const aeroBgLine = { stroke: colors.aeroway };
          const aeroFgLine = { stroke: "white", strokeWidth: 1 };

          return (
            <>
              <RuleEx minZoom={11} maxZoom={11}>
                <LineSymbolizer {...aeroBgLine} strokeWidth={3} />
                <LineSymbolizer {...aeroFgLine} strokeWidth={0.5} strokeDasharray="3,3" />
              </RuleEx>

              <RuleEx minZoom={12} maxZoom={13}>
                <LineSymbolizer {...aeroBgLine} strokeWidth={5} />
                <LineSymbolizer {...aeroFgLine} strokeDasharray="4,4" />
              </RuleEx>

              <RuleEx minZoom={14}>
                <LineSymbolizer {...aeroBgLine} strokeWidth={8} />
                <LineSymbolizer {...aeroFgLine} strokeDasharray="6,6" />
              </RuleEx>
            </>
          );
        })()}
      </Style>
    </>
  );
}
