import { LineSymbolizer, PolygonSymbolizer } from "jsxnik/mapnikConfig";

type Props = { color: string };

export function BorderedPolygonSymbolizer({ color }: Props) {
  return (
    <>
      <PolygonSymbolizer fill={color} />
      <LineSymbolizer stroke={color} strokeWidth={1} />
    </>
  );
}
