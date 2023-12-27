import { LineSymbolizer, RasterSymbolizer, Rule, Style, TextSymbolizer } from "jsxnik/mapnikConfig";
import { colors } from "./colors";
import { DatasourceEx } from "./DatasourceEx";
import { TextSymbolizerEx } from "./TextSymbolizerEx";
import { GdalLayer } from "./GdalLayer";
import { RuleEx } from "./RuleEx";
import { SqlLayer } from "./SqlLayer";
import { StyledLayer } from "./StyledLayer";
import { seq } from "./utils";

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
  const zooms = seq(7, 19);

  return (
    <Style name="hillshade">
      {zooms.map((z, i) => (
        <RuleEx minZoom={i === 0 ? undefined : z} maxZoom={i === zooms.length - 1 ? undefined : z}>
          <RasterSymbolizer scaling="lanczos" opacity={Math.min(1, 1 - Math.log(z - 7) / 5)} />
        </RuleEx>
      ))}
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
          <SqlLayer
            styleName="contours"
            minZoom={12}
            sql={`SELECT wkb_geometry, height FROM contour_${cc}_split WHERE wkb_geometry && !bbox!`}
          />
        )}

        {shading && <GdalLayer styleName="hillshade" file={`shading/${cc}/final.tif`} />}

        {cutCcs.map((cutCc) => (
          <GdalLayer styleName="shadingAndContoursMask" compOp="dst-out" file={`shading/${cutCc}/mask.tif`} />
        ))}

        {/* bridges above shading and below roads */}
        <SqlLayer
          styleName="bridge_area"
          minZoom={15}
          compOp="dst-out"
          sql="SELECT geometry FROM osm_landusages WHERE geometry && !bbox! AND type = 'bridge'"
        />
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

      <CountryShadingAndContours contours={contours} shading={shading} cc="at" cutCcs={["sk", "ch", "si", "cz"]} />

      <CountryShadingAndContours contours={contours} shading={shading} cc="it" cutCcs={["at", "ch", "si", "fr"]} />

      <CountryShadingAndContours contours={contours} shading={shading} cc="ch" cutCcs={[]} />

      <CountryShadingAndContours contours={contours} shading={shading} cc="si" cutCcs={[]} />

      <CountryShadingAndContours contours={contours} shading={shading} cc="cz" cutCcs={["sk", "pl"]} />

      <CountryShadingAndContours contours={contours} shading={shading} cc="pl" cutCcs={["sk"]} />

      <CountryShadingAndContours contours={contours} shading={shading} cc="sk" cutCcs={[]} />

      <CountryShadingAndContours contours={contours} shading={shading} cc="fr" cutCcs={["ch"]} />

      {/* to cut out detailed */}
      <SqlLayer
        styleName="sea" // any
        compOp="src-over"
        sql="SELECT ST_SetSRID(ST_MakePoint(0, 0), 3857) AS geom LIMIT 0" // some empty data
      >
        {["it", "at", "ch", "si", "pl", "sk", "cz", "fr"].map((cc) => (
          <GdalLayer styleName="shadingAndContoursMask" file={`shading/${cc}/mask.tif`} />
        ))}

        <SqlLayer
          styleName="sea" // any
          compOp="src-out"
          sql="SELECT ST_SetSRID(ST_MakePoint(0, 0), 3857) AS geom LIMIT 0" // some empty data
        >
          {contours && (
            <SqlLayer
              styleName="contours"
              minZoom={12}
              sql="SELECT geom, height FROM contour_split WHERE geom && !bbox!"
            />
          )}

          {shading && <GdalLayer styleName="hillshade" file="shading/final.tiff" />}
        </SqlLayer>
      </SqlLayer>
    </>
  );
}
