import { DatasourceEx } from "./DatasourceEx";
import { StyledLayer } from "./StyledLayer";

type Props = {
  sql: string;
  children?: JSX.Element;
} & Omit<Parameters<typeof StyledLayer>[0], "children">;

export function SqlLayer({ sql, children, ...rest }: Props) {
  return (
    <StyledLayer {...rest}>
      <DatasourceEx
        base="db"
        params={{
          table: `(${sql}) AS foo`,
          geometry_field: "geometry",
        }}
      />

      {children}
    </StyledLayer>
  );
}
