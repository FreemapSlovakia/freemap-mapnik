import { DatasourceEx } from "./DatasourceEx";
import { StyledLayer } from "./StyledLayer";

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
