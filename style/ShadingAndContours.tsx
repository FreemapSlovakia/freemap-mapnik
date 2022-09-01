import { DatasourceEx } from "./DatasourceEx";
import { GdalLayer } from "./GdalLayer";
import { SqlLayer } from "./SqlLayer";
import { StyledLayer } from "./StyledLayer";

type Props = {
  cc: string;
  cutCcs: string[];
  contours: boolean;
  shading: boolean;
};

export function ShadingAndContours({ cc, cutCcs, contours, shading }: Props) {
  return (
    <StyledLayer styleName="mask" compOp="src-over">
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
        sql="SELECT wkb_geometry FROM contour_${cc}_split LIMIT 0"
      >
        {contours && (
          <SqlLayer styleName="contours" minZoom={12} sql="SELECT wkb_geometry, height FROM contour_${cc}_split" />
        )}

        {shading && (
          <GdalLayer styleName="hillshade" file={`shading/${cc}/final.tif`} />
        )}

        {cutCcs.map((cutCc) => (
          <GdalLayer styleName="mask" compOp="dst-out" file={`shading/${cutCc}/mask.tif`} />
        ))}
      </SqlLayer>
    </StyledLayer>
  );
}
