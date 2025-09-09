import { DatasourceEx } from "./DatasourceEx.js";
import { StyledLayer } from "./StyledLayer.js";

type Props = {
  sql: string;
  geometryColumn?: string;
  children?: JSX.Element;
} & Omit<Parameters<typeof StyledLayer>[0], "children">;

export function SqlLayer({ sql, children, geometryColumn, ...rest }: Props) {
  const params: Record<string, string> = { table: `(${sql}) AS foo`, srid: "3857" };

  if (geometryColumn) {
    params.geometry_field = geometryColumn;
  }

  return (
    <StyledLayer {...rest}>
      <DatasourceEx base="db" params={params} />

      {children}
    </StyledLayer>
  );
}
