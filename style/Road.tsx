import { LineSymbolizer } from "jsxnik/mapnikConfig";
import { colors } from "./colors";

type Props = { strokeWidth: number | string } & Parameters<typeof LineSymbolizer>[0];

export function Road(props: Props) {
  return (
    <>
      <LineSymbolizer stroke={colors.track} strokeLinejoin="round" {...props} />

      <LineSymbolizer
        stroke="black"
        strokeWidth="[bridge]"
        strokeLinejoin="round"
        offset={`${props.strokeWidth} / 2 + 1`}
      />

      <LineSymbolizer
        stroke="black"
        strokeWidth="[bridge]"
        strokeLinejoin="round"
        offset={`-${props.strokeWidth} / 2 - 1`}
      />

      <LineSymbolizer
        stroke="black"
        strokeWidth="[tunnel]"
        strokeLinejoin="round"
        offset={`-${props.strokeWidth} / 2 + 1`}
        strokeDasharray="3,3"
        strokeOpacity={0.5}
      />

      <LineSymbolizer
        stroke="black"
        strokeWidth="[tunnel]"
        strokeLinejoin="round"
        offset={-props.strokeWidth / 2 - 1}
        strokeDasharray="3,3"
        strokeOpacity={0.5}
      />

      <LineSymbolizer
        strokeOpacity={0.8}
        stroke="#ccc"
        strokeWidth={`[tunnel] * (${props.strokeWidth} + 2)`}
        strokeLinejoin="round"
      />
    </>
  );
}
