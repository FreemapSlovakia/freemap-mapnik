import { Layer, StyleName } from "jsxnik/mapnikConfig";
import { DatasourceEx } from "./DatasourceEx";

export type Props = {
  legendLayers: {
    styles: string[];
    geojson: unknown; // TODO GeoJSON
  }[];
};

export function Legend({ legendLayers }: Props) {
  return (
    <>
      {legendLayers.map((layer) => (
        <Layer srs="+init=epsg:4326">
          {layer.styles.map((style) => (
            <StyleName>{style}</StyleName>
          ))}

          <DatasourceEx
            params={{
              type: "geojson",
              inline: JSON.stringify(layer.geojson),
            }}
          />
        </Layer>
      ))}
    </>
  );
}
