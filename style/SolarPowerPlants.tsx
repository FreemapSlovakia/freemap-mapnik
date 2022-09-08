import { LineSymbolizer, PolygonPatternSymbolizer, Style } from "jsxnik/mapnikConfig";
import { hsl } from "./colors";
import { RuleEx } from "./RuleEx";
import { SqlLayer } from "./SqlLayer";

export function SolarPowerPlants() {
  return (
    <>
      <Style name="solar_power_plants">
        <RuleEx minZoom={12} maxZoom={14}>
          <PolygonPatternSymbolizer file="images/solar_small.svg" alignment="global" />
          <LineSymbolizer stroke={hsl(176, 153, 200)} strokeWidth={1} />
        </RuleEx>

        <RuleEx minZoom={15}>
          <PolygonPatternSymbolizer file="images/solar.svg" alignment="global" />
          <LineSymbolizer stroke={hsl(176, 153, 200)} strokeWidth={1} />
        </RuleEx>
      </Style>

      <SqlLayer
        styleName="solar_power_plants"
        minZoom={12}
        sql="SELECT geometry FROM osm_power_generators WHERE source = 'solar'"
      />
    </>
  );
}
