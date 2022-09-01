import { Filter, MaxScaleDenominator, MinScaleDenominator, Rule } from "jsxnik/mapnikConfig";
import { types, zoomDenoms } from "./utils";

type Props = {
  minZoom?: number;
  maxZoom?: number;
  type?: string | string[];
  filter?: string;
  children: JSX.Element;
}

export function RuleEx({
  minZoom,
  maxZoom,
  type,
  filter,
  children,
}: Props) {
  return (
    <Rule>
      {minZoom !== undefined && <MinScaleDenominator>{zoomDenoms[minZoom]}</MinScaleDenominator>}
      {maxZoom !== undefined && <MaxScaleDenominator>{zoomDenoms[maxZoom]}</MaxScaleDenominator>}
      {type != undefined && <Filter>{types(...Array.isArray(type) ? type : [type])}</Filter>}
      {filter != undefined && <Filter>{filter}</Filter>}
      {children}
    </Rule>
  );
}
