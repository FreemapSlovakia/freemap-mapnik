import { DatasourceEx } from "./DatasourceEx.js";
import { StyledLayer } from "./StyledLayer.js";

type Props = {
  sql: string;
  children?: JSX.Element;
} & Omit<Parameters<typeof StyledLayer>[0], "children">;

export function SqlLayer({ sql, children, ...rest }: Props) {
  return (
    <StyledLayer {...rest}>
      <DatasourceEx base="db" params={{ table: `(${sql}) AS foo` }} />

      {children}
    </StyledLayer>
  );
}
