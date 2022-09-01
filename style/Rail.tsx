import { LineSymbolizer } from "jsxnik/mapnikConfig";

type Props = {
  color: string;
  weight: number;
  sleeperWeight: number;
  spacing: number;
  glowWidth: number;
};

export function Rail({ color, weight, sleeperWeight, spacing, glowWidth }: Props) {
  const gw = weight + glowWidth * 2;

  const sgw = sleeperWeight + glowWidth * 2;

  return (
    <>
      {glowWidth !== undefined && (
        <>
          <LineSymbolizer stroke="white" strokeWidth={gw} />

          <LineSymbolizer
            stroke="white"
            strokeWidth={sgw}
            strokeDasharray={`0,${(spacing - gw) / 2},${gw},${(spacing - gw) / 2}`}
          />
        </>
      )}

      <LineSymbolizer stroke={color} strokeWidth={weight} />

      <LineSymbolizer
        stroke={color}
        strokeWidth={sleeperWeight}
        strokeDasharray={`0,${(spacing - weight) / 2},${weight},${(spacing - weight) / 2}`}
      />

      <LineSymbolizer stroke="black" strokeWidth="[bridge]" offset={sgw / 2} />

      <LineSymbolizer stroke="black" strokeWidth="[bridge]" offset={-sgw / 2} />

      <LineSymbolizer
        stroke="black"
        strokeWidth="[tunnel]"
        offset={sgw / 2}
        strokeDasharray="3,3"
        strokeOpacity={0.5}
      />

      <LineSymbolizer
        stroke="black"
        strokeWidth="[tunnel]"
        offset={-sgw / 2}
        strokeDasharray="3,3"
        strokeOpacity={0.5}
      />

      <LineSymbolizer strokeOpacity={0.8} stroke="#ccc" strokeWidth={`[tunnel] * ${sgw}`} />
    </>
  );
}
