import { LineSymbolizer, RasterSymbolizer, Rule, Style, TextSymbolizer } from "jsxnik/mapnikConfig";
import { colors } from "./colors";
import { DatasourceEx } from "./DatasourceEx";
import { TextSymbolizerEx } from "./TextSymbolizerEx";
import { GdalLayer } from "./GdalLayer";
import { RuleEx } from "./RuleEx";
import { SqlLayer } from "./SqlLayer";
import { StyledLayer } from "./StyledLayer";

type Props0 = {
  cc: string;
  cutCcs: string[];
  contours: boolean;
  shading: boolean;
};

const contoursDflt: Partial<Parameters<typeof LineSymbolizer & typeof TextSymbolizerEx>[0]> = {
  smooth: 1,
  simplify: "5 * @scale",
  simplifyAlgorithm: "visvalingam-whyatt", // radial-distance would be better here but is buggy, see: https://github.com/mapnik/mapnik/issues/4347
};

function ContoursStyle() {
  return (
    <Style name="contours" opacity={0.33}>
      <RuleEx minZoom={13} maxZoom={14} filter="([height] % 100 = 0) and ([height] != 0)">
        <LineSymbolizer stroke={colors.contour} strokeWidth={0.4} {...contoursDflt} />

        <TextSymbolizerEx line fill={colors.contour} upright="left" {...contoursDflt}>
          [height]
        </TextSymbolizerEx>
      </RuleEx>

      <RuleEx minZoom={12} maxZoom={12} filter="([height] % 50 = 0) and ([height] != 0)">
        <LineSymbolizer stroke={colors.contour} strokeWidth={0.2} {...contoursDflt} />
      </RuleEx>

      <RuleEx minZoom={13} maxZoom={14} filter="([height] % 20 = 0) and ([height] != 0)">
        <LineSymbolizer stroke={colors.contour} strokeWidth={0.2} {...contoursDflt} />
      </RuleEx>

      <RuleEx minZoom={15} filter="([height] % 100 = 0) and ([height] != 0)">
        <LineSymbolizer stroke={colors.contour} strokeWidth={0.6} {...contoursDflt} />

        <TextSymbolizerEx line fill={colors.contour} upright="left" {...contoursDflt}>
          [height]
        </TextSymbolizerEx>
      </RuleEx>

      <RuleEx minZoom={15} filter="([height] % 10 = 0) and ([height] != 0)">
        <LineSymbolizer stroke={colors.contour} strokeWidth={0.3} {...contoursDflt} />
      </RuleEx>

      <RuleEx minZoom={15} filter="([height] % 50 = 0) and ([height] % 100 != 0)">
        <TextSymbolizerEx line fill={colors.contour} {...contoursDflt} upright="left">
          [height]
        </TextSymbolizerEx>
      </RuleEx>
    </Style>
  );
}

function HillshadeStyle() {
  return (
    <Style name="hillshade">
      <RuleEx /*minZoom={8}*/ maxZoom={8}>
        <RasterSymbolizer scaling="lanczos" opacity={1.0} />
      </RuleEx>

      <RuleEx minZoom={9} maxZoom={9}>
        <RasterSymbolizer scaling="lanczos" opacity={0.9} />
      </RuleEx>

      <RuleEx minZoom={10} maxZoom={11}>
        <RasterSymbolizer scaling="lanczos" opacity={0.75} />
      </RuleEx>

      <RuleEx minZoom={12} maxZoom={12}>
        <RasterSymbolizer scaling="lanczos" opacity={0.65} />
      </RuleEx>

      <RuleEx minZoom={13} maxZoom={13}>
        <RasterSymbolizer scaling="bilinear" opacity={0.55} />
      </RuleEx>

      <RuleEx minZoom={14} maxZoom={14}>
        <RasterSymbolizer scaling="bilinear" opacity={0.65} />
      </RuleEx>

      <RuleEx minZoom={15}>
        <RasterSymbolizer scaling="bilinear" opacity={0.8} />
      </RuleEx>
    </Style>
  );
}

function CountryShadingAndContours({ cc, cutCcs, contours, shading }: Props0) {
  return (
    <StyledLayer styleName="shadingAndContoursMask" compOp="src-over">
      <DatasourceEx
        params={{
          type: "gdal",
          file: `shading/${cc}/mask.tif`,
        }}
      />

      <SqlLayer
        styleName="sea" // any
        compOp="src-in"
        // some empty data
        sql={`SELECT wkb_geometry FROM contour_${cc}_split LIMIT 0`}
      >
        {contours && (
          <SqlLayer styleName="contours" minZoom={12} sql={`SELECT wkb_geometry, height FROM contour_${cc}_split`} />
        )}

        {shading && <GdalLayer styleName="hillshade" file={`shading/${cc}/final.tif`} />}

        {cutCcs.map((cutCc) => (
          <GdalLayer styleName="shadingAndContoursMask" compOp="dst-out" file={`shading/${cutCc}/mask.tif`} />
        ))}
      </SqlLayer>
    </StyledLayer>
  );
}

type Props = {
  contours: boolean;
  shading: boolean;
};

export function ShadingAndCountours({ contours, shading }: Props) {
  return (
    <>
      {/* hillshading helper for mask */}
      <Style name="shadingAndContoursMask">
        <Rule>
          <RasterSymbolizer scaling="bilinear" opacity={1} />
        </Rule>
      </Style>

      <ContoursStyle />

      <HillshadeStyle />

      <CountryShadingAndContours contours={contours} shading={shading} cc="at" cutCcs={["sk", "ch", "si"]} />

      <CountryShadingAndContours contours={contours} shading={shading} cc="it" cutCcs={["at", "ch", "si"]} />

      <CountryShadingAndContours contours={contours} shading={shading} cc="ch" cutCcs={[]} />

      <CountryShadingAndContours contours={contours} shading={shading} cc="si" cutCcs={[]} />

      <CountryShadingAndContours contours={contours} shading={shading} cc="pl" cutCcs={["sk"]} />

      <CountryShadingAndContours contours={contours} shading={shading} cc="sk" cutCcs={[]} />

      {/* to cut out detailed */}
      <SqlLayer
        styleName="sea" // any
        compOp="src-over"
        sql="SELECT geom FROM contour_split LIMIT 0" // some empty data
      >
        {["it", "at", "ch", "si", "pl", "sk"].map((cc) => (
          <GdalLayer styleName="shadingAndContoursMask" file={`shading/${cc}/mask.tif`} />
        ))}

        <SqlLayer
          styleName="sea" // any
          compOp="src-out"
          sql="SELECT geom FROM contour_split LIMIT 0" // some empty data
        >
          {contours && <SqlLayer styleName="contours" minZoom={12} sql="SELECT geom, height FROM contour_split" />}

          {shading && <GdalLayer styleName="hillshade" file="shading/final.tiff" />}
        </SqlLayer>
      </SqlLayer>
    </>
  );
}
