import { DatasourceEx } from "./DatasourceEx.js";
import { StyledLayer, StyledLayerProps } from "./StyledLayer.js";

type Props = {
  file: string;
  children?: JSX.Element;
} & Omit<StyledLayerProps, "children">;

export function GdalLayer({ file, children, ...rest }: Props) {
  return (
    <StyledLayer {...rest}>
      <DatasourceEx params={{ type: "gdal", file }} />

      {children}
    </StyledLayer>
  );
}
