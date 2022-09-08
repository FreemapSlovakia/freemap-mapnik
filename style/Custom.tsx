import { Layer, Raw, StyleName } from "jsxnik/mapnikConfig";
import { DatasourceEx } from "./DatasourceEx";

export type CustomProps = {
  styles: any[];
  layers: { styles: string[]; geojson: string }[];
};

export function Custom(custom: CustomProps) {
  return (
    <>
      <Raw>{custom.styles[0].style /* it is hacky to use freemap-mapserver without modification */}</Raw>

      {custom.layers.map((layer) => (
        <Layer srs="+init=epsg:4326">
          {layer.styles.map((styleName) => (
            <StyleName>{styleName}</StyleName>
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
