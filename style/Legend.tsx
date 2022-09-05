import { Datasource, Layer } from "jsxnik/mapnikConfig";
import { DatasourceEx } from "./DatasourceEx";

export type Props = {
  legendLayers: {
    styles: string;
    geojson: unknown; // TODO GeoJSON
  }[];
};

export function Legend({ legendLayers }: Props) {
  return (
    <>
      {legendLayers.map((layer) => (
        <Layer name={layer.styles} srs="+init=epsg:4326">
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
