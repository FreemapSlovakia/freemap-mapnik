import { Layer, StyleName } from "jsxnik/mapnikConfig";
import { zoomDenoms } from "./utils";

type Props = {
  styleName: string | string[];
  maxZoom?: number;
  minZoom?: number;
} & Parameters<typeof Layer>[0];

let _enabled = true;

export function setLayersEnabled(enabled: boolean) {
  _enabled = enabled;
}

export function StyledLayer({ styleName, children, maxZoom, minZoom, ...rest }: Props) {
  return (
    _enabled && (
      <Layer
        maximumScaleDenominator={minZoom && zoomDenoms[minZoom]}
        minimumScaleDenominator={maxZoom && zoomDenoms[maxZoom + 1]}
        {...rest}
      >
        {Array.isArray(styleName) ? (
          styleName.map((s) => <StyleName>{s}</StyleName>)
        ) : (
          <StyleName>{styleName}</StyleName>
        )}

        {children}
      </Layer>
    )
  );
}
