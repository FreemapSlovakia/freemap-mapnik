import { LineSymbolizer } from "jsxnik/mapnikConfig";
import { colors } from "./colors";

type Props = { strokeWidth: number } & Parameters<typeof LineSymbolizer>[0];

export function Road(props: Props) {
  return (
    <>
      <LineSymbolizer stroke={colors.track} strokeLinejoin="round" {...props} />

      <LineSymbolizer stroke="black" strokeWidth="[bridge]" offset={props.strokeWidth / 2 + 1} />

      <LineSymbolizer stroke="black" strokeWidth="[bridge]" offset={-props.strokeWidth / 2 - 1} />

      <LineSymbolizer
        stroke="black"
        strokeWidth="[tunnel]"
        offset={props.strokeWidth / 2 + 1}
        strokeDasharray="3,3"
        strokeOpacity={0.5}
      />

      <LineSymbolizer
        stroke="black"
        strokeWidth="[tunnel]"
        offset={-props.strokeWidth / 2 - 1}
        strokeDasharray="3,3"
        strokeOpacity={0.5}
      />

      <LineSymbolizer strokeOpacity={0.8} stroke="#ccc" strokeWidth={`[tunnel] * ${props.strokeWidth + 2}`} />
    </>
  );
}
