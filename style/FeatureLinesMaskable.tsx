import { LinePatternSymbolizer, LineSymbolizer, Style } from "jsxnik/mapnikConfig";
import { colors } from "./colors";
import { GdalLayer } from "./GdalLayer";
import { RuleEx } from "./RuleEx";
import { SqlLayer } from "./SqlLayer";

type Props = { shading: boolean };

export function FeatureLinesMaskable({ shading }: Props) {
  return (
    <>
      <Style name="feature_lines_maskable">
        <RuleEx minZoom={13} type="cliff">
          <LinePatternSymbolizer file="images/cliff.svg" />

          <LineSymbolizer stroke={colors.areaLabel} strokeWidth={1} />
        </RuleEx>

        <RuleEx minZoom={14} type="earth_bank">
          <LinePatternSymbolizer file="images/earth_bank.svg" />
        </RuleEx>

        <RuleEx minZoom={16} type="dyke">
          <LinePatternSymbolizer file="images/dyke.svg" />
        </RuleEx>

        <RuleEx minZoom={16} type="embankment">
          <LinePatternSymbolizer file="images/embankment-half.svg" />
        </RuleEx>

        <RuleEx minZoom={16} type="gully">
          <LinePatternSymbolizer file="images/gully.svg" />
        </RuleEx>
      </Style>

      {shading ? (
        <SqlLayer
          styleName="feature_lines_maskable"
          minZoom={13}
          compOp="src-over"
          // TODO for effectivity filter out cliffs/earth_banks
          sql="
            SELECT geometry, type
            FROM osm_feature_lines
            WHERE type NOT IN ('cutline', 'valley', 'ridge') AND geometry && !bbox!
          "
        >
          {["pl", "sk" /*, "at", "ch" (AT / CH is not so detailed) */].map((cc) => (
            <GdalLayer styleName="shadingAndContoursMask" compOp="dst-out" file={`shading/${cc}/mask.tif`} />
          ))}
        </SqlLayer>
      ) : (
        <SqlLayer
          styleName="feature_lines_maskable"
          minZoom={13}
          sql="
            SELECT geometry, type
            FROM osm_feature_lines
            WHERE type NOT IN ('cutline', 'valley', 'ridge') AND geometry && !bbox!
          "
        />
      )}
    </>
  );
}
