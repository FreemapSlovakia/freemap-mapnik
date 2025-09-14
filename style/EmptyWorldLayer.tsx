import { DatasourceEx } from "./DatasourceEx.js";
import { StyledLayer, StyledLayerProps } from "./StyledLayer.js";

type Props = Partial<Pick<StyledLayerProps, "children">> & Omit<StyledLayerProps, "styleName" | "children">;

const inline = JSON.stringify({
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "MultiPoint",
        coordinates: [
          [-180.0, -85.05112878],
          [180.0, 85.05112878],
        ],
      },
      properties: {},
    },
  ],
});

export function EmptyWorldLayer({ children, ...rest }: Props) {
  return (
    <StyledLayer
      {...rest}
      styleName="sea" // any
      srs="epsg:4326"
    >
      <DatasourceEx
        params={{
          type: "geojson",
          inline,
        }}
      />

      {children}
    </StyledLayer>
  );
}
