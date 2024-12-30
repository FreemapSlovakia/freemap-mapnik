import { DatasourceEx } from "./DatasourceEx.js";
import { StyledLayer } from "./StyledLayer.js";

type Props = {
  file: string;
  children?: JSX.Element;
} & Omit<Parameters<typeof StyledLayer>[0], "children">;

export function ShpLayer({ file, children, ...rest }: Props) {
  return (
    <StyledLayer {...rest}>
      <DatasourceEx params={{ type: "shape", file }} />

      {children}
    </StyledLayer>
  );
}
