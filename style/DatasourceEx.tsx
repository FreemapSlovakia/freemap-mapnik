import { Datasource, Parameter } from "jsxnik/mapnikConfig";

type Props = {
  params: Record<string, string>;
} & Omit<Parameters<typeof Datasource>[0], "children">;

export function DatasourceEx({ params, ...rest }: Props) {
  return (
    <Datasource {...rest}>
      {Object.entries(params).map(([name, value]) => (
        <Parameter name={name}>{value}</Parameter>
      ))}
    </Datasource>
  );
}
