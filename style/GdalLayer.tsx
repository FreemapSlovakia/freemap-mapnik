import { DatasourceEx } from "./DatasourceEx";
import { StyledLayer } from "./StyledLayer";

type Props = {
  file: string;
  children?: JSX.Element;
} & Omit<Parameters<typeof StyledLayer>[0], "children">;

export function GdalLayer({ file, children, ...rest }: Props) {
  return (
    <StyledLayer {...rest}>
      <DatasourceEx params={{ type: "gdal", file }} />

      {children}
    </StyledLayer>
  );
}
